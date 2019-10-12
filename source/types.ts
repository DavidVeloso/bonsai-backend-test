import { ObjectId } from "mongodb"

export interface PaginateResult<T> {
  docs: [InstanceType<T>]
  limit: number
  offset: number
  totalDocs: number
}

export type Ref<T> = T | ObjectId