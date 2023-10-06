import { Network } from "./getPoolIds";

export const urls = {
    [Network.Eth]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    [Network.Polygon]: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon',
    [Network.Arbitrum]: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-arbitrum-one',
    [Network.Base]: 'https://api.studio.thegraph.com/query/48211/uniswap-v3-base/version/latest'
}

export const infoPoolUrls = {
    [Network.Eth]: 'https://info.uniswap.org/#/pools/',
    [Network.Polygon]: 'https://info.uniswap.org/#/polygon/pools/',
    [Network.Arbitrum]: 'https://info.uniswap.org/#/arbitrum/pools/',
    [Network.Base]: 'https://info.uniswap.org/#/base/pools/'
}