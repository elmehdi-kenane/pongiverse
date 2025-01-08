import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from '../../assets/SignIn/authentication.module.css'
import logo42 from '../../assets/SignUp/42_logo.svg'
import logoGoogle from '../../assets/SignIn/GoogleIcon.svg'
import toast, { Toaster } from 'react-hot-toast';
import CryptoJS from "crypto-js";


function SignInWays() {
  const [googleAuthUrl, setGoogleAuthUrl] = useState('')
  const [intraAuthUrl, setIntraAuthUrl] = useState('')
  const [googleCode, setGoogleCode] = useState('')
  const [user, setUser] = useState("");
  const [openTfq, setOpenTfq] = useState(false);
  const [intraCode, setIntraCode] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef(null);

  const notifyError = (message) => {
    const toastId = toast.error(message, {
      position: "top-center",
      duration: 1500,
    });
    setTimeout(() => {
      toast.dismiss(toastId);
    }, 1500);
  };

  const checkOtp = (otpStr) => {
    const regex = /^\d{6}$/; // Matches exactly 6 digits
    if (regex.test(otpStr)) return true;
    else notifyError("Wrong One-Time-Password");
  };

  const ValidateTFQ = async () => {
    const otp = inputRef.current.value;
    if (checkOtp(otp)) {
      try {
        if (user) {
          const response = await fetch(
            `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/CheckUserTFQ`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user: user,
                otp: otp
              }),
              credentials: "include",
            }
          );
          if (response.ok) {
            navigate("/mainpage/dashboard");
          } else {
            notifyError("Wrong One-Time-Password");
            setOpenTfq(false);
          }
        }
      } catch (error) {
       console.log("Error: ", error);
      }
    }
  };
  const OtfInput = () => {
    return (
      <div className={styles["otp-input-div"]}>
        <input
          type="text"
          className={styles["tfq-input"]}
          placeholder="Authentication Code (6 digits)"
          maxLength={6}
          ref={inputRef}
        />
        <button onClick={ValidateTFQ} className={styles["tfq-button"]}>enter</button>
      </div>
    );
  };

  useEffect(() => {
    const getQueryParam = (name) => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    };
    const extracted_code = getQueryParam('code');
    const fullUrl = window.location.href;
    if (extracted_code && fullUrl && fullUrl.includes("email")) {
      setGoogleCode(extracted_code)
    }
    else if (extracted_code) {
      setIntraCode(extracted_code)
    }
  }, [])

  const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

  const encodeEmail = (email) => {
    const hash = CryptoJS.HmacSHA256(email, SECRET_KEY);
    let signature = CryptoJS.enc.Base64.stringify(hash); // Standard Base64
    signature = signature.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); // URL-safe
    return signature;
  };

  const verify_email = async (email) => {
    const signature = encodeEmail(email);
    const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/auth/googleLogin/`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email,
        signature: signature
      })
    });
    if (response.ok) {
      const data = await response.json();
      if (data.Case === "Login successfully") {
        navigate('/mainpage');
      } else if (data.Case === "Invalid username or password!!") {
        notifyError("There is no account");
      } else if (data.Case === "Invalid email signature") {
        notifyError("Invalid email signature");
      } else if (data.Case === "Login successfully but have tfq") {
        setUser(data.user)
        setOpenTfq(true);
      }
    } else {
      navigate('/signin')
    }
  }

  useEffect(() => {
    const google_get_data = async () => {
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/auth/google-login-get-token/`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: googleCode
        })
      });
      if (response.ok) {
        const response_data = await response.json();
        verify_email(response_data.email)
      } else {
        navigate('/signin')
      }
    }
    if (googleCode) {
      const urlWithoutCode = window.location.href.split('?')[0];
      window.history.replaceState({}, document.title, urlWithoutCode);
      google_get_data()
    }
  }, [googleCode])

  useEffect(() => {
    const intra_get_data = async () => {
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/auth/intra-login-get-token/`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: intraCode
        })
      });
      if (response.ok) {
        const response_data = await response.json();
        verify_email(response_data.email)
      } else {
        navigate('/signin')
      }
    }
    if (intraCode) {
      const urlWithoutCode = window.location.href.split('?')[0];
      window.history.replaceState({}, document.title, urlWithoutCode);
      intra_get_data()
    }
  }, [intraCode])

  useEffect(() => {
    if (googleAuthUrl)
      window.location.href = googleAuthUrl;
    if (intraAuthUrl) {
      window.location.href = intraAuthUrl;
    }
  }, [googleAuthUrl, intraAuthUrl])

  const handleGoogleClick = () => {
    const getGoogleUrl = async () => {
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/auth/google-get-url`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setGoogleAuthUrl(data.code);
      } else {
        navigate('/signin')
      }
    }
    getGoogleUrl()
  }
  const handleIntraClick = () => {
    const getIntraUrl = async () => {
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/auth/intra-get-url`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setIntraAuthUrl(data.code);
      } else {
        navigate('/signin')
      }
    }
    getIntraUrl()
  }
  return (
    <>
      {user && openTfq && <OtfInput />}
      <div className={styles['authentication-signin-ways']}>
        <img onClick={handleGoogleClick} src={logoGoogle} alt="" />
        <img onClick={handleIntraClick} src={logo42} alt="" />
      </div>
    </>

  );
}

export default SignInWays;
