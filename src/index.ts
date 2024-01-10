import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema'
import bodyParser from 'body-parser'
import express from 'express'
import { PubSub } from 'graphql-subscriptions'
import { useServer } from 'graphql-ws/lib/use/ws'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import gql from 'graphql-tag'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const PORT = 4000

const typeDefs = gql`
  type Comment {
    name: String!
    endDate: String!
  }

  type Query {
    sayHello: String!
  }

  type Mutation {
    createComment(name: String!): String!
  }

  type Subscription {
    commentCreated: Comment!
  }
`
const pubSub = new PubSub()

const resolvers = {
  Query: {
    sayHello: () => 'Hello World!',
  },

  Subscription: {
    commentCreated: {
      subscribe: () => pubSub.asyncIterator(['COMMENT_CREATED']),
    },
  },

  Mutation: {
    createComment: (_, { name }) => {
      const comment = { name, endDate: new Date().toISOString() }

      // TODO: save comment to some database or with an api rest service
      pubSub.publish('COMMENT_CREATED', { commentCreated: comment })
      return `Comment: ${name} was created!`
    },
  },
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

const app = express()

const httpServer = createServer(app)

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
})

const wsServercleanup = useServer({ schema }, wsServer)

const apolloServer = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await wsServercleanup.dispose()
          },
        }
      },
    },
  ],
})

await apolloServer.start()

app.use('/graphql', bodyParser.json(), expressMiddleware(apolloServer))

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    console.log('📣 connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

httpServer.listen(4000, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
})
