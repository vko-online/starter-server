import {
  Price
} from '@models'
import Feature, { requireSchema } from '@modules/connector'

export default new Feature({
  schema: requireSchema('../price/schema.graphql'),
  createContextFunc: () => ({
    Price
  })
})
