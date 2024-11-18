import React, { useContext, useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import ProfileContext from '../ProfileWrapper';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const line = payload[0].value + " " + payload[0].payload.subject
    return (
      <div className="custom-tooltip">
        <h4> {line} </h4>
      </div>
    );
  }
  return null;
};

  const ProfileUserDiagrame = () => {
    const [userGames, setUserGames] = useState({})
    const { userId } = useContext(ProfileContext);

    useEffect(()=>{
      const fetchUserGames = async () => {
        try {
          const response = await fetch(
            `http://${import.meta.env.VITE_IPADDRESS}:8000/profile/getUserDiagram/${userId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const res = await response.json();
          if (response.ok)
            setUserGames(res.userGames);
          else
            console.log("Error : ", res.error);
        } catch (error) {
          console.log("Error: ", error);
        }
      }
      if (userId)
        fetchUserGames()
    },[userId])

    return (
      <div className='userstate__diagrame purple--glass'>
        <div className='userstate-header'> <h1> Diagram </h1> </div>
        <div className="diagrame__container">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={userGames}>
              <PolarGrid stroke="#c9c9c9" />
              <Tooltip content={<CustomTooltip />} />
              <PolarAngleAxis dataKey="subject" stroke="#c9c9c9"/>
              {/* <PolarRadiusAxis stroke="#c9c9c9" /> */}
              <Radar dataKey="value" stroke="#826aed" fill="#826aed" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

export default ProfileUserDiagrame
