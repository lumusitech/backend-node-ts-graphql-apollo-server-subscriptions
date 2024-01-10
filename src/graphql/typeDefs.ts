import gql from 'graphql-tag'

export const typeDefs = gql`
  type Comment {
    id: ID!
    name: String!
    endDate: String!
  }

  type Query {
    comments: [Comment!]!
    getComment(id: ID!): Comment
  }

  type Mutation {
    createComment(name: String!): String!
  }

  type Subscription {
    commentCreated: Comment!
  }
`
