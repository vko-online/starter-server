import createResolvers from './resolvers'
import Feature, { requireSchema } from '@modules/connector'

export default new Feature({
  schema: requireSchema('../graphqlTypes/schema.graphql'),
  createResolversFunc: createResolvers
})
