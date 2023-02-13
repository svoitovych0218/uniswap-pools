import axios from "axios";

export enum Network {
  Eth = 1,
  Polygon = 2
}

const endpoint = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';
const endpointPolygon = 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon'

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

  const url = network === Network.Eth ? endpoint : endpointPolygon;
  const response = await axios.post(url, {
    operationName: 'topPools',
    query: topPoolQuery,
    variables: null
  });

  const poolIds = response.data.data.pools.map((s: any) => s.id);

  return poolIds as string[];
}