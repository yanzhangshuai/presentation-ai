import type { Buffer } from 'node:buffer'

import OSS from 'ali-oss'

// docs: https://next.api.aliyun.com/document/Sts/2015-04-01/AssumeRole?spm=api-workbench.API%20Document.0.0.6bb64755DGUqtR

export async function getOssSTS() {
  const { aliyunOss } = useRuntimeConfig()

  const sts = new OSS.STS({
    accessKeyId    : aliyunOss.accessKeyId,
    accessKeySecret: aliyunOss.accessKeySecret,
  })

  return sts.assumeRole(
    aliyunOss.roleArn,
    JSON.stringify({
      Version  : '1',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'oss:PutObject',
            'oss:GetObject',
          ],
          Resource: [`acs:oss:*:*:${aliyunOss.bucketName}/*`],
        },

      ],
    }),
    900, // 15分钟
  )
    .then((res) => {
      return {
        region     : aliyunOss.region,
        bucketName : aliyunOss.bucketName,
        endpoint   : `https://${aliyunOss.region}.aliyuncs.com`,
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
