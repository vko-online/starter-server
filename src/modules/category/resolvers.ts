import { IModule } from '@modules'

export default (pubsub): IModule => ({
  Query: {
    async categories (_, { text, categoryConnection = { first: 10 } }, { Category }) {
      const query: any = {}
      if (text) {
        const expression = text.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1')
        query.name = new RegExp(expression, 'gi')
      }
      const { first, last, before, after } = categoryConnection
      if (before) {
        query._id = { $gt: Buffer.from(before, 'base64').toString() }
      }
      if (after) {
        query._id = { $lt: Buffer.from(after, 'base64').toString() }
      }

      const categories = await Category
        .find(query)
        .sort({ '_id': -1 })
        .limit(first || last)
        .exec()

      const edges = categories.map(category => ({
        cursor: Buffer.from(category.id.toString()).toString('base64'),
        node: category
      }))
      return {
        edges,
        total: await Category.countDocuments(query),
        pageInfo: {
          async hasNextPage () {
            if (!categories.length || (categories.length < (last || first))) {
              return Promise.resolve(false)
            }
            const cats = await Category.findOne({
              ...query,
              _id: {
                [before ? '$gt' : '$lt']: categories[categories.length - 1].id
              }
            }).sort({ '_id': -1 })
            return !!cats
          },
          async hasPreviousPage () {
            const cats = await Category.findOne(query)
            return !!cats
          }
        }
      }
    },
    async category (_, { id }, { Category }) {
      return Category.findById(id)
    }
  },
  Category: {
    async products (category, args, { Product }) {
      return Product.find({
        _id: category.products
      })
    }
  }
})
