import * as path from 'path'
import { times } from 'lodash'
import * as ProgressBar from 'progress'
import {
  Category,
  Product,
  Price
} from '@models'
import { SEED } from '@config'
import { uploadFileSimple } from '../file/File'

const data = require('./categories.json')

const DAYS_TO_MOCK = 10
const MIN_VALUE = 10
const MAX_VALUE = 500

function random (min, max) {
  return Math.floor(Math.random() * max) + min
}

export default async function seed (app) {
  const seed = SEED === 'true' || false
  if (seed) {
    const total = data.length + data.map(v => v.items.length * DAYS_TO_MOCK).reduce((all, next) => all + next, 0)
    const bar = new ProgressBar(':bar', { total })

    data.forEach(async (val) => {
      await Category.create({
        name: val.category,
        image: await uploadFileSimple(path.join(__dirname, 'icons', val.image), 'svg'),
        products: await Promise.all(
          val.items.map(async (item) => {
            bar.tick(DAYS_TO_MOCK)
            if (bar.complete) {
              console.log('done')
            }
            return Product.create({
              name: item,
              prices: await Promise.all(
                times(DAYS_TO_MOCK, async (n) => Price.create({
                  date: new Date(new Date().setDate(new Date().getDate() - n)),
                  value: random(MIN_VALUE, MAX_VALUE)
                }))
              )
            })
          }))
      })
    })
  }
}
