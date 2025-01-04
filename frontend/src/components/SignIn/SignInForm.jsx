import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import styles from "../../assets/SignIn/authentication.module.css";

import Cookies from "js-cookie";
import { Link } from "react-router-dom";

function SignInForm() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    username: "",
    password: "",
  });

  const [user, setUser] = useState('')
  const [openTfq, setOpenTfq] = useState(false);
  const inputRef = useRef(null);

  const notifyError = (message) =>
    toast.error(message, {
        position: "top-center",
        duration: 3000,
    });


  const checkOtp = (otpStr) => {
    const regex = /^\d{6}$/;
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
            navigate("/mainpage/dashboard")
          } else {
            notifyError("Wrong One-Time-Password");
            setOpenTfq(false)
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
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.Case === "Login successfully") {
          navigate("/mainpage/dashboard")
        } else if (data.Case === "Invalid username or password!!") {
          toast.error(data.Case, {
            duration: 1000,
          });
          setData({ ...data, 'password': '' });
        } else if (data.Case === "Login successfully but have tfq") {
          setUser(data.user)
          setOpenTfq(true);
        }
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  };

  return (
    <>
      {user && openTfq && <OtfInput />}
      <form onSubmit={handleSubmit} className={styles['authentication-signin-form-tag']}>
        <input className={styles['authentication-signin-input']} type="text" value={data.username || ''} maxLength={8} onChange={handleChange} name='username' placeholder='Enter your username' />
        <input className={styles['authentication-signin-input']} type="password" name='password' value={data.password || ''} onChange={handleChange} autoComplete="off" maxLength={100} placeholder='Enter your password' />
        <div className={styles['authentication-signin-forget-password-div']}>
          <Link to="/signup" className={styles['authentication-signin-forget-password']} >Create Account</Link>
          <Link className={styles['authentication-signin-forget-password']} to="/ForgotPassword">Forget password?</Link>
        </div>
        <button className={styles['authentication-signin-button']} type='submit'>Sign In</button>
      </form>
    </>
  );
}

export default SignInForm;
