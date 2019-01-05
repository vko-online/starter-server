import { arrayProp, prop } from 'typegoose'

export class Image {
  @prop()
  filename?: string

  @prop()
  width?: number

  @prop()
  height?: number
}

export class Geolocation {
  @prop({ required: true })
  type: string

  @arrayProp({ items: Number })
  coordinates: number[]
}

export class Link {
  @prop({ required: true })
  label: string

  @prop({ required: true })
  value: string
}
