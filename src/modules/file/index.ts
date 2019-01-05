import createResolvers from './resolvers'
import Feature, { requireSchema } from '@modules/connector'

const File = require('./File')

export default new Feature({
  schema: requireSchema('../file/schema.graphql'),
  createResolversFunc: createResolvers,
  createContextFunc: () => ({
    File
  })
})
