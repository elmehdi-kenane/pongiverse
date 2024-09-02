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
      const seconds = String(date.getSeconds()).padStart(2, '0');

      // Construct the formatted date and time
      const formattedDateTime = `${year}-${month}-${day} | ${hours}:${minutes}:${seconds}`;
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
      <div className="result__field">
        <p>a</p>
        <p>{matchDate}</p>
        <p>a</p>
      </div>
      <div className="result__field">
        <p>a</p>
        <p>a</p>
        <p>a</p>
      </div>
      <div className="result__field">
        <p>a</p>
        <p>a</p>
        <p>a</p>
      </div>
      <div className="result__field">
        <p>a</p>
        <p>a</p>
        <p>a</p>
      </div>
      <div className="result__field">
        <p>a</p>
        <p>a</p>
        <p>a</p>
      </div>
      <div className="result__field">
        <p>a</p>
        <p>a</p>
        <p>a</p>
      </div>
    </>
  );
}

export default DashRsltSingle;
