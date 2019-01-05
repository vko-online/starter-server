import { arrayProp, prop, Ref, Typegoose } from 'typegoose'
import { ProductClass } from './product'

export class CategoryClass extends Typegoose {
  @prop({ required: true })
  name: string

  @prop()
  image?: string

  @arrayProp({ itemsRef: ProductClass })
  products?: Ref<ProductClass>[]
}

export default new CategoryClass().getModelForClass(CategoryClass, {
  schemaOptions: {
    collection: 'categories'
  }
})
