import React from 'react'
import {
        BarChart, Bar, Rectangle,
        XAxis, YAxis,
        CartesianGrid,
        Tooltip, Legend,
        ResponsiveContainer} from 'recharts'
import { dataLevel } from '../helpers/DataLevel'
import CustomToolTips from '../helpers/CustomToolTips'

function BarCharts() {
  return (
    <ResponsiveContainer height="100%" width="100%">
        <BarChart width={500} height={500} data={dataLevel} margin={{ left: -30, right: 5 }}>
            <Bar dataKey="lost" fill="#250939" stroke='#8884d8' barSize={10}/>
            <Bar dataKey="wins" fill="#8884d8" stroke='#250939' barSize={10}/>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip content={<CustomToolTips/>} cursor={{ fill: '#250939', fillOpacity: 0.8 }}/>
            <Legend wrapperStyle={{left: 0}} />
            <CartesianGrid stroke="rgb(104, 104, 104, 0.3)" strokeDasharray="5 5" />

        </BarChart>
      </ResponsiveContainer>
  )
}

export default BarCharts
