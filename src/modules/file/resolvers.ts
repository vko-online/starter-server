import { IModule } from '@modules'

export default (): IModule => ({
  Mutation: {
    uploadImage: async (_, { file }, { File }) => {
      const { createReadStream, filename, mimetype } = await file
      const stream = createReadStream()
      const { id, width, height } = await File.storeFile({ stream, filename, mimetype })
      return {
        filename: id,
        width: width,
        height: height
      }
    }
  }
})
