import { createContext, useEffect, useState, useContext } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import mavPic from "../assets/Profile/avatar.png"
import bg from "../assets/Profile/bg1.jpg"
import { useNavigate } from "react-router-dom";

const DashboardContext = createContext();

export default DashboardContext;

export const DashboardWrapper = ({ child }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [userGames, setUserGames] = useState({});
  const [wins, setWins] = useState(0);
  const [losts, setLosts] = useState(0);
  const [games, setGames] = useState(0);
  const [winPcnt, setWinPcnt] = useState(50);
  const [lostPcnt, setLostPcnt] = useState(50);
  const [singleId, setSingleId] = useState(null);
  const [multyId, setMultyId] = useState(null);
  const [tournId, setTournId] = useState(null);

  // Dashboard Head ------------------------
  useEffect(() => {
    if (userGames) {
      const userWins = userGames.wins
      const userLosts = userGames.losts
      const userGame = userWins + userLosts
      const winPct = ((userWins * 100) / userGame).toFixed(0)
      setWins(userWins)
      setLosts(userLosts)
      setGames(userWins + userLosts)
      if (userGame) {
        setWinPcnt(winPct)
        setLostPcnt(100 - winPct)
      }
    }
  }, [userGames])

  useEffect(() => {
    const fetchUserGames = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/getUserGames`,
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
          setUserGames(res.userGames);
        else if (response.status === 401)
          navigate('/signin')
        else
         console.log("Error :", res.error);
      } catch (error) {
       console.log("Error: ", error);
      }
    }
    if (user)
      fetchUserGames()
  }, [user])


  let userInfoData = {
    userGames: userGames,
    setUserGames: setUserGames,
    wins: wins,
    setWins: setWins,
    losts: losts,
    setLosts: setLosts,
    games: games,
    setGames: setGames,
    winPcnt: winPcnt,
    setWinPcnt: setWinPcnt,
    lostPcnt: lostPcnt,
    setLostPcnt: setLostPcnt,
    singleId: singleId,
    setSingleId: setSingleId,
    multyId: multyId,
    setMultyId: setMultyId,
    tournId: tournId,
    setTournId: setTournId,
  };
  return (
    <DashboardContext.Provider value={userInfoData}> {child} </DashboardContext.Provider>
  )
}
