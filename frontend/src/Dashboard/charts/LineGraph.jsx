import React from 'react'
import {AreaChart, Area,
        ResponsiveContainer, 
        XAxis, YAxis,
        CartesianGrid,
        Tooltip,
        Legend,
    } from "recharts"
import CustomToolTips from '../helpers/CustomToolTips';
import { dataLevel } from '../helpers/DataLevel';


function LineGraph() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart width={500} height={500} data={dataLevel} margin={{ left: -30, right: 5 }}>
          <Area  stackId="1" type="mono-tone" dataKey={"wins"} stroke="#f4effa" fill="#f4effa" />
          <Area  stackId="1" type="mono-tone" dataKey={"lost"} stroke="#907ad6" fill="#826aed" />
          <XAxis dataKey="day" stroke="#775C9E" />
          <YAxis stroke="#775C9E" />
          <CartesianGrid stroke="rgb(104, 104, 104, 0.3)" strokeDasharray="5 5" />
          <Tooltip content={<CustomToolTips/>} />
          <Legend wrapperStyle={{left: 0}} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
  
  export default LineGraph;
