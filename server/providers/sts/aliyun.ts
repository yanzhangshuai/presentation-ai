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
          Action  : ['oss:*'],
          Effect  : 'Allow',
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

// /mwjz-presentation-ai.oss-cn-beijing.aliyuncs.com
// oss-cn-beijing.aliyuncs.com
