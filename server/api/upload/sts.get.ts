import { getOssSTS } from '~~/server/providers/oss/aliyun'

export default defineEventHandler(async () => {
  return await getOssSTS()
})
