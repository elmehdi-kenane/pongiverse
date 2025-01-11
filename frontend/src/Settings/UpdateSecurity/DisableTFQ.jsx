import React, { useContext, useRef, useState } from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';
import SettingsContext from '../SettingsWrapper';
import { useNavigate } from 'react-router-dom';

function DisableTFQ(props) {
  const { user } = useContext(AuthContext);
  const { setUserTfq, notifySuc, notifyErr } = useContext(SettingsContext);
  const [step, setStep] = useState('notice');
  const navigate = useNavigate();
  const cancelTFQ = () => {
    props.cancelTFQ('security')
  }

  const Notice = () => {
    return (
      <div className="tfq">
        <h1> Two-Factor Authenticator App Notice </h1>
        <h2> Are you sure you want to disable Two-Factor Authenticator ? </h2>
        <div className="tfq__submit no--top-border">
          <button className="submit submit__cancel" onClick={cancelTFQ}> Cancel </button>
          <button className="submit submit__continue" onClick={() => setStep('disable')}> Confirm </button>
        </div>
      </div>
    )
  }


  const DisableTFQA = () => {
    const inputRef = useRef(null);

    const checkOtp = (otpStr) => {
      const regex = /^\d{6}$/; // Matches exactly 6 digits
      if (regex.test(otpStr))
        return true;
      else
        notifyErr("Wrong One-Time-Password")
    }

    const DisableTFQ = async () => {
      const otp = inputRef.current.value
      if (user && checkOtp(otp)) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/DisableTFQ`,
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
            setUserTfq(false);
            notifySuc(res.data)
            cancelTFQ();
          } else if (response.status === 401)
            navigate('/signin')
          else {
            //console.log("Error : ", res.error);
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
        DisableTFQ()
    }

    return (
      <div className="tfq">
        <h1> Two-Factor Authenticator App Notice </h1>
        <h3 style={{ width: '80%', alignSelf: 'center', margin: "2px 0 8px" }}> ENTER TRANSCENDENCE AUTH CODE </h3>
        <input type="text"
          className="tfq__input"
          placeholder='Authentication Code (6 digits)'
          maxLength={6}
          onKeyDown={handleEnterClick}
          ref={inputRef} />
        <div className="tfq__submit no--top-border">
          <button className="submit submit__cancel" onClick={cancelTFQ}> Cancel </button>
          <button className="submit submit__continue" onClick={DisableTFQ}> Confirm </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {step === 'notice' && <Notice />}
      {step === 'disable' && <DisableTFQA />}
    </>
  )
}

export default DisableTFQ
