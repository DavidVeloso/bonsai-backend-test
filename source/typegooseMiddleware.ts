import { Document, Model } from "mongoose"
import { MiddlewareFn } from "type-graphql"
import { getClassForDocument } from "typegoose"

const convertDocument = (document: Document) => {
  const convertedDocument = document.toObject()
  const DocumentClass: () => void = getClassForDocument(document)
  Object.setPrototypeOf(convertedDocument, DocumentClass.prototype)
  return convertedDocument
}

const typegooseMiddleware: MiddlewareFn = async (_, next) => {
  const result = await next()
  if (Array.isArray(result)) {
    return result.map(item => (item instanceof Model ? convertDocument(item) : item))
  }
  if (result instanceof Model) {
    return convertDocument(result)
  }
  return result
}

export default typegooseMiddleware
