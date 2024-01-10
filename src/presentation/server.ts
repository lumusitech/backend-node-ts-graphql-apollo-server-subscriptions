import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema'
import bodyParser from 'body-parser'
import express from 'express'
import { useServer } from 'graphql-ws/lib/use/ws'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { resolvers } from '../graphql/resolvers.js'
import { typeDefs } from '../graphql/typeDefs.js'

export const runServer = async () => {
  const PORT = 4000

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

  httpServer.listen(4000, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
  })
}
