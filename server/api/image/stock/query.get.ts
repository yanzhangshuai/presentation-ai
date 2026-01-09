import * as v from 'valibot'
import { getServerSession } from '#auth'

enum LayoutEnum {
  top        = 'top',
  bottom     = 'bottom',
  left       = 'left',
  right      = 'right',
  background = 'background',
}

const querySchema = v.object({
  prompt  : v.string('Prompt 不能为空'),
  layout  : v.optional(v.enum(LayoutEnum, '无效的布局类型'), LayoutEnum.left),
  provider: v.optional(v.string()),
})

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user = session!.user

  // 获取body参数
  const { success, issues, output: query } = v.safeParse(querySchema, getQuery(event))

  if (!success) {
    throw createError({
      statusCode   : 400,
      statusMessage: 'Validation Failed',
      data         : v.flatten(issues),
    })
  }

  const { unsplash } = useRuntimeConfig()
  if (!unsplash?.accessKey) {
    throw createError({
      statusCode   : 500,
      statusMessage: 'Unsplash API key is not configured',
    })
  }

  const orientationQuery
    = query.layout === 'top' || query.layout === 'bottom'
      ? '&orientation=landscape'
      : query.layout === 'left' || query.layout === 'right'
        ? '&orientation=portrait'
        : '&orientation=landscape'

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query.prompt)}&page=1&per_page=1${orientationQuery}`
  const res = await $fetch<UnsplashSearchResponse>(url, {
    method : 'GET',
    headers: {
      Authorization: `Client-ID ${unsplash.accessKey}`,
    },
  })

  if (res.total === 0 || res.results.length === 0) {
    return { success: false, error: 'No images found for this query' }
  }

  const firstImage = res.results[0]
  if (!firstImage) {
    return { success: false, error: 'No images found for this query' }
  }

  return {
    success: true,
    url    : firstImage.urls.regular,
  }

  // const imageUrl = await uploadBufferToOss(imageData, `images/${Date.now()}.png`)

  // // 保存到数据库
  // await db.imageLibrary.create({
  //   data: {
  //     userId  : user.id,
  //     type    : ImageLibraryType.AI,
  //     provider: data.modelPicker,
  //     modelId : data.modelId || null,
  //     url     : imageUrl,
  //     prompt  : data.prompt,
  //   },
  // })
})

interface UnsplashImage {
  id  : string
  urls: {
    raw    : string
    full   : string
    regular: string
    small  : string
    thumb  : string
  }
  alt_description: string | null
  description    : string | null
  user: {
    name    : string
    username: string
  }
  links: {
    download_location: string
  }
}

interface UnsplashSearchResponse {
  results    : UnsplashImage[]
  total      : number
  total_pages: number
}
