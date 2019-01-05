import * as bcrypt from 'bcrypt'
import { InstanceType } from 'typegoose'
import { IModule } from '@modules'
import { UserClass } from '@models/user'

export default (pubsub): IModule => ({
  Query: {
    async users (_, { text }, { User }) {
      if (text) {
        return User.find({
          phone: new RegExp(text, 'gi')
        })
      }
      return User.find()
    },
    async currentUser (_, args, { currentUser }) {
      if (!currentUser) return new Error('Unauthorized')
      return currentUser
    }
  },
  User: {
    async avatar_url (user: InstanceType<UserClass>, args, { File }) {
      return (user.avatar && user.avatar.filename) ? File.getFileUrl(user.avatar.filename) : ''
    }
  },
  Mutation: {
    async updateUser (_, {
      user: {
        avatar,
        fullName,
        registrationId,
        email
      }
    }, { currentUser, File }) {
      if (fullName) {
        currentUser.fullName = fullName
      }
      if (registrationId) {
        currentUser.registrationId = registrationId
      }
      if (avatar) {
        const data = await File.uploadFile(avatar.path, avatar.type)
        if (currentUser.avatar && currentUser.avatar.filename) {
          await File.deleteFile(currentUser.avatar.filename)
        }
        currentUser.avatar = {
          filename: data.name,
          width: data.width,
          height: data.height
        }
      }
      if (email) {
        currentUser.email = email
      }

      await currentUser.save()
      return currentUser
    },
    async resetPassword (_, { phone }, { User, Mail }) {
      const user = await User.findOne({ phone })
      if (user) {
        Mail.resetPassword(user)
        return true
      }
      return false
    },
    async changePassword (_, {
      oldPassword,
      newPassword
    }, { currentUser }) {
      const old = await bcrypt.hash(oldPassword, 10)
      if (currentUser.password !== old) {
        return new Error('Incorrect Password')
      }

      currentUser.password = await bcrypt.hash(newPassword, 10)

      await currentUser.save()
      return true
    }
  }
})
