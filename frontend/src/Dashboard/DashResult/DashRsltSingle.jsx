import React, { useContext, useEffect, useState } from "react";
import DashboardContext from "../DashboardWrapper";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../navbar-sidebar/Authcontext";

function DashRsltSingle() {
  const { singleId, setSingleId } = useContext(DashboardContext);
  const { setIsGameStats } = useContext(AuthContext);
  const [matchDtls, setMatchDtls] = useState({})
  const [matchDate, setMatchDate] = useState(null)
  const [matchTime, setMatchTime] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const getDateFormat = (dateStr) => {
      const date = new Date(dateStr);

      // Extract date components
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const day = String(date.getDate()).padStart(2, '0');

      // Extract time components
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      // Construct the formatted date and time
      const formattedDate = `${year}-${month}-${day}`;
      const formattedTime = `${hours}:${minutes}`;
      setMatchDate(formattedDate);
      setMatchTime(formattedTime)
    }

    const getMatchDtls = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/getSingleMatchDtl/${singleId}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const res = await response.json();
        if (response.ok) {
          //console.log("data :", res.data);
          setMatchDtls(res.data)
          getDateFormat(res.data.date)
        }
        else if (response.status === 401)
          navigate('/signin')
        else
         console.log("Error : ", res.error);
      } catch (error) {
       console.log("Error: ", error);
      }
    };

    if (singleId)
      getMatchDtls();
  }, [singleId]);


  const profileNavigate = (user) => {
    setIsGameStats(false);
    setSingleId(null);
    navigate(`/mainpage/profile/${user}`)
  }

  return (
    <>
      <h1> Single Match Results </h1>
      <div className="result__field-sgl">
        <div className="field__img-name" >
          <img src={matchDtls.pic1} onClick={() => profileNavigate(matchDtls.user1)} />
        </div>
        <div className="field__date">
          <p>{matchTime}</p>
          <p>{matchDate}</p>
        </div>
        <div className="field__img-name">
          <img src={matchDtls.pic2} onClick={() => profileNavigate(matchDtls.user2)} />
        </div>
      </div>
      <div className="result__field-sgl">
        <p> {matchDtls.score1} </p>
        <p> Score</p>
        <p> {matchDtls.score2} </p>
      </div>
      <div className="result__field-sgl">
        <p> {matchDtls.goals1} </p>
        <p> Goals </p>
        <p> {matchDtls.goals2} </p>
      </div>
      <div className="result__field-sgl">
        <p> {matchDtls.hit1} </p>
        <p> Hit </p>
        <p> {matchDtls.hit2} </p>
      </div>
      <div className="result__field-sgl">
        <p> {matchDtls.acc1} </p>
        <p> Accuracy </p>
        <p> {matchDtls.acc2} </p>
      </div>
      <div className="result__field-sgl">
        <p> {matchDtls.exp1} </p>
        <p> Rating </p>
        <p> {matchDtls.exp2} </p>
      </div>
    </>
  );
}

export default DashRsltSingle;
