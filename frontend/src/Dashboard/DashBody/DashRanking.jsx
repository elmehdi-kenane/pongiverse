import { React, useContext, useEffect, useState } from "react";
import AvatarSvg from "../../assets/Profile/avatar.png"

import AuthContext from "../../navbar-sidebar/Authcontext";
import { Link, useNavigate } from "react-router-dom";

function DashRanking() {
  const { user } = useContext(AuthContext);
  const [usersData, setUsersData] = useState([]);
  const [userImages, setUserImages] = useState([]);
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState('level');

  useEffect(() => {
    const getUsersRank = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/getUsersRank`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const res = await response.json();
        if (response.ok)
          setUsersData(res.data);
        else if (response.status === 401)
          navigate('/signin')
        else
         console.log("Error :", res.error);
      } catch (error) {
       console.log("Error :", error);
      }
    };
    if (user)
      getUsersRank();
  }, [user]);

  const RankClassment = (player, position) => {
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
          <img src={player.pic ? player.pic : AvatarSvg} />
        </div>
        <div className="player__name_level">
          <p className={championsClass}> {player.username} </p>
          <p className={championsClass}> {userValue} </p>
        </div>
      </>
    );
  };

  const sortUsersData = (option) => {
    if (option === 'level') {
      const sortByLevelAndXp = (a, b) => {
        if (b.level === a.level)
          return b.xp - a.xp;
        return b.level - a.level;
      };
      usersData.sort(sortByLevelAndXp);
    }
    else if (option === 'goals') {
      const sortByGoals = (a, b) => b.goals - a.goals;
      usersData.sort(sortByGoals);
    }
    else if (option === 'wins') {
      const sortByWins = (a, b) => b.wins - a.wins;
      usersData.sort(sortByWins);
    }
  }

  useEffect(() => {
    sortUsersData(sortOption);
  }, [sortOption])

  return (
    <div className="dashpage__body__rank purple--glass">
      <h1> Rank </h1>
      <div className="dashpage__body__rank__title">
        <div className={`title ${sortOption === 'level' ? 'select' : ''}`} onClick={() => setSortOption('level')}> Level </div>
        <div className={`title ${sortOption === 'wins' ? 'select' : ''}`} onClick={() => setSortOption('wins')}> Wins </div>
        <div className={`title ${sortOption === 'goals' ? 'select' : ''}`} onClick={() => setSortOption('goals')}> Goals </div>
      </div>
      <div className="dashpage__body__rank__classment">
        {sortUsersData(sortOption)}
        {usersData.map((player, key) => {
          return (
            <Link className="player__classment" key={key} to={`/mainpage/profile/${player.username}`}>
              {RankClassment(player, key + 1)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default DashRanking;