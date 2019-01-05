import * as express from 'express'
import * as path from 'path'
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import * as bodyParser from 'body-parser'
import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { graphqlUploadExpress } from 'graphql-upload'
import { execute, subscribe } from 'graphql'
import * as jwt from 'express-jwt'
import * as jsonwebtoken from 'jsonwebtoken'
import * as cors from 'cors'

import { JWT_SECRET, MONGODB_URL, SEED, HOST_URL } from './config'
import { User } from '@models'
import executableSchema from './schema'
import modules from '@modules'
import { deleteAllFiles } from '@modules/file/File'

const mongoose = require('mongoose')

const GRAPHQL_PORT = 8080
const SERVER_PORT = 8090
const GRAPHQL_PATH = '/graphql'
const GRAPHQL_EXPLORER_PATH = '/graphiql'
const SUBSCRIPTIONS_PATH = '/subscriptions'

Error.stackTraceLimit = Infinity

const app = express()

app.use(cors())
app.use('/public', express.static(path.join(__dirname, '../public')))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// let Mongoose to use the global promise library
mongoose.Promise = global.Promise
// mongoose.set('debug', true)
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
  if (err) throw err

  // get the default connection
  const connection = mongoose.connection

  // bind connection to error event (to get notification of connection errors)
  connection.on('error', console.error.bind(console, 'MongoDB connection error:'))

  const seed = SEED === 'true' || false
  if (seed) {
    connection.db.dropDatabase(async () => {
      console.log('Database dropped!')
      await deleteAllFiles()
      require('./seed')
      // apply beforewares
      for (const applyBeforeware of modules.beforewares) {
        applyBeforeware(app)
      }
    })
  } else {
    // apply beforewares
    for (const applyBeforeware of modules.beforewares) {
      applyBeforeware(app)
    }
  }
})

// `context` must be an object and can't be undefined when using connectors
app.use(
  '/graphql',
  bodyParser.json(),
  // apolloUploadExpress({
  //   uploadDir: '/tmp/uploads'
  // }),
  graphqlUploadExpress({
    maxFileSize: 10000000, maxFiles: 10
  }),
  jwt({
    secret: JWT_SECRET,
    credentialsRequired: false
  }),
  graphqlExpress(async (req, res) => ({
    schema: executableSchema,
    context: await modules.createContext(req, res)
  }))
)
app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: GRAPHQL_PATH,
    subscriptionsEndpoint: `ws://localhost:${GRAPHQL_PORT}${SUBSCRIPTIONS_PATH}`
  })
)

// apply afterwares
for (const applyMiddleware of modules.middlewares) {
  applyMiddleware(app)
}

const graphQLServer = createServer(app)

graphQLServer.listen(GRAPHQL_PORT, () => {
  console.log(
    `GraphQL Server is now running on http://${HOST_URL}:${GRAPHQL_PORT}${GRAPHQL_PATH}`
  )
  console.log(
    `GraphQL Subscriptions are now running on ws://${HOST_URL}:${GRAPHQL_PORT}${SUBSCRIPTIONS_PATH}`
  )
  console.log(
    `GraphQL Explorer is now running on http://${HOST_URL}:${GRAPHQL_PORT}${GRAPHQL_EXPLORER_PATH}`
  )
})

app.listen(SERVER_PORT, () => {
  console.log(
    `Server now running on http://${HOST_URL}:${SERVER_PORT}`
  )
})

// eslint-disable-next-line no-unused-vars
SubscriptionServer.create(
  {
    schema: executableSchema,
    execute,
    subscribe,
    onConnect: async (connectionParams, webSocket) => {
      if (connectionParams.jwt) {
        const decoded: any = jsonwebtoken.verify(
          connectionParams.jwt,
          JWT_SECRET
        )
        const currentUser = User.findById(decoded.id)
        return {
          currentUser,
          ...await modules.createContext(null, null, connectionParams, webSocket)
        }
      }
      return {
        ...await modules.createContext(null, null, connectionParams, webSocket)
      }
    },
    onOperation: (_, params) => {
      params.context = modules.contexts
      return params
    }
  },
  {
    server: graphQLServer,
    path: SUBSCRIPTIONS_PATH
  }
)
