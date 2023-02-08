import axios from "axios";

const endpoint = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

export const getTopPoolIds = async (take: number, skip: number) => {
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

    const response = await axios.post(endpoint, {
        operationName: 'topPools',
        query: topPoolQuery,
        variables: null
    });

    const poolIds = response.data.data.pools.map((s:any) => s.id);

    return poolIds as string[];
}