import * as DataLoader from 'dataloader'
import { User } from '@models'

const batchGet = (model, keys) =>
  model.find({ _id: keys }).then(elements => {
    const map = new Map(elements.map(element => [element.id, element]))
    return keys.map(key => map.get(key))
  })

export const userLoader = () => new DataLoader(keys => batchGet(User, keys))
