import { ModelType, InstanceType } from 'typegoose'

import auth from './auth'
import graphqlTypes from './graphqlTypes'
import product from './product'
import category from './category'
import price from './price'
import user from './user'
import push from './push'
import mail from './mail'
import file from './file'

import Feature from './connector'

import { UserClass } from '@models/user'
import { CategoryClass } from '@models/category'
import { ProductClass } from '@models/product'
import { PriceClass } from '@models/price'
import { IPush } from './push/Push'
import { IFile } from './file/File'
import { IMail } from './mail/Mail'

interface IContext {
  currentUser: InstanceType<UserClass>
  Product: ModelType<ProductClass>
  Category: ModelType<CategoryClass>
  User: ModelType<UserClass>
  Price: ModelType<PriceClass>
  Push: IPush
  File: IFile
  Mail: IMail
}

interface IResolver {
  (_: any, args: any, context: IContext)
}

export interface IModule {
  [moduleNames: string]: {
    [moduleNames: string]: IResolver | {
      [moduleNames: string]: IResolver
    }
  }
}

export default new Feature(
  auth,
  graphqlTypes,
  category,
  product,
  price,
  user,
  push,
  mail,
  file
)
