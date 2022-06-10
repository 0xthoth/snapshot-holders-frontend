import { ApolloClient, gql, InMemoryCache } from "@apollo/client";

import { THE_GRAPH_URL } from "./constant";

const client = () =>
  new ApolloClient({
    uri: "https://api.thegraph.com/subgraphs/name/0xthoth/snapshot-holder-v1",
    cache: new InMemoryCache(),
  });

const apollo = async <T>(queryString: string) => {
  try {
    const data = client().query<T>({
      query: gql(queryString),
    });
    return data;
  } catch (err) {
    console.error("graph ql error: ", err);
  }
};

const extClient = (uri: string) =>
  new ApolloClient({
    uri: uri,
    cache: new InMemoryCache(),
  });

export const apolloExt = async <T>(queryString: string, uri: string) => {
  try {
    const data = await extClient(uri).query<T>({
      query: gql(queryString),
    });
    return data;
  } catch (err) {
    console.error("external graph ql api error: ", err);
  }
};

export default apollo;
