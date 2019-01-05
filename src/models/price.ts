import { prop, Typegoose } from 'typegoose'

export class PriceClass extends Typegoose {
  @prop({ required: true, default: new Date() })
  date: Date

  @prop({ required: true })
  value: number
}

export default new PriceClass().getModelForClass(PriceClass, {
  schemaOptions: {
    collection: 'prices'
  }
})
