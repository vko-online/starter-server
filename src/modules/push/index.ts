import * as Push from './Push'
import Feature from '@modules/connector'

export default new Feature({
  createContextFunc: () => ({
    Push
  })
})
