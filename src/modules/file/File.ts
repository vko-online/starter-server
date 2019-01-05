import * as fs from 'fs'
import * as path from 'path'
import * as uuidv4 from 'uuid/v4'
import * as mime from 'mime-types'
import * as request from 'request'
import * as im from 'imagemagick'

import {
  HOST_URL
} from 'config'

const UPLOADS_DIR = '../../../uploads'

export type Upload = {
  width?: number
  height?: number
  name: string
  type: string
  path: string
}

export interface IFile {
  deleteFile (Key: string): Promise<string>
  deleteAllFiles (): Promise<void>
  uploadRemoteFile (url: string, type: string): Promise<Upload>
  uploadFile (fileUrl: string, type: string): Promise<Upload>
  uploadFileSimple (fileUrl: string, type: string): Promise<string>
  storeFile ({ stream, mimetype }: any): Promise<any>
  getFileUrl (key: string): string
}

export const deleteFile = (Key: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.unlink(path.join(__dirname, UPLOADS_DIR, Key), (err) => {
      if (err) reject(err)
      resolve(Key)
    })
  })
}

export const deleteAllFiles = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const directory = path.join(__dirname, UPLOADS_DIR)
    fs.readdir(directory, (err, files) => {
      if (err) reject(err)

      for (const file of files) {
        fs.unlink(path.join(directory, file), err => {
          if (err) reject(err)
        })
      }
      resolve()
    })
  })
}

export const uploadRemoteFile = (url: string, type: string): Promise<Upload> =>
  new Promise((resolve, reject) => {
    const name = `${uuidv4()}.${type}`
    const filePath = path.join(__dirname, UPLOADS_DIR, name)
    request(url)
      .pipe(
        fs.createWriteStream(filePath)
          .on('error', (err) => reject(err))
          .on('finish', () => {
            const result = {
              name,
              type,
              path: filePath,
              width: 0,
              height: 0
            }
            im.identify(['-format', '%wx%h', filePath], (err, output) => {
              if (err) reject(err)
              if (output && output.length) {
                const parts = output.split('x')
                result.width = Number(parts[0])
                result.height = Number(parts[1])
              }
              resolve(result)
            })
          })
      )
  })

export const uploadFile = (fileUrl: string, type: string): Promise<Upload> =>
  new Promise((resolve, reject) => {
    const name = `${uuidv4()}.${mime.extension(type)}`
    const filePath = path.join(__dirname, UPLOADS_DIR, name)
    const readFileStream = fs.createReadStream(fileUrl)
    const writeFileStream = fs.createWriteStream(filePath)

    readFileStream.on('error', err => {
      reject(err)
    })
    writeFileStream.on('error', err => {
      reject(err)
    })

    readFileStream.pipe(writeFileStream)

    writeFileStream.on('finish', () => {
      const result: Upload = {
        name,
        type,
        path: filePath
      }
      im.identify(['-format', '%wx%h', filePath], (err, output) => {
        if (err) reject(err)
        if (output && output.length) {
          const parts = output.split('x')
          result.width = Number(parts[0])
          result.height = Number(parts[1])
        }
        resolve(result)
      })
    })
  })

export const uploadFileSimple = (fileUrl: string, type: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const name = `${uuidv4()}.${type}`
    const filePath = path.join(__dirname, UPLOADS_DIR, name)
    const readFileStream = fs.createReadStream(fileUrl)
    const writeFileStream = fs.createWriteStream(filePath)

    readFileStream.on('error', err => {
      reject(err)
    })
    writeFileStream.on('error', err => {
      reject(err)
    })

    readFileStream.pipe(writeFileStream)

    writeFileStream.on('finish', () => resolve(getFileUrl(name)))
  })

// new version of upload
export const storeFile = ({ stream, mimetype }: any): Promise<any> => {
  const id = `${uuidv4()}.${mime.extension(mimetype)}`
  const filePath = path.join(__dirname, UPLOADS_DIR, id)
  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        if (stream.truncated) {
          // Delete the truncated file
          fs.unlinkSync(filePath)
        }
        reject(error)
      })
      .pipe(fs.createWriteStream(filePath))
      .on('error', error => reject(error))
      .on('finish', () => {
        im.identify(['-format', '%wx%h', filePath], (err, output) => {
          if (err) reject(err)
          const result: any = {
            id
          }
          if (output && output.length) {
            const parts = output.split('x')
            result.width = Number(parts[0]),
            result.height = Number(parts[1])
          }
          resolve(result)
        })
      })
  )
}

export const getFileUrl = (key: string): string =>
  `http://${HOST_URL}:8080/uploads/${key}`

// export const getFileUrl = key => {
//   return new Promise((resolve, reject) => {
//     require('dns').lookup(require('os').hostname(), (err, ip) => {
//       if (err) reject(err)
//       resolve(`http://${ip}:8080/uploads/${key}`)
//     })
//   })
// }
