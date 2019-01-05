import { makeExecutableSchema } from 'graphql-tools'
import { pubsub } from './subscriptions'
import modules from '@modules/index'

import { requireSchema } from '@modules/connector'
// don't change below require
// needs fix with relative pathes ;(
const rootSchemaDef = requireSchema('../rootSchema.graphql')

const executableSchema = makeExecutableSchema({
  typeDefs: [rootSchemaDef].concat(modules.schemas),
  resolvers: modules.createResolvers(pubsub)
})

export default executableSchema
