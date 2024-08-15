import React, { useState, useEffect, useContext } from 'react'
import AuthContext from "../navbar-sidebar/Authcontext";

function ProfileLevel() {
    const [level, setLevel] = useState(0);
    const [per, setPer] = useState(60);

    const {user} = useContext(AuthContext);
    const [userLevel, setUserLevel] = useState({});
  
    useEffect(()=>{
      const fetchUserLevel = async () => {
        try {
          const response = await fetch(
            `http://localhost:8000/profile/getUserLevel/${user}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const res = await response.json();
          if (response.ok) 
            setUserLevel(res.userLevel);
          else
            console.log("Error : ", res.error);
        } catch (error) {
          console.log("Error: ", error);
        }
      }
      // if (user)
      //   fetchUserLevel()
    },[user])



    return (
    <div className="profile-userlevel">
        <div className='userlevel__per' style={{width:`${per}%`}} />
        <p> Level {level} - {per}% </p>
    </div>
  )
}

export default ProfileLevel
