import React from 'react'
import {AreaChart, Area,
        ResponsiveContainer, 
        XAxis, YAxis,
        CartesianGrid,
        Tooltip,
        Legend,
    } from "recharts"
import CustomToolTips from '../helpers/CustomToolTips';


function LineGraph(props) {

  const param = props.param;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart width={500} height={500} data={param.data} margin={{ left: param.left, right: param.right }}>
          <Area  stackId="1" type="mono-tone" dataKey={"wins"} stroke="#f4effa" fill="#f4effa" />
          <Area  stackId="1" type="mono-tone" dataKey={"losts"} stroke="#907ad6" fill="#826aed" />
          <XAxis dataKey="day" stroke='white'/>
          <YAxis stroke='white'/>
          <CartesianGrid stroke="rgb(104, 104, 104, 0.3)" strokeDasharray="5 5" />
          <Tooltip content={<CustomToolTips/>} />
          <Legend wrapperStyle={{left: 0}} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
  
  export default LineGraph;
