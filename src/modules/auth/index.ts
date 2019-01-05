import {
  User
} from '@models'
import createResolvers from './resolvers'
import Feature, { requireSchema } from '@modules/connector'
import { get } from 'lodash'

export default new Feature({
  schema: requireSchema('../auth/schema.graphql'),
  createResolversFunc: createResolvers,
  createContextFunc: async ({ req }) => ({
    currentUser: get(req, 'user', false) ? await User.findById(req.user.id) : new Error('Unauthorized')
  })
})
