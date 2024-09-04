import React, { useContext, useEffect, useState } from "react";
import DashboardContext from "../DashboardWrapper";
import MavSvg from "../../assets/Profile/Group.svg";

function DashRsltMulty() {
  const { multyId } = useContext(DashboardContext);
  const [matchDtls, setMatchDtls] = useState({});
  const [matchDate, setMatchDate] = useState(null);
  const [matchTime, setMatchTime] = useState(null);

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
          `http://localhost:8000/profile/getSingleMatchDtl/${multyId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const res = await response.json();
        if (response.ok) {
          console.log("data :", res.data);
          setMatchDtls(res.data);
          getDateFormat(res.data.date);
        } else console.log("Error : ", res.error);
      } catch (error) {
        console.log("Error: ", error);
      }
    };

    //   if (multyId)
    //     getMatchDtls();
  }, [multyId]);

  return (
    <>
      <h1> Multiplayer Match Results </h1>
      <div className="result__field-mtp">
        <div className="field__img">
          <img src={MavSvg} />
          <img src={MavSvg} />
        </div>
        <div className="field__date">
          <p>14:46</p>
          <p>2024-09-04</p>
        </div>
        <div className="field__img">
          <img src={MavSvg} />
          <img src={MavSvg} />
        </div>
      </div>
      <div className="result__field-mtp">
        <div className="field__prg prg-score">
          <p> 100 </p>
        </div>
        <p className="field-option"> Score </p>
        <div className="field__prg prg-score">
          <p> 100 </p>
        </div>
      </div>
      <div className="result__field-mtp">
        <div className="field__prg">
          <p> 100 </p>
          <p> 100 </p>
        </div>
        <p className="field-option"> Goals</p>
        <div className="field__prg">
          <p> 100 </p>
          <p> 100 </p>
        </div>
      </div>
      <div className="result__field-mtp">
        <div className="field__prg">
          <p> 100 </p>
          <p> 100 </p>
        </div>
        <p className="field-option"> Hit</p>
        <div className="field__prg">
          <p> 100 </p>
          <p> 100 </p>
        </div>
      </div>
      <div className="result__field-mtp">
        <div className="field__prg">
          <p> 100 </p>
          <p> 100 </p>
        </div>
        <p className="field-option"> Accuracy</p>
        <div className="field__prg">
          <p> 100 </p>
          <p> 100 </p>
        </div>
      </div>
      <div className="result__field-mtp">
        <div className="field__prg">
          <p> 100 </p>
          <p> 100 </p>
        </div>
        <p className="field-option"> Rating</p>
        <div className="field__prg">
          <p> 100 </p>
          <p> 100 </p>
        </div>
      </div>
    </>
  );
}

export default DashRsltMulty;
