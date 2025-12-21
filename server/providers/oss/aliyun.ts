import type { Buffer } from 'node:buffer'

import OSS from 'ali-oss'

// docs: https://next.api.aliyun.com/document/Sts/2015-04-01/AssumeRole?spm=api-workbench.API%20Document.0.0.6bb64755DGUqtR

export async function getOssSTS() {
  const config = useRuntimeConfig()

  const sts = new OSS.STS({
    accessKeyId    : config.aliyunOss.accessKeyId,
    accessKeySecret: config.aliyunOss.accessKeySecret,
  })

  return sts.assumeRole(
    config.aliyunOss.roleArn,
    JSON.stringify({
      Version  : '1',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'oss:PutObject',
            'oss:GetObject',
          ],
          Resource: [`acs:oss:*:*:${config.aliyunOss.bucketName}/*`],
        },

      ],
    }),
    900, // 15分钟
  )
    .then((res) => {
      return {
        region     : config.aliyunOss.region,
        bucketName : config.aliyunOss.bucketName,
        endpoint   : `https://${config.aliyunOss.region}.aliyuncs.com`,
        credentials: res.credentials,
      }
    })
}

/**
 *上传Buffer到 OSS
 * @param buffer 文件流
 * @param objectKey 文件路径+名称
 * @returns
 */
export async function uploadBufferToOss(buffer: Buffer, objectKey: string) {
  const config = useRuntimeConfig()
  const client = new OSS({
    region         : config.aliyunOss.region,
    accessKeyId    : config.aliyunOss.accessKeyId,
    accessKeySecret: config.aliyunOss.accessKeySecret,
    bucket         : config.aliyunOss.bucketName,
  })

  try {
    const result = await client.put(objectKey, buffer)
    return result.url
  }
  catch (err) {
    throw new Error(`Failed to upload to OSS: ${err}`)
  }
}
