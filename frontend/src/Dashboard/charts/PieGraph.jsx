import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend} from 'recharts'

const wins = 6;
const matches = 15 - wins;

const data = [
    { name: 'WINS', value: wins },
    { name: 'Matches', value: matches },
  ];

const COLORS = ['purple', '#775C9E',];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.3;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className='pie-text'>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function PieGraph() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart width={100} height={100}>
        <Pie
          data={data}
          cx="70%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={20}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        {/* <Legend 
          wrapperStyle={{
            position: 'absolute',
            top: '80%',
            left: '18%',
            transform: 'translateY(-50%)',
          }}
        /> */}
      </PieChart>
    </ResponsiveContainer>
  );
}

export default PieGraph
