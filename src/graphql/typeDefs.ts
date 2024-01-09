import gql from 'graphql-tag'

export const typeDefs = gql`
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
  }
`
