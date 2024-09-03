import React, { useContext, useEffect, useState } from "react";
import DashboardContext from "../DashboardWrapper";

function DashRsltSingle() {
  const { singleId } = useContext(DashboardContext);
  const [matchDtls, setMatchDtls] = useState({})
  const [matchDate, setMatchDate] = useState(null)

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
      const formattedDateTime = `${year}-${month}-${day} | ${hours}:${minutes}`;
      setMatchDate(formattedDateTime);

    }
    const getMatchDtls = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/profile/getSingleMatchDtl/${singleId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const res = await response.json();
        if (response.ok){
            console.log(res.data);
            setMatchDtls(res.data)
            getDateFormat(res.data.date)
        }
        else 
            console.log("Error : ", res.error);
      } catch (error) {
        console.log("Error: ", error);
      }
    };

    if (singleId)
      getMatchDtls();
  }, [singleId]);

  return (
    <>
      <h1> Single Match Results </h1>
      <div className="result__field all-space">
        <div className="field__img-name">
          <img src={matchDtls.pic1}/>
          <p> {matchDtls.user1} </p>
        </div>
        <p>{matchDate}</p>
        <div className="field__img-name">
          <img src={matchDtls.pic2}/>
          <p> {matchDtls.user2} </p>
        </div>
      </div>
      <div className="result__field">
        <p> {matchDtls.score1} </p>
        <p> Score</p>
        <p> {matchDtls.score2} </p>
      </div>
      <div className="result__field">
        <p> {matchDtls.goals1} </p>
        <p> Goals </p>
        <p> {matchDtls.goals2} </p>
      </div>
      <div className="result__field">
        <p> {matchDtls.hit1} </p>
        <p> Hit </p>
        <p> {matchDtls.hit2} </p>
      </div>
      <div className="result__field">
        <p> {matchDtls.acc1}% </p>
        <p> Accuracy </p>
        <p> {matchDtls.acc2}% </p>
      </div>
      <div className="result__field">
        <p> {matchDtls.exp1} </p>
        <p> Rating </p>
        <p> {matchDtls.exp2} </p>
      </div>
    </>
  );
}

export default DashRsltSingle;
