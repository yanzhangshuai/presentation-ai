import { getOssSTS } from '~~/server/providers/oss/Aliyun'

export default defineEventHandler(async () => {
  return await getOssSTS()
})
