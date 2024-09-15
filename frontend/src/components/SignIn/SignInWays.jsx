import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../assets/SignIn/authentication.module.css";
import logo42 from "../../assets/SignUp/42_logo.svg";
import logoGoogle from "../../assets/SignIn/GoogleIcon.svg";
import toast, { Toaster } from "react-hot-toast";

function SignInWays() {
  const [googleAuthUrl, setGoogleAuthUrl] = useState("");
  const [intraAuthUrl, setIntraAuthUrl] = useState("");
  const [googleCode, setGoogleCode] = useState("");
  const [intraCode, setIntraCode] = useState("");
  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [openTfq, setOpenTfq] = useState(false);
  const inputRef = useRef(null);

  const checkOtp = (otpStr) => {
    const regex = /^\d{6}$/; // Matches exactly 6 digits
    if (regex.test(otpStr)) return true;
    else notifyErr("Wrong One-Time-Password");
  };

  const ValidateTFQ = async () => {
    const otp = inputRef.current.value;
    if (checkOtp(otp)) {
      try {
        if (user) {
          const response = await fetch(
            `http://localhost:8000/profile/CheckUserTFQ/${user}/${otp}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );
          if (response.ok) {
            navigate("/mainpage");
          } else {
            alert("wrong one time password");
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
          className="tfq__input"
          placeholder="Authentication Code (6 digits)"
          maxLength={6}
          ref={inputRef}
        />
        <button onClick={ValidateTFQ}>enter</button>
      </div>
    );
  };

  useEffect(() => {
    const getQueryParam = (name) => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    };
    const extracted_code = getQueryParam("code");
    const fullUrl = window.location.href;
    if (extracted_code && fullUrl && fullUrl.includes("email")) {
      setGoogleCode(extracted_code);
      console.log("ewahaaa");
    } else if (extracted_code) {
      console.log("ewahaaa intra");
      setIntraCode(extracted_code);
    }
  }, []);

  const verify_email = async (email) => {
    console.log("the dta : ", email);
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:8000/auth/googleLogin/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email,
        }),
      }
    );
    if (response.ok) {
      const data = await response.json();
      console.log("ftft : ");
      if (data.Case === "Login successfully") {
        navigate("/mainpage");
      } else if (data.Case === "Invalid username or password!!") {
        toast.error("There is no account", { duration: 2000 });
      } else if (data.Case === "Login successfully but have tfq") {
        setUser(data.user);
        setOpenTfq(true);
      }
    } else {
      console.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    const google_get_data = async () => {
      const response = await fetch(
        `http://${
          import.meta.env.VITE_IPADDRESS
        }:8000/auth/google-login-get-token/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: googleCode,
          }),
        }
      );
      if (response.ok) {
        const response_data = await response.json();
        verify_email(response_data.email);
      } else {
        console.error("Failed to fetch data");
      }
    };
    if (googleCode) {
      const urlWithoutCode = window.location.href.split("?")[0];
      window.history.replaceState({}, document.title, urlWithoutCode);
      google_get_data();
    }
  }, [googleCode]);

  useEffect(() => {
    const intra_get_data = async () => {
      const response = await fetch(
        `http://${
          import.meta.env.VITE_IPADDRESS
        }:8000/auth/intra-login-get-token/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: intraCode,
          }),
        }
      );
      if (response.ok) {
        const response_data = await response.json();
        verify_email(response_data.email);
      } else {
        console.error("Failed to fetch data");
      }
    };
    if (intraCode) {
      const urlWithoutCode = window.location.href.split("?")[0];
      window.history.replaceState({}, document.title, urlWithoutCode);
      intra_get_data();
    }
  }, [intraCode]);

  useEffect(() => {
    if (googleAuthUrl) window.location.href = googleAuthUrl;
    if (intraAuthUrl) {
      window.location.href = intraAuthUrl;
    }
  }, [googleAuthUrl, intraAuthUrl]);

  const handleGoogleClick = () => {
    const getGoogleUrl = async () => {
      const response = await fetch(
        `http://${import.meta.env.VITE_IPADDRESS}:8000/auth/google-get-url`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setGoogleAuthUrl(data.code);
      } else {
        console.error("Failed to fetch data");
      }
    };
    getGoogleUrl();
  };
  console.log(
    "HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEE: ",
    `http://${import.meta.env.VITE_IPADDRESS}:8000/auth/intra-get-url`
  );
  const handleIntraClick = () => {
    const getIntraUrl = async () => {
      const response = await fetch(
        `http://${import.meta.env.VITE_IPADDRESS}:8000/auth/intra-get-url`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setIntraAuthUrl(data.code);
      } else {
        console.error("Failed to fetch data");
      }
    };
    getIntraUrl();
  };
  return (
    <>
      {user && openTfq && <OtfInput />}
      <div className={styles["authentication-signin-ways"]}>
        <img onClick={handleGoogleClick} src={logoGoogle} alt="" />
        <img onClick={handleIntraClick} src={logo42} alt="" />
      </div>
    </>
  );
}

export default SignInWays;
