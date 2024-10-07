import React from 'react'
import {
        BarChart, Bar,
        XAxis, YAxis,
        CartesianGrid,
        Tooltip, Legend,
        ResponsiveContainer} from 'recharts'
import CustomToolTips from '../helpers/CustomToolTips'

function BarGraph(props) {

  const param = props.param;

  return (
    <ResponsiveContainer height="100%" width="100%">
        <BarChart width={500} height={500} data={param.data} margin={{ left: param.left, right: param.right}}>
            <Bar dataKey="wins" fill="#f4effa" barSize={param.brSize}/>
            <Bar dataKey="losts" fill="#826aed"  barSize={param.brSize}/>
            <XAxis dataKey="day" stroke='white'/>
            <YAxis stroke='white'/>
            <Tooltip content={<CustomToolTips/>} cursor={{ fill: '#250939', fillOpacity: 0.8 }}/>
            <Legend wrapperStyle={{left: 0}} />
            <CartesianGrid stroke="rgb(104, 104, 104, 0.3)" strokeDasharray="5 5" />
        </BarChart>
      </ResponsiveContainer>
  )
}

export default BarGraph
