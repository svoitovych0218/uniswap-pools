import axios from "axios";
import { urls } from "./urls";

export enum Network {
  Eth = 1,
  Polygon = 2,
  Arbitrum = 3,
  Base = 4
}

export const getTopPoolIds = async (take: number, skip: number, network: Network) => {
  const topPoolQuery = `
    query topPools {  pools(
        first: ${take}
        orderBy: totalValueLockedUSD
        orderDirection: desc
        subgraphError: allow
        skip: ${skip}
      ) {
            id
            __typename
          }
      }`;

  const url = urls[network];
  const response = await axios.post(url, {
    operationName: 'topPools',
    query: topPoolQuery,
    variables: null
  });

  const poolIds = response.data.data.pools.map((s: any) => s.id);

  return poolIds as string[];
}