import Feature from '@modules/connector'

const Mail = require('./Mail')

export default new Feature({
  createContextFunc: () => ({
    Mail
  })
})
