import { graphql } from "graphql"
import { graphqlSchema } from '../../source/graphqlSchema'

export const graphqlConnection = async (query: any, variables?: any) => {
  const schema = await graphqlSchema()
  return graphql(schema, query, undefined, {}, variables)
}