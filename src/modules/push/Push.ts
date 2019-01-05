import Expo, { ExpoPushMessage } from 'expo-server-sdk'

// Create a new Expo SDK client
let expo = new Expo()

export interface IPush {
  createMessage (pushId: string, text: string, data: object): ExpoPushMessage
  sendPush (messages: ExpoPushMessage[]): void
  isValid (pushToken: string): boolean
}

export function createMessage (pushId: string, text: string, data: object = {}): ExpoPushMessage {
  return {
    to: pushId,
    sound: 'default',
    body: text,
    data: data
  }
}

export async function sendPush (messages: ExpoPushMessage[]) {
  let chunks = expo.chunkPushNotifications(messages)
  let tickets = []
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
      tickets.push(...ticketChunk)
    } catch (error) {
      console.error(error)
    }
  }
  let receiptIds = []
  for (let ticket of tickets) {
    if (ticket.id) {
      receiptIds.push(ticket.id)
    }
  }
  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds)
  for (let chunk of receiptIdChunks) {
    try {
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk)
      const keys = Object.keys(receipts)
      keys.forEach((key) => {
        const receipt = receipts[key]
        if (receipt.status === 'error') {
          console.error(`There was an error sending a notification: ${receipt.message}`)
          if (receipt.details && receipt.details.error) {
            console.error(`The error code is ${receipt.details.error}`)
          }
        }
      })
    } catch (error) {
      console.error(error)
    }
  }
}

export function isValid (pushToken: string): boolean {
  return Expo.isExpoPushToken(pushToken)
}
