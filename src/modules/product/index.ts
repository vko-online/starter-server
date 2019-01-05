import {
  Product
} from '@models'
import createResolvers from './resolvers'
import Feature, { requireSchema } from '@modules/connector'

export default new Feature({
  schema: requireSchema('../product/schema.graphql'),
  createResolversFunc: createResolvers,
  createContextFunc: () => ({
    Product
  })
})
