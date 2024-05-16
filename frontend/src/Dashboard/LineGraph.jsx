import React from 'react'
import {AreaChart, Area,
        ResponsiveContainer, 
        XAxis, YAxis,
        CartesianGrid,
        Tooltip,
        Legend,
    } from "recharts"

const data = [
    {
        day: "01",
        wins: 2,
        lost: 0,
    },
    {
        day: "02",
        wins: 5,
        lost: 2,
    },
    {
        day: "03",
        wins: 0,
        lost: 1,
    },
    {
        day: "04",
        wins: 7,
        lost: 3,
    },
    {
        day: "05",
        wins: 3,
        lost: 5,
    },
    {
        day: "06",
        wins: 0,
        lost: 0,
    },
    {
        day: "07",
        wins: 0,
        lost: 0,
    },
    {
        day: "08",
        wins: 5,
        lost: 2,
    },
    {
        day: "09",
        wins: 7,
        lost: 4,
    },
    {
        day: "10",
        wins: 6,
        lost: 5,
    },
    {
        day: "11",
        wins: 7,
        lost: 8,
    },
    {
        day: "12",
        wins: 5,
        lost: 4,
    },
    {
        day: "13",
        wins: 2,
        lost: 2,
    },
    {
        day: "14",
        wins: 10,
        lost: 5,
    },
    {
        day: "15",
        wins: 9,
        lost: 3,
    },
    {
        day: "16",
        wins: 4,
        lost: 7,
    },
    {
        day: "17",
        wins: 2,
        lost: 1,
    },
    {
        day: "18",
        wins: 5,
        lost: 5,
    },
    {
        day: "19",
        wins: 10,
        lost: 4,
    },
    {
        day: "20",
        wins: 5,
        lost: 8,
    },
    
]

function LineGraph() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart width={500} height={500} data={data} margin={{left: -30, right: 5}}>
                <Area type="monotone" dataKey={"wins"} stroke="white" fill="white"/>
                <Area type="monotone" dataKey={"lost"} stroke="black" fill="#250939"/>
                <XAxis dataKey="day"/>
                <YAxis />
                <CartesianGrid stroke="rgb(104, 104, 104, 0.5)" strokeDasharray="5 5" />
                <Tooltip />
                <Legend />
            </AreaChart>
        </ResponsiveContainer>
      )
}

export default LineGraph
