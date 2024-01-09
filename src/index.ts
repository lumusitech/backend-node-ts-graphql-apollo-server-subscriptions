import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { GraphQLError } from 'graphql'
import gql from 'graphql-tag'
import { v1 as uuid } from 'uuid'

// Demo response from reqres.in api: https://reqres.in/api/users?page=2
const users = [
  {
    id: '7',
    email: 'michael.lawson@reqres.in',
    first_name: 'Michael',
    last_name: 'Lawson',
    avatar: 'https://reqres.in/img/faces/7-image.jpg',
  },
  {
    id: '8',
    email: 'tom@reqres.in',
    first_name: 'Tom',
    last_name: 'Lee',
    avatar: 'https://reqres.in/img/faces/8-image.jpg',
  },
]

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    first_name: String!
    last_name: String!
    avatar: String
    completeName: String
  }

  type Query {
    allUsers: [User]
    usersCount: Int! @deprecated(reason: "Use userLength instead.")
    usersLength: Int!
    findUserbyName(first_name: String!): User
    findUserById(id: ID!): User
  }

  type Mutation {
    addUser(email: String!, first_name: String!, last_name: String!, avatar: String): User
  }
`

const resolvers = {
  User: {
    completeName: parent => `${parent.first_name} ${parent.last_name}`,
  },

  Query: {
    allUsers: () => users,
    usersCount: () => users.length,
    usersLength: () => users.length,
    findUserbyName: (parent, args) => users.find(user => user.first_name === args.first_name),
    findUserById: (parent, args) => users.find(user => user.id === args.id),
  },

  Mutation: {
    addUser: (parent, args) => {
      if (users.find(user => user.last_name === args.last_name)) {
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
