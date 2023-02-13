import axios from "axios";
import { Network } from "./getPoolIds";

const endpoint = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';
const endpointPolygon = 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon'

interface IToken {
    id: string;
    symbol: string;
    name: string;
    decimals: number;
}

export interface IPoolDayData {
    id: string;
    volumeUSD: number;
    date: number;
    tvlUSD: number;
    volumeToken0: number;
    volumeToken1: number;
    multiplier: number;
}

export interface IPool {
    id: string;
    feeTier: number;
    liquidity: number;
    token0: IToken;
    token1: IToken;
    volumeUSD: number;
    volumeToken0: number;
    volumeToken1: number;
    totalValueLockedToken0: number;
    totalValueLockedToken1: number;
    totalValueLockedUSD: number;
    poolDayData: IPoolDayData[];
}

export const getPools = async (poolIds: string[], network: Network) => {
    const poolIdsArray = poolIds.map(s => `"${s}"`).join(' ');
    const query = `query pools {
        pools(
          where: {id_in: [${poolIdsArray}]}
          orderBy: totalValueLockedUSD
          orderDirection: desc
          subgraphError: allow
        ) {
          id
          feeTier
          liquidity
          sqrtPrice
          tick
          token0 {
            id
            symbol
            name
            decimals
            derivedETH
            __typename
          }
          token1 {
            id
            symbol
            name
            decimals
            derivedETH
            __typename
          }
          token0Price
          token1Price
          volumeUSD
          volumeToken0
          volumeToken1
          txCount
          totalValueLockedToken0
          totalValueLockedToken1
          totalValueLockedUSD
          poolDayData(first: 365, orderBy: date orderDirection: desc) {
            id
            volumeUSD
            date
            tvlUSD
            volumeToken0
            volumeToken1
            token0Price
            token1Price
          }
          __typename
        }
      }`
    
    const url = network === Network.Eth ? endpoint : endpointPolygon;

    const res = await axios.post(url, {
        operationName: 'pools',
        query: query,
        variables: null
    });

    const response: IPool[] = res.data.data.pools.map((s: any) => ({
        id: s.id,
        feeTier: +s.feeTier,
        liquidity: +s.liquidity,
        volumeUSD: +s.volumeUSD,
        volumeToken0: +s.volumeToken0,
        volumeToken1: +s.volumeToken1,
        totalValueLockedToken0: +s.totalValueLockedToken0,
        totalValueLockedToken1: +s.totalValueLockedToken1,
        totalValueLockedUSD: +s.totalValueLockedUSD,
        token0: {
            id: s.token0.id,
            symbol: s.token0.symbol,
            name: s.token0.name,
            decimals: s.token0.decimals
        },
        token1: {
            id: s.token1.id,
            symbol: s.token1.symbol,
            name: s.token1.name,
            decimals: s.token1.decimals
        },
        poolDayData: s.poolDayData.map((q: any) => ({
            id: q.id,
            volumeUSD: q.volumeUSD,
            date: q.date,
            tvlUSD: q.tvlUSD,
            volumeToken0: q.volumeToken0,
            volumeToken1: q.volumeToken1,
            multiplier: q.volumeUSD / q.tvlUSD * s.feeTier / 1000000,
        })),
    }) as IPool).filter((s: IPool) => s.poolDayData.some((s: any) => s.volumeUSD > 0));


    return response;
}