import { React, useContext, useEffect, useState } from "react";
import { rankData } from "../helpers/Data";
import MavSvg from "../../assets/Profile/Group.svg"

import AuthContext from "../../navbar-sidebar/Authcontext";

function DashRanking() {
  const { user } = useContext(AuthContext);
  const [usersData, setUsersData] = useState([]);
  const [userImages, setUserImages] = useState([]);
  
  const [sortOption, setSortOption] = useState('level');

  useEffect(() => {
    const fetchImages = async () => {
      const promises = usersData.map(async (user) => {
        const response = await fetch(`http://localhost:8000/profile/getUserImage/${user.username}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const blob = await response.blob();
        // return URL.createObjectURL(blob);
        return {[user.id] : URL.createObjectURL(blob)};
      });
      const images = await Promise.all(promises);
      setUserImages(images);
    };
    if (usersData.length)
      fetchImages();
  }, [usersData]);

  useEffect(() => {
    const getUsersData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/profile/getUsersData/${user}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const res = await response.json();
        if (response.ok) {
          setUsersData(res.usersData);
          // console.log("RESPONSE : ", res.usersData);
        }
        else
          console.log("Error :", res.error);
      } catch (error) {
        console.log("Error :", error);
      }
    };
    if (user)
      getUsersData();
  }, [user]);

  const RankClassment = (position, player) => {
    let trophyClass = ""; // pos-pic
    let championsClass = ""; // name-level
    if (position <= 3) {
      trophyClass = `winners winner--${position}`;
      championsClass = `player__name_level--champions`;
    }
    let userValue = player[sortOption];

    return (
      <>
        <div className="player__pos_pic">
          <p className={trophyClass}> #{position}</p>
          <img src={userImages.length ? userImages.find((img) => img.hasOwnProperty(player.id))?.[player.id] : MavSvg} alt="Player" />
        </div>
        <div className="player__name_level">
          <p className={championsClass}> {player.username} </p>
          <p className={championsClass}> {userValue} </p>
        </div>
      </>
    );
  };

  const sortUsersData = (option) => {
    if (option === 'level'){
      const sortByLevelAndXp = (a, b) => {
        if (b.level === a.level)
          return b.xp - a.xp;
        return b.level - a.level;
      };
      usersData.sort(sortByLevelAndXp);
    }
    else if (option === 'goals'){
      const sortByGoals = (a, b) => b.goals - a.goals;
      usersData.sort(sortByGoals);
    }
    else if (option === 'wins'){
      const sortByWins = (a, b) => b.wins - a.wins;
      usersData.sort(sortByWins);
    }
  }

  useEffect(()=>{
    sortUsersData(sortOption);
  },[sortOption])

  return (
    <div className="dashpage__body__rank dash--bkborder">
      <h1> Rank </h1>
      <div className="dashpage__body__rank__title">
        <div className={`title ${sortOption === 'level' ? 'select' : ''}`} onClick={() => setSortOption('level')}> Level </div>
        <div className={`title ${sortOption === 'wins' ? 'select' : ''}`}  onClick={() => setSortOption('wins')}> Wins </div>
        <div className={`title ${sortOption === 'goals' ? 'select' : ''}`} onClick={() => setSortOption('goals')}> Goals </div>
      </div>
      <div className="dashpage__body__rank__classment">
        {sortUsersData(sortOption)}
        {usersData.map((player, key) => {
          return (
            <div className="player__classment" key={key}>
              {RankClassment(key + 1, player)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DashRanking;