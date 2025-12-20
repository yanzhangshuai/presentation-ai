export interface PaginationReq {
  page?    : number
  pageSize?: number
}

export interface PaginationRes<T> {
  page    : number
  pageSize: number
  total   : number
  items   : T[]
}
