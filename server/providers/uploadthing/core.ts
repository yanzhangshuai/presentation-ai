import type { H3Event } from 'h3'
import type { FileRouter } from 'uploadthing/h3'

import { getServerSession } from 'next-auth'
import { createUploadthing } from 'uploadthing/h3'
import { UploadThingError } from 'uploadthing/server'

const f = createUploadthing()

const auth = (ev: H3Event) => ({ id: 'fakeId' }) // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const uploadRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    // Set permissions and file types for this FileRoute
    .middleware(async (event) => {
      // This code runs on your server before upload
      const session = await getServerSession()

      console.log(session)
      // If you throw, the user will not be able to upload
      if (!session)
        throw new UploadThingError('Unauthorized')

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Upload complete for userId:', metadata.userId)

      console.log('file url', file.url)

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId }
    }),
  editorUploader: f({
    image: { maxFileSize: '4MB' },
    pdf  : { maxFileSize: '16MB' },
    text : { maxFileSize: '16MB' },
    video: { maxFileSize: '64MB' },
  })
    .middleware(async () => {
      const session = await getServerSession()

      if (!session)
        throw new UploadThingError('Unauthorized')
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ file }) => {
      // Simply return the file URL and name
      return {
        key : file.key,
        name: file.name,
        size: file.size,
        type: file.type,
        url : file.ufsUrl,
      }
    }),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter
