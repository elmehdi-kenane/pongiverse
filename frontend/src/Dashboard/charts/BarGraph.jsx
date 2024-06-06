import React from 'react'
import {
        BarChart, Bar,
        XAxis, YAxis,
        CartesianGrid,
        Tooltip, Legend,
        ResponsiveContainer} from 'recharts'
import CustomToolTips from '../helpers/CustomToolTips'

function BarGraph({marginLeft, marginRight, dataLevel, barSize}) {
  var brSize;
  barSize ? brSize = barSize : brSize = 10;

  return (
    <ResponsiveContainer height="100%" width="100%">
        <BarChart width={500} height={500} data={dataLevel} margin={{ left: marginLeft, right: marginRight }}>
            <Bar dataKey="wins" fill="#f4effa" barSize={brSize}/>
            <Bar dataKey="lost" fill="#826aed"  barSize={brSize}/>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip content={<CustomToolTips/>} cursor={{ fill: '#250939', fillOpacity: 0.8 }}/>
            <Legend wrapperStyle={{left: 0}} />
            <CartesianGrid stroke="rgb(104, 104, 104, 0.3)" strokeDasharray="5 5" />

        </BarChart>
      </ResponsiveContainer>
  )
}

export default BarGraph
