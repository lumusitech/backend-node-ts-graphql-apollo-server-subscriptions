import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { GraphQLError } from 'graphql'
import gql from 'graphql-tag'
import { v1 as uuid } from 'uuid'

const users = [
  {
    id: '1',
    name: 'John',
    surname: 'Doe',
    street: '123 Main St',
    city: 'New York',
    zipCode: '10001',
    phone: '123-456-7890',
  },
  {
    id: '2',
    name: 'Jane',
    surname: 'Doe',
    street: '456 Main St',
    city: 'New York',
    zipCode: '10001',
    phone: '123-456-7890',
  },
]

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    surname: String!
    street: String!
    zipCode: Int!
    phone: String
    city: String!
    address: String!
  }

  type Query {
    allUsers: [User]
    usersCount: Int!
    findUserbyName(name: String!): User
    findUserById(id: ID!): User
  }

  type Mutation {
    addUser(
      name: String!
      surname: String!
      street: String!
      zipCode: Int!
      phone: String
      city: String!
    ): User
  }
`

const resolvers = {
  User: {
    address: parent => `${parent.street}, ${parent.city}, ${parent.zipCode}`,
  },

  Query: {
    allUsers: () => users,
    usersCount: () => users.length,
    findUserbyName: (parent, args) => users.find(user => user.name === args.name),
    findUserById: (parent, args) => users.find(user => user.id === args.id),
  },

  Mutation: {
    addUser: (parent, args) => {
      if (users.find(user => user.name === args.name)) {
        throw new GraphQLError('User already exists', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }
      const user = { ...args, id: uuid() }
      users.push(user)
      return user
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
})

console.log(`🚀  Server ready at: ${url}`)
