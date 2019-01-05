import { User } from '@models'
import createResolvers from './resolvers'
import Feature, { requireSchema } from '@modules/connector'
import { userLoader } from '../../batch'

export default new Feature({
  schema: requireSchema('../user/schema.graphql'),
  createResolversFunc: createResolvers,
  createContextFunc: () => ({
    User,
    userLoader: userLoader()
  })
})
