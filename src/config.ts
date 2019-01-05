require('dotenv').config()

export const {
  JWT_SECRET,
  MONGODB_URL,
  SEED,
  HOST_URL
} = process.env

const defaults = {
  JWT_SECRET: 'your_secret',
  MONGODB_URL: 'mongodb://127.0.0.1:27017/your_mongo_url',
  SEED: false,
  HOST_URL: 'localhost'
}

Object.keys(defaults).forEach(key => {
  if (!process.env[key] || process.env[key] === defaults[key]) {
    throw new Error(
      `Please enter a custom ${key} in .env on the root directory`
    )
  }
})
