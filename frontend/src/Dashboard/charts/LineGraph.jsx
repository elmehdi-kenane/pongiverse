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
          <Area  stackId="1" type="monotone" dataKey={"lost"} stroke="black" fill="#250939" />
          <Area  stackId="1" type="monotone" dataKey={"wins"} stroke="#8884d8" fill="#8884d8" />
          <XAxis dataKey="day" stroke="#775C9E" />
          <YAxis stroke="#775C9E" />
          <CartesianGrid stroke="rgb(104, 104, 104, 0.3)" strokeDasharray="5 5" />
          <Tooltip content={<CustomToolTips/>} />
          <Legend />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
  
  export default LineGraph;
