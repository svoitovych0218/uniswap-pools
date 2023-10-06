import { useCallback, useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import '../App.css';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { getPools, IPool, IPoolDayData } from '../api/getPools';
import { getTopPoolIds, Network } from '../api/getPoolIds';
import { Button, FormControl, InputLabel, Link, MenuItem, Select } from '@mui/material';
import { infoPoolUrls } from '../api/urls';

const getAveragePercentage = (poolDayData: IPoolDayData[]) => {
    const average = poolDayData.map(s => s.multiplier).reduce((partialSum, a) => partialSum + a, 0) / poolDayData.length;
    return average * 100;
  }
  
  const getComplexPercentage = (poolDayData: IPoolDayData[], periodDays: number) => {
    if (poolDayData.length < periodDays) {
      return null;
    }
  
    let acc = 1;
    for (let i = 0; i < periodDays; i++) {
      acc = acc * (1 + poolDayData[i].multiplier)
    }
  
    return acc;
  }

export const Main = () => {
    const [pools, setPools] = useState<IPool[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const pageSize = 100;
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [selectedRowId, setSelectedRowId] = useState<string>('');
    const [selectedNetwork, setSelectedNetwork] = useState<Network>(Network.Eth);
  
    useEffect(() => {
      (async () => {
        setPools([]);
        setIsLoading(true);
  
        const poolIds = await getTopPoolIds(pageSize, 0, selectedNetwork);
        const pools = await getPools(poolIds, selectedNetwork);
        setPools(pools);
        setIsLoading(false);
      })();
    }, [selectedNetwork]);
  
    const loadMore = useCallback(async () => {
      setIsLoading(true);
  
      const poolIds = await getTopPoolIds(pageSize, pageSize * pageNumber, selectedNetwork);
      const pools = await getPools(poolIds, selectedNetwork);
      setPools(prev => [...prev, ...pools]);
      setPageNumber(prev => prev + 1);
      setIsLoading(false);
  
    }, [pageNumber, selectedNetwork]);
  
    const getColor = (input: number) => {
      const red = Math.floor(255 * ((1 - input * 150) < 0 ? 0 : (1 - input * 150)));
      const green = Math.floor(255 * input * 1000 > 255 ? 255 : 255 * input * 1000);
      const blue = 0;
  
      return `rgb(${red}, ${green}, ${blue})`;
    }
  
    const getColorForComplexPercentage = (input: number | null, multiplier: number) => {
  
      if (input === null) {
        return `rgb(255,255,255)`;
      }
  
      const range = 510;
  
      const value = (input - 1) * 100 * multiplier;
  
  
      const red = Math.floor((range - value) > 255 ? 255 : (range - value) < 0 ? 0 : (range - value));
      const green = Math.floor(value > 255 ? 255 : value);
      const blue = 0;
  
      return `rgb(${red}, ${green}, ${blue})`;
    }
  
  
    const selectRow = useCallback((rowId: string) => {
      setSelectedRowId(rowId);
    }, []);
  
    const styles = (theme: any) => ({
      tableRow: {
        "&$hover:hover": {
          backgroundColor: "blue"
        }
      },
      tableCell: {
        "$hover:hover &": {
          color: "pink"
        }
      },
      hover: {}
    });

    console.log(pools[64]);
    return (
        <>
            <TableContainer sx={{ maxHeight: 1000 }} style={{ marginTop: '50px', marginBottom: '50px' }} component={Paper}>
                <FormControl style={{ marginTop: '5px', width: '100px', float: 'left' }}>
                    <InputLabel id="demo-simple-select-label">Network</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedNetwork}
                        label="Age"
                        onChange={(e) => setSelectedNetwork(+e.target.value)}
                    >
                        <MenuItem value={1}>Eth</MenuItem>
                        <MenuItem value={2}>Polygon</MenuItem>
                        <MenuItem value={3}>Arbitrum</MenuItem>
                        <MenuItem value={4}>Base</MenuItem>
                    </Select>
                </FormControl>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table" stickyHeader >
                    <TableHead>
                        <TableRow selected>
                            <TableCell align="center">#</TableCell>
                            <TableCell align="center">Id</TableCell>
                            <TableCell align='center'>Chart</TableCell>
                            <TableCell align="center">Token A</TableCell>
                            <TableCell align="center">Token B</TableCell>
                            <TableCell align="center">Fee</TableCell>
                            <TableCell align="left">TVL</TableCell>
                            <TableCell align="left">Current Day Volume</TableCell>
                            <TableCell align="left">Average %</TableCell>
                            <TableCell align="left">Complex % 30d</TableCell>
                            <TableCell align="left">Complex % 180d</TableCell>
                            <TableCell align="left">Complex % 1y</TableCell>
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
                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, borderTop: row.id === selectedRowId ? '30px solid black' : 0 }}
                                onClick={() => selectRow(row.id)}
                            >
                                <TableCell align="center">{i + 1}</TableCell>
                                <TableCell align="center"><a href={infoPoolUrls[selectedNetwork] + row.id} target="_blank" rel="noreferrer">link</a></TableCell>
                                <TableCell align='center'><a href={'/details/'+row.id+'/'+ +selectedNetwork} target="_blank" rel="noreferrer">chart</a></TableCell>
                                <TableCell align="center">{row.token0.symbol}</TableCell>
                                <TableCell align="center">{row.token1.symbol}</TableCell>
                                <TableCell align="center">{row.feeTier / 10000}%</TableCell>
                                <TableCell align="left">{row.totalValueLockedUSD?.toFixed(1)}</TableCell>
                                <TableCell align="left">{(+row.poolDayData[1]?.volumeUSD ?? 0).toFixed(1)}</TableCell>
                                <TableCell align="left" style={{ backgroundColor: getColor(getAveragePercentage(row.poolDayData) / 100) }}>{getAveragePercentage(row.poolDayData)?.toFixed(4)}%</TableCell>
                                <TableCell align="left" style={{ backgroundColor: getColorForComplexPercentage(getComplexPercentage(row.poolDayData, 30), 100) }}>{getComplexPercentage(row.poolDayData, 30)?.toFixed(2)}</TableCell>
                                <TableCell align="left" style={{ backgroundColor: getColorForComplexPercentage(getComplexPercentage(row.poolDayData, 180), 25) }}>{getComplexPercentage(row.poolDayData, 180)?.toFixed(2)}</TableCell>
                                <TableCell align="left" style={{ backgroundColor: getColorForComplexPercentage(getComplexPercentage(row.poolDayData, 365), 11) }}>{getComplexPercentage(row.poolDayData, 365)?.toFixed(2)}</TableCell>
                                {row.poolDayData.map(s => {
                                    return (
                                        <TableCell align="left" style={{ backgroundColor: getColor(s.multiplier) }}>{s.multiplier.toFixed(8)}</TableCell>
                                    )
                                })}
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={20}>
                                {isLoading ? (
                                    <Stack sx={{ color: 'grey.500', display: 'flex', justifyContent: 'center' }} spacing={2} direction="row">
                                        <CircularProgress size={100} color="secondary" />
                                    </Stack>
                                ) : (
                                    <Stack sx={{ color: 'grey.500', display: 'flex', justifyContent: 'center' }} spacing={2} direction="row">
                                        <Button color='primary' variant='outlined' onClick={loadMore}>Load more</Button>
                                    </Stack>

                                )}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer></>
    )
}