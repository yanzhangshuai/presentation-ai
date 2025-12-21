import type { Buffer } from 'node:buffer'

import crypto from 'node:crypto'

interface SignOptions {
  accessKeyId    : string
  secretAccessKey: string

  method: string
  url   : string

  headers?: Record<string, string>
  query?  : Record<string, string>
  body?   : string | Record<string, any>

  region    : string
  service   : string
  timestamp?: Date
}

/**
 */
export function volcSignature(options: SignOptions) {
  const {
    accessKeyId,
    secretAccessKey,
    method,
    url,
    region,
    service,
    headers = {},
    query = {},
    body = '',
    timestamp = new Date(),
  } = options

  /* ========== 时间 ========== */
  const shortDate = timestamp
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '') // YYYYMMDD

  const longDate = timestamp
    .toISOString()
    .replace(/[:-]|\.\d{3}/g, '') // YYYYMMDDTHHMMSSZ

  /* ========== URL ========== */
  const { pathname, host } = new URL(url)
  console.log('Volc Signing URL Pathname:', 'url:', url, 'pathname:', pathname, 'host:', host)

  /* ========== ✅ Headers 规范化（关键修正点） ========= */
  const headerMap: Record<string, string> = {}
  Object.entries({
    host,
    'x-date': longDate,
    ...headers,
  }).forEach(([k, v]) => {
    headerMap[k.toLowerCase()] = String(v).trim()
  })

  const sortedHeaderKeys = Object.keys(headerMap).sort()

  const canonicalHeaders = sortedHeaderKeys
    .map(k => `${k}:${headerMap[k]}`)
    .join('\n')

  const signedHeaders = sortedHeaderKeys.join(';')

  /* ========== ✅ Query（RFC3986 编码） ========= */
  const canonicalQueryString = Object.keys(query)
    .sort()
    .map(
      key =>
        `${encodeRFC3986(key)}=${encodeRFC3986(query[key])}`,
    )
    .join('&')

  /* ========== Body ========= */
  const payload
    = typeof body === 'string' ? body : JSON.stringify(body)

  const hashedPayload = sha256(payload)

  /* ========== Canonical Request ========= */
  const canonicalRequest = [
    method.toUpperCase(),
    pathname || '/',
    canonicalQueryString,
    `${canonicalHeaders}\n`,
    signedHeaders,
    hashedPayload,
  ].join('\n')

  /* ========== String To Sign ========= */
  const credentialScope = `${shortDate}/${region}/${service}/request`

  const stringToSign = [
    'HMAC-SHA256',
    longDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n')

  /* ========== ✅ Signing Key（火山专用，无前缀） ========= */
  const kDate = hmac(secretAccessKey, shortDate)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, service)
  const kSigning = hmac(kService, 'request')

  /* ========== Signature ========= */
  const signature = crypto
    .createHmac('sha256', kSigning)
    .update(stringToSign)
    .digest('hex')

  /* ========== Authorization ========= */
  const authorization
    = `HMAC-SHA256 `
      + `Credential=${accessKeyId}/${credentialScope}, `
      + `SignedHeaders=${signedHeaders}, `
      + `Signature=${signature}`

  return {
    authorization,
    signedHeaders,
    signature,
    longDate,
  }
}

/* ================= utils ================= */

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function hmac(key: Buffer | string, msg: string) {
  return crypto.createHmac('sha256', key).update(msg).digest()
}

/**
 * RFC3986 编码（火山引擎必须）
 */
function encodeRFC3986(str: string) {
  return encodeURIComponent(str)
    .replace(/[!'()*]/g, c =>
      `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
}
