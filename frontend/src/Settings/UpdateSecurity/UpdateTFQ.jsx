import React, { useContext, useEffect } from "react";
import AuthContext from "../../navbar-sidebar/Authcontext";

function UpdateTFQ() {
  const { user } = useContext(AuthContext);
  const authenticators = [
    "Authy",
    "Google Authenticator",
    "Microsoft Authenticator",
  ];
  // useEffect(() => {
  //   const EnableTFQ = async () => {
  //     try {
  //       const response = await fetch(
  //         `http://localhost:8000/profile/EnableTFQ/${user}`,
  //         {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );
  //       const res = await response.json();
  //       if (response.ok) {
  //         console.log("Response : ", res.data);
  //       } else console.log("Error : ", res.error);
  //     } catch (error) {
  //       console.log("Error: ", error);
  //     }
  //   };
  //   if (user)
  //       EnableTFQ();
  // }, [user]);


  return ( 
    <div className="tfq">
      <h1> Two-Factor Authenticator App Notice </h1>
      <p> You must install an authenticator app on your mobile
          phone to sign up for the two-factor authentication
          service. You cannot install an authenticator app on
          a non-smartphone or Windows phone. </p>
      <div className="tfq__applist">
        <ul>
          {authenticators.map((authenticator, index) => (
            <li key={index}>{authenticator}</li>
          ))}
        </ul>
      </div>
      <p> If you already have the app installed, click Continue
          to proceed with authenticator registration. </p>
      <div className="tfq__submit">
        <button className="submit submit__cancel"> Cancel </button>
        <button className="submit submit__continue"> Continue </button>
      </div>
          
    </div>
  )
}

export default UpdateTFQ;