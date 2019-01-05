import { IModule } from '@modules'

export default (): IModule => ({
  Mutation: {
    sendNotification: async (_, { input }, { Push, User }) => {
      let result = false
      try {
        const { userIds, message, data } = input

        const users = await User.find({ _id: userIds })
        const prettyData = data.map(v => ({ [v.key]: v.value }))
        const usersWithPush = users.filter(v => Push.isValid(v.registrationId))
        const pushMessages = usersWithPush.map(user => Push.createMessage(user.registrationId, message, prettyData))

        await Push.sendPush(pushMessages)
        result = true
      } catch (e) {
        console.log('PushError', e)
      }

      return result
    }
  }
})
