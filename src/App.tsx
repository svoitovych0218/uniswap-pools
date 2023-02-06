import { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import './App.css';
import axios from 'axios';
import { Container } from '@mui/material';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

const endpoint = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

const query = `query pools {
  pools(
    where: {id_in: [poolsArray]}
    orderBy: totalValueLockedUSD
    orderDirection: desc
    subgraphError: allow
    skip: [skip]
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
}`;

const topPoolQuery = `
  query topPools {  pools(    first: 200    orderBy: totalValueLockedUSD    orderDirection: desc    subgraphError: allow  ) {    id    __typename  }}
`;

interface IToken {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
}

interface IPoolDayData {
  id: string;
  volumeUSD: number;
  date: number;
  tvlUSD: number;
  volumeToken0: number;
  volumeToken1: number;
}

interface IPool {
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

const App = () => {

  const [pools, setPools] = useState<IPool[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);



  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const response = await axios.post(endpoint, {
        operationName: 'topPools',
        query: topPoolQuery,
        variables: null
      });

      const poolIdsArray = `[${response.data.data.pools.map((s: any) => `"${s.id}"`).join(" ")}]`;

      const query2 = query.replace('[poolsArray]', poolIdsArray).replace('[skip]', '0');

      const res = await axios.post(endpoint, {
        operationName: 'pools',
        query: query2,
        variables: null
      });

      const res2 = await axios.post(endpoint, {
        operationName: 'pools',
        query: query.replace('[poolsArray]', poolIdsArray).replace('[skip]', '100'),
        variables: null
      });

      const mappedResponse: IPool[] = [...res.data.data.pools, ...res2.data.data.pools].map((s: any) => ({
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
          volumeToken1: q.volumeToken1
        })),
        prev2DayKoef: s.poolDayData[2] ? s.poolDayData[2].volumeUSD / s.poolDayData[2].tvlUSD * s.feeTier / 1000000 : NaN,
      })).filter(s=>s.poolDayData.some((s: any) => s.volumeUSD > 0));



      setPools(mappedResponse);
      setIsLoading(false);
    })();
  }, []);

  const getColor = (input: number) => {
    const red = Math.floor(255 * ((1 - input * 150 ) < 0 ? 0 : (1 - input * 150 )));
    const green = Math.floor(255 * input * 1000 > 255 ? 255 : 255 * input * 1000);
    const blue = 0;

    return `rgb(${red}, ${green}, ${blue})`;
  }

  return (
    <div className="App">
      <header className="App-header">
        {isLoading ? (
          <Stack sx={{ color: 'grey.500' }} spacing={2} direction="row">
            <CircularProgress color="secondary" />
          </Stack>
        ) : (
          <TableContainer sx={{ maxHeight: 2000 }} style={{ marginTop: '50px', marginBottom: '50px' }} component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table" stickyHeader >
              <TableHead>
                <TableRow>
                  <TableCell align="center">#</TableCell>
                  <TableCell align="center">Id</TableCell>
                  <TableCell align="center">Token A</TableCell>
                  <TableCell align="center">Token B</TableCell>
                  <TableCell align="center">Fee</TableCell>
                  <TableCell align="left">TVL</TableCell>
                  <TableCell align="left">Current Day Volume</TableCell>
                  {[...new Array(365)].map((_, i) => {
                    const a = new Date()
                    const b = new Date(a.setDate(a.getDate() - i - 1))
                    return (

                      <TableCell key={i} align="left">{b.toDateString()}</TableCell>
                    )
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {pools.map((row, i) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell align="center">{i + 1}</TableCell>
                    <TableCell align="center"><a href={`https://info.uniswap.org/#/pools/${row.id}`} target="_blank" rel="noreferrer">link</a></TableCell>
                    <TableCell align="center">{row.token0.symbol}</TableCell>
                    <TableCell align="center">{row.token1.symbol}</TableCell>
                    <TableCell align="center">{row.feeTier / 10000}%</TableCell>
                    <TableCell align="left">{row.totalValueLockedUSD}</TableCell>
                    <TableCell align="left">{row.poolDayData[1].volumeUSD}</TableCell>
                    {row.poolDayData.map(s => {
                      const koef = s.volumeUSD / s.tvlUSD * row.feeTier / 1000000;
                      return (
                        <TableCell align="left" style={{ backgroundColor: getColor(koef) }}>{koef.toFixed(8)}</TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {/* </Container> */}
      </header>
    </div>
  );
}

export default App;
