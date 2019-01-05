import { prop, Typegoose } from 'typegoose'

import { Image } from './primitives'

export type UserRole = 'client' | 'admin'

export enum UserRoles {
  CLIENT = 'client',
  ADMIN = 'admin'
}

export class UserClass extends Typegoose {
  @prop({ validate: /\S+@\S+\.\S+/, required: true, unique: true })
  email: string

  @prop({ required: true })
  fullName: string

  @prop({ enum: Object.keys(UserRoles).map(key => UserRoles[key]), default: UserRoles.CLIENT })
  role: UserRole

  @prop()
  jwt?: string

  @prop({ required: true })
  password: string

  @prop()
  avatar?: Image

  @prop()
  version?: number

  @prop({ default: 0 })
  badgeCount?: number

  @prop()
  registrationId?: string
}

export default new UserClass().getModelForClass(UserClass, {
  schemaOptions: {
    collection: 'users'
  }
})
