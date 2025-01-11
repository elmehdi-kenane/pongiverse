import React, { useContext, useEffect, useState } from "react";
import DashboardContext from "../DashboardWrapper";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../navbar-sidebar/Authcontext";

function DashRsltMulty() {
  const { multyId, setMultyId } = useContext(DashboardContext);
  const { setIsGameStats } = useContext(AuthContext);
  const [matchDtls, setMatchDtls] = useState({});
  const [matchDate, setMatchDate] = useState(null);
  const [matchTime, setMatchTime] = useState(null);
  const navigate = useNavigate()

  useEffect(() => {
    const getDateFormat = (dateStr) => {
      const date = new Date(dateStr);
      // Extract date components
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
      const day = String(date.getDate()).padStart(2, "0");

      // Extract time components
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      // Construct the formatted date and time
      const formattedDate = `${year}-${month}-${day}`;
      const formattedTime = `${hours}:${minutes}`;
      setMatchDate(formattedDate);
      setMatchTime(formattedTime);
    };
    const getMatchDtls = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/getMultyMatchDtl/${multyId}`,
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
          setMatchDtls(res.data);
          getDateFormat(res.data.date);
        } else if (response.status === 401)
          navigate('/signin')
        else
         console.log("Error : ", res.error);
      } catch (error) {
       console.log("Error: ", error);
      }
    };

    if (multyId)
      getMatchDtls();
  }, [multyId]);

  const profileNavigate = (user) => {
    setIsGameStats(false);
    setMultyId(null);
    navigate(`/mainpage/profile/${user}`)
  }

  return (
    <>
      <h1> Multiplayer Match Results </h1>
      <div className="result__field-mtp">
        <div className="field__img">
          <img src={matchDtls.pic1} onClick={() => profileNavigate(matchDtls.user1)} />
          <img src={matchDtls.pic2} onClick={() => profileNavigate(matchDtls.user2)} />
        </div>
        <div className="field__date">
          <p> {matchTime} </p>
          <p> {matchDate} </p>
        </div>
        <div className="field__img">
          <img src={matchDtls.pic3} onClick={() => profileNavigate(matchDtls.user3)} />
          <img src={matchDtls.pic4} onClick={() => profileNavigate(matchDtls.user4)} />
        </div>
      </div>
      <div className="result__field-mtp">
        <div className="field__prg prg-score">
          <p> {matchDtls.score1} </p>
        </div>
        <p className="field-option"> Score </p>
        <div className="field__prg prg-score">
          <p> {matchDtls.score2} </p>
        </div>
      </div>
      <div className="result__field-mtp">
        <div className="field__prg">
          <p> {matchDtls.goals1} </p>
          <p> {matchDtls.goals2} </p>
        </div>
        <p className="field-option"> Goals</p>
        <div className="field__prg">
          <p> {matchDtls.goals3} </p>
          <p> {matchDtls.goals4} </p>
        </div>
      </div>
      <div className="result__field-mtp">
        <div className="field__prg">
          <p> {matchDtls.hit1} </p>
          <p> {matchDtls.hit2} </p>
        </div>
        <p className="field-option"> Hit</p>
        <div className="field__prg">
          <p> {matchDtls.hit3} </p>
          <p> {matchDtls.hit4} </p>
        </div>
      </div>
      <div className="result__field-mtp">
        <div className="field__prg">
          <p> {matchDtls.acc1} </p>
          <p> {matchDtls.acc2} </p>
        </div>
        <p className="field-option"> Accuracy</p>
        <div className="field__prg">
          <p> {matchDtls.acc3} </p>
          <p> {matchDtls.acc4} </p>
        </div>
      </div>
      <div className="result__field-mtp">
        <div className="field__prg">
          <p> {matchDtls.exp1} </p>
          <p> {matchDtls.exp2} </p>
        </div>
        <p className="field-option"> Rating</p>
        <div className="field__prg">
          <p> {matchDtls.exp3} </p>
          <p> {matchDtls.exp4} </p>
        </div>
      </div>
    </>
  );
}

export default DashRsltMulty;
