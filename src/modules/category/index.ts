import {
  Category
} from '@models'
import createResolvers from './resolvers'
import Feature, { requireSchema } from '@modules/connector'
import Mock from './mock'

export default new Feature({
  schema: requireSchema('../category/schema.graphql'),
  createResolversFunc: createResolvers,
  createContextFunc: () => ({
    Category
  }),
  beforeware: Mock
})
