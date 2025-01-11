import React, { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../../navbar-sidebar/Authcontext";
import SettingsContext from "../SettingsWrapper";
import { useNavigate } from "react-router-dom";
// import SettingsLoading from "../SettingsLoading";

function UpdateTFQ(props) {
  const { user } = useContext(AuthContext);
  const { isLoading, setIsLoading, notifySuc, notifyErr, setUserTfq } = useContext(SettingsContext);
  const [tfqImg, setTfqImg] = useState(null);
  const [key, setKey] = useState(null);
  const [step, setStep] = useState('notice');
  const navigate = useNavigate();
  const step1 = "Open the authenticator app you installed. To add\
  your account to the authenticator, scan the QR code below from the Scan a QR code menu."
  const step2 = "If you successfully added an account, enter the 6-digit authentication code that has been generated\
  in the authenticator app below."

  const authenticators = [
    "Authy",
    "Google Authenticator",
    "Microsoft Authenticator",
  ];

  const cancelTFQ = () => {
    props.cancelTFQ('security')
  }

  const Notice = () => {

    const EnableTFQ = async () => {
      if (!user)
        return;
      // setIsLoading(true)
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/EnableTFQ`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        const res = await response.json();
        if (response.ok) {
          //console.log("Response : ", res.data);
          setKey(res.data.key);
          setTfqImg(res.data.img);
          setStep('submit');
        } else if (response.status === 401)
          navigate('/signin')
        else
         console.log("Error : ", res.error);
      } catch (error) {
       console.log("Error: ", error);
      }
      // setIsLoading(false)
    };

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
          <button className="submit submit__cancel" onClick={cancelTFQ}> Cancel </button>
          <button className="submit submit__continue" onClick={EnableTFQ}> Continue </button>
        </div>
      </div>
    )
  }

  const SubmitTFQ = () => {
    const inputRef = useRef(null);

    const checkOtp = (otpStr) => {
      const regex = /^\d{6}$/; // Matches exactly 6 digits
      if (regex.test(otpStr))
        return true;
      else
        notifyErr("Wrong One-Time-Password")
    }

    const ValidateTFQ = async () => {
      const otp = inputRef.current.value
      if (checkOtp(otp)) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/ValidateTFQ`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                otp: otp
              })
            }
          );
          const res = await response.json();
          if (response.ok) {
            notifySuc(res.data)
            setUserTfq(true);
            cancelTFQ();
            // setStep('valid')
          } else if (response.status === 401)
            navigate('/signin')
          else {
            notifyErr("Wrong One-Time-Password")
          }
        } catch (error) {
         console.log("Error: ", error);
        }
      }
    }

    const handleEnterClick = (event) => {
      const otp = inputRef.current.value
      if (event.key === 'Enter' && otp.length === 6)
        ValidateTFQ()
    }

    return (
      <div className="tfq">
        <h1> Register Two-Factor Authenticator App </h1>
        <h3> Step1 </h3>
        <p>
          {step1}
        </p>
        <div className="tfq__keycode">
          <img src={tfqImg} className="keycode__QR no--select" />
          <div className="keycode__key">
            <h4> Security Key </h4>
            <h6 > {key} </h6>
          </div>
        </div>
        <h3> Step2 </h3>
        <p>
          {step2}
        </p>
        <input type="text"
          className="tfq__input"
          placeholder='Authentication Code (6 digits)'
          maxLength={6}
          onKeyDown={handleEnterClick}
          ref={inputRef} />
        <div className="tfq__submit">
          <button className="submit submit__cancel" onClick={cancelTFQ}> Cancel </button>
          <button className="submit submit__continue" onClick={ValidateTFQ}> Continue </button>
        </div>
      </div>
    )
  }

  // const ValidTFQ = () => {
  //   return (
  //     <div className="tfq">
  //       <h1> Congratulation You enabled Two-Factor Authentication </h1>
  //       <div className="tfq__submit no--top-border">
  //         <button className="submit submit__cancel" onClick={cancelTFQ}> Back </button>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <>
      {step === 'notice' && <Notice />}
      {step === 'submit' && <SubmitTFQ />}
      {/* {step === 'valid'  && <ValidTFQ />} */}
    </>
  )
}

export default UpdateTFQ;