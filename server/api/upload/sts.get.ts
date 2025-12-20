import { getOssSTS } from '~~/server/providers/sts/aliyun'

export default defineEventHandler(async () => {
  return await getOssSTS()
})
