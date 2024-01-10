import { GraphQLError } from 'graphql'
import Comment from '../models/Comment.model.js'
import { PubSub } from 'graphql-subscriptions'

const pubSub = new PubSub()

export const resolvers = {
  Query: {
    comments: async () => await Comment.find({}),
    getComment: async (__, args) => {
      const { id } = args
      if (!id) {
        throw new GraphQLError('invalid id', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      try {
        return await Comment.findOne({ _id: id })
      } catch (error) {
        throw new GraphQLError('Error getting comment', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
          },
        })
      }
    },
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
