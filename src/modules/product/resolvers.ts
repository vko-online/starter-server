import { IModule } from '@modules'
import { ProductClass } from '@models/product'
import { InstanceType } from 'typegoose'

export default (pubsub): IModule => ({
  Product: {
    async prices (product: InstanceType<ProductClass>, { priceConnection = { first: 10 } }, { Price }) {
      let query: any = {}
      const { first, last, before, after } = priceConnection
      if (before) {
        query = {
          $and: [
              { _id: { $gt: Buffer.from(before, 'base64').toString() } },
              { _id: product.prices }
          ]
        }
      }
      if (after) {
        query = {
          $and: [
              { _id: { $lt: Buffer.from(after, 'base64').toString() } },
              { _id: product.prices }
          ]
        }
      }

      const prices = await Price
        .find(query)
        .sort({ '_id': -1 })
        .limit(first || last)
        .exec()

      const edges = prices.map(price => ({
        cursor: Buffer.from(price.id.toString()).toString('base64'),
        node: price
      }))
      return {
        edges,
        total: await Price.countDocuments(query),
        pageInfo: {
          async hasNextPage () {
            if (!prices.length || (prices.length < (last || first))) {
              return Promise.resolve(false)
            }
            const cats = await Price.findOne({
              $and: [
                { _id: { [before ? '$gt' : '$lt']: prices[prices.length - 1].id } },
                { _id: product.prices }
              ]
            }).sort({ '_id': -1 })
            return !!cats
          },
          async hasPreviousPage () {
            const cats = await Price.findOne(query)
            return !!cats
          }
        }
      }
    }
  }
})
