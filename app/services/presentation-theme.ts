import type { PresentationTheme, PresentationThemeListReq } from '~/types/presentation-theme'

/**
 *  获取Presentation主题
 * @param query
 * @returns
 */
export function listPresentationTheme(query?:PresentationThemeListReq) {
  return useFetch<PaginationRes<PresentationTheme>>('/api/theme/list', {
    query,
  })
}
