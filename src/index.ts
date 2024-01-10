import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import express from 'express'
import { GraphQLError } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import gql from 'graphql-tag'
import { useServer } from 'graphql-ws/lib/use/ws'
import { createServer } from 'http'
import mongoose, { Schema, model } from 'mongoose'
import { WebSocketServer } from 'ws'

dotenv.config()

const commentSchema = new Schema({
  name: String,
  endDate: String,
})
const Comment = model('Comment', commentSchema)

const PORT = 4000

const typeDefs = gql`
  type Comment {
    id: ID!
    name: String!
    endDate: String!
  }

  type Query {
    comments: [Comment!]!
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
    comments: async () => await Comment.find({}),
  },

  Subscription: {
    commentCreated: {
      subscribe: () => pubSub.asyncIterator(['COMMENT_CREATED']),
    },
  },

  Mutation: {
    createComment: async (_, { name }) => {
      try {
        const comment = { name, endDate: new Date().toISOString() }

        const commentToSave = await Comment.create(comment)
        await commentToSave.save()

        pubSub.publish('COMMENT_CREATED', { commentCreated: commentToSave })

        return `Comment: ${name} was created!`
      } catch (error) {
        throw new GraphQLError('Error creating comment', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
          },
        })
      }
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
