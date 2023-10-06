import { useParams } from "react-router-dom"
import { IPool, getPools } from "../api/getPools";
import { useEffect, useMemo, useState } from "react";
import { Network } from "../api/getPoolIds";
import { scaleTime } from 'd3-scale';
import { ArgumentScale } from '@devexpress/dx-react-chart';
import Paper from '@mui/material/Paper';
import {
    Chart,
    ArgumentAxis,
    ValueAxis,
    LineSeries,
    ZoomAndPan,
    Title
} from '@devexpress/dx-react-chart-material-ui';

const TitleText = (props:any) => <Title.Text {...props} style={{ margin: 'auto' }} />;

export const Details = () => {
    const { id, networkId } = useParams();
    console.log(id);

    const [pool, setPool] = useState<IPool | undefined>(undefined);

    useEffect(() => {
        (async () => {
            if (!id || !networkId) {
                console.log('Error. Wrong parameters');
                return;
            }

            const pools = await getPools([id], (+networkId) as Network);
            setPool(pools[0]);
        })();
    }, [id, networkId]);

    const data = useMemo(() => {
        return pool?.poolDayData.map(s => ({ multiplier: s.multiplier * 100, date: new Date(s.date * 1000) })).reverse();
    }, [pool])

    const data2 = useMemo(() => {
        return pool?.poolDayData.map(s => ({ volumeUSD: +s.volumeUSD, date: new Date(s.date * 1000) })).reverse();
    }, [pool])

    const data3 = useMemo(() => {
        return pool?.poolDayData.map(s => ({ tvlUSD: +s.tvlUSD, date: new Date(s.date * 1000) })).reverse();
    }, [pool])

    return (<>
        <div key={1} style={{ width: '90%', marginTop:'30px' }}>
            {data && (
                <Paper>
                    <Chart data={data}>
                        <Title
                            text="Daily percentage revenue"
                            textComponent={TitleText}
                        />
                        <ArgumentScale factory={scaleTime} />
                        <ArgumentAxis />
                        <ValueAxis />
                        <LineSeries valueField="multiplier" argumentField="date" />
                        <ZoomAndPan interactionWithArguments={'both'} interactionWithValues="both" />
                    </Chart>
                </Paper>
            )}
        </div>

        <div key={2} style={{ width: '90%', marginTop:'30px' }}>
            {data2 && (
                <Paper>
                    <Chart data={data2}>
                        <Title
                            text="Daily volume"
                            textComponent={TitleText}
                        />
                        <ArgumentScale factory={scaleTime} />
                        <ArgumentAxis />
                        <ValueAxis />
                        <LineSeries valueField="volumeUSD" argumentField="date" />
                        <ZoomAndPan />
                    </Chart>
                </Paper>
            )}
        </div>

        <div key={3} style={{ width: '90%', marginTop:'30px' }}>
            {data2 && (
                <Paper>
                    <Chart data={data3}>
                        <Title
                            text="Daily TVL"
                            textComponent={TitleText}
                        />
                        <ArgumentScale factory={scaleTime} />
                        <ArgumentAxis />
                        <ValueAxis />
                        <LineSeries valueField="tvlUSD" argumentField="date" />
                        <ZoomAndPan />
                    </Chart>
                </Paper>
            )}
        </div>
    </>)
}