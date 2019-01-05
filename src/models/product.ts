import { arrayProp, prop, Ref, Typegoose } from 'typegoose'
import { PriceClass } from './price'

export class ProductClass extends Typegoose {
  @prop({ required: true })
  name: string

  @arrayProp({ itemsRef: PriceClass })
  prices: Ref<PriceClass>[]
}

export default new ProductClass().getModelForClass(ProductClass, {
  schemaOptions: {
    collection: 'products'
  }
})
