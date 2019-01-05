import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

import { JWT_SECRET } from '@config'
import { IModule } from '@modules/index'

export default (pubsub): IModule => ({
  Mutation: {
    async login (_, signinUserInput, { User, currentUser }) {
      // find user by email
      const { email, password } = signinUserInput.user
      const dbUser = await User.findOne({ email })
      if (dbUser) {
        // validate password
        const res = await bcrypt.compare(password, dbUser.password)
        if (res) {
          // create jwt
          const { id, email } = dbUser
          const token = jwt.sign(
            {
              id,
              email
            },
            JWT_SECRET
          )
          dbUser.jwt = token
          currentUser = dbUser
          return currentUser
        }

        return new Error('Incorrect password')
      }
      return new Error('Not found')
    },
    async signup (_, signinUserInput, { User, currentUser }) {
      const { password, fullName, email, registrationId } = signinUserInput.user
      // find user by email
      const existing = await User.findOne({ email })

      if (!existing) {
        // hash password and create user
        const hash = await bcrypt.hash(password, 10)
        const dbUser = await User.create({
          password: hash,
          fullName,
          email,
          registrationId,
          role: 'client'
        })
        const { id } = dbUser
        const token = jwt.sign({ id, email }, JWT_SECRET)
        dbUser.jwt = token
        currentUser = dbUser
        return currentUser
      }

      return Promise.reject(new Error('Email already exists'))
    }
  }
})
