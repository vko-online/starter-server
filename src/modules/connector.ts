import { merge, map, union, without, castArray } from 'lodash'
import * as path from 'path'
import * as fs from 'fs'
import { PubSub } from 'graphql-subscriptions'

const combine = (features, extractor) =>
  without(union(...map(features, res => castArray(extractor(res)))), undefined)

export default class {
  context = {}
  schema = []
  createResolversFunc = []
  createContextFunc = []
  beforeware = []
  middleware = []
  data = []

  constructor (...features) {
    // GraphQL API
    this.schema = combine(features, arg => arg.schema)
    this.createResolversFunc = combine(features, arg => arg.createResolversFunc)
    this.createContextFunc = combine(features, arg => arg.createContextFunc)

    // Middleware
    this.beforeware = combine(features, arg => arg.beforeware)
    this.middleware = combine(features, arg => arg.middleware)

    // Shared modules data
    const empty = {}
    this.data = combine([empty].concat(Array.from(features)), arg => arg.data).reduce(
      (acc, el) => [{ ...acc[0], ...el }],
      [{}]
    )
  }

  get schemas () {
    return this.schema
  }

  get contexts () {
    return this.context
  }

  async createContext (req, res, connectionParams?, webSocket?) {
    for (const createContextFunc of this.createContextFunc) {
      this.context = merge(this.context, await createContextFunc({ req, res, connectionParams, webSocket, context: this.context }))
    }
    return this.context
  }

  createResolvers (pubsub: PubSub) {
    return merge({}, ...this.createResolversFunc.map(createResolvers => createResolvers(pubsub)))
  }

  get beforewares () {
    return this.beforeware
  }

  get middlewares () {
    return this.middleware
  }
}

export function requireSchema (fileName: string): string {
  return fs.readFileSync(path.join(__dirname, 'modules', fileName), 'utf8')
}
