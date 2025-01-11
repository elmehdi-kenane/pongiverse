import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "../assets/navbar-sidebar";
import "../assets/navbar-sidebar/index.css";
import AuthContext from "../navbar-sidebar/Authcontext";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
// import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import GameSettingsOptions from "./GameSettingsOptions";
// import { ToastContainer, toast } from 'react-toastify';
import toast, { Toaster } from "react-hot-toast";
import GameNotifications from "../GameNotif/GameNotifications";
// import 'react-toastify/dist/ReactToastify.css';

const GameSettings = () => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [typeChosen, setTypeChosen] = useState(1);
  const preventSlideChange = useRef(false);
  const [selectedItems, setSelectedItems] = useState([0, 0, 0]);
  // const selectedItemsRef = useRef(selectedItems);
  const [initialValue, setInitialValue] = useState(0);
  const [onSavingParams, setonSavingParams] = useState(false);

  let { privateCheckAuth, user, gameCustomize } = useContext(AuthContext);

  const swiperRef = useRef(null);
  const paddleBallColor = [
    "#C10000",
    "#1C00C3",
    "#00A006",
    "#C16800",
    "#C100BA",
    "#00C1B6",
    "#FFE500",
    "#FFFFFF",
  ];
  const boardColor = ["#000000", "#5241AB", "#834931", "#8a7dac00", "#004E86"];

  const [paddleClr, setPaddleClr] = useState("#FFFFFF");
  const [ballClr, setBallClr] = useState("#1C00C3");
  const [tableClr, setTableClr] = useState("#8a7dac00");

  const [ballSelection, setBallSelection] = useState(false);
  // const ballSelectionRef = useRef(ballSelection)
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   privateCheckAuth();
  // }, []);

  // useEffect(() => {
  //   ballSelectionRef.current = ballSelection
  // }, [ballSelection])

  const handleSlideChange = (swiper) => {
    if (preventSlideChange.current) return;
    const currentIndex = swiper.realIndex;
    setActiveSlideIndex(currentIndex);
    if (typeChosen === 1) {
      setSelectedItems([swiper.realIndex, selectedItems[1], selectedItems[2]]);
      setPaddleClr(paddleBallColor[swiper.realIndex]);
    } else if (typeChosen === 2) {
      setSelectedItems([selectedItems[0], swiper.realIndex, selectedItems[2]]);
      setBallClr(paddleBallColor[swiper.realIndex]);
    } else if (typeChosen === 3) {
      setSelectedItems([selectedItems[0], selectedItems[1], swiper.realIndex]);
      setTableClr(boardColor[swiper.realIndex]);
    }
  };

  useEffect(() => {
    if (typeChosen === 1) {
      setInitialValue(selectedItems[0]);
      setBallSelection(false);
      if (swiperRef.current && swiperRef.current.swiper)
        swiperRef.current.swiper.slideToLoop(selectedItems[0], 0, false);
    } else if (typeChosen === 2) {
      setInitialValue(selectedItems[1]);
      setBallSelection(true);
      if (swiperRef.current && swiperRef.current.swiper)
        swiperRef.current.swiper.slideToLoop(selectedItems[1], 0, false);
    } else if (typeChosen === 3) {
      setInitialValue(selectedItems[2]);
      setBallSelection(false);
      if (swiperRef.current && swiperRef.current.swiper)
        swiperRef.current.swiper.slideToLoop(selectedItems[2], 0, false);
    }
  }, [typeChosen]);

  const handleTypeChange = (type) => {
    preventSlideChange.current = true;
    setTypeChosen(type);
    preventSlideChange.current = false;
  };

  const savingSettings = async () => {
    // const ballSlt = ballSelectionRef.current
    if (user) {
      try {
        let response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/customizeGame`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: user,
              paddle: paddleBallColor[selectedItems[0]],
              ball: paddleBallColor[selectedItems[1]],
              board: boardColor[selectedItems[2]],
              effect: isChecked,
            }),
          }
        );
        if (response.status === 401) {
          setonSavingParams(false);
          navigate('/signin')
        }
        if (!response.ok) {
          toast.error(response.message, {
            position: "top-center",
            duration: 2000,
          });
          setonSavingParams(false);
        } else {
          setonSavingParams(false);
          toast.success("Settings updated successfully", {
            position: "top-center",
            duration: 2000,
          });
        }
      } catch (e) {
        console.log("something wrong with fetch");
        setonSavingParams(false);
      }
    } else {
      console.log("user variable is empty");
      setonSavingParams(false);
    }
  };

  const saveSettings = () => {
    // console.log(selectedItems)
    setonSavingParams(true);
    savingSettings();
  };

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const resetSettings = () => {
    setPaddleClr("#FFFFFF");
    setBallClr("#00C1B6");
    setTableClr("#8a7dac00");
    setSelectedItems([7, 5, 3]);
    if (typeChosen === 1) {
      if (swiperRef.current && swiperRef.current.swiper)
        swiperRef.current.swiper.slideToLoop(7, 0, false);
    } else if (typeChosen === 2) {
      if (swiperRef.current && swiperRef.current.swiper)
        swiperRef.current.swiper.slideToLoop(5, 0, false);
    } else if (typeChosen === 3) {
      if (swiperRef.current && swiperRef.current.swiper)
        swiperRef.current.swiper.slideToLoop(3, 0, false);
    }
  };

  return (
    <>
      <GameNotifications />
      <div
        className="onevsone"
        style={{ flexDirection: "column", position: "relative" }}
      >
        <Toaster
          toastOptions={{
            className: "",
            style: {
              border: "1px solid #713200",
              margin: "80px",
              // padding: "16px",
              color: "#713200",
            },
          }}
        />
        <GameSettingsOptions
          swiperRef={swiperRef}
          handleSlideChange={handleSlideChange}
          activeSlideIndex={activeSlideIndex}
          typeChosen={typeChosen}
          initialValue={initialValue}
        />
        <div className="gameCustom-components">
          <div
            onClick={() => handleTypeChange(1)}
            className={typeChosen === 1 ? "typeChosen" : ""}
          >
            {typeChosen === 1 ? (
              <img src={Icons.paddleFilled} alt="" />
            ) : (
              <img src={Icons.paddleEmpty} alt="" />
            )}
          </div>
          <div
            onClick={() => handleTypeChange(2)}
            className={typeChosen === 2 ? "typeChosen" : ""}
          >
            {typeChosen === 2 ? (
              <img src={Icons.ballFilled} alt="" />
            ) : (
              <img src={Icons.ballEmpty} alt="" />
            )}
          </div>
          <div
            onClick={() => handleTypeChange(3)}
            className={typeChosen === 3 ? "typeChosen" : ""}
          >
            {typeChosen === 3 ? (
              <img src={Icons.boardFilled} alt="" />
            ) : (
              <img src={Icons.boardEmpty} alt="" />
            )}
          </div>
        </div>
        <div
          className="gameCustom-review"
          style={{ backgroundColor: `${tableClr}`, border: "1px solid white" }}
        >
          <div
            style={{
              height: "90px",
              width: "50%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                height: "80%",
                width: "10px",
                backgroundColor: `${paddleClr}`,
                marginLeft: "10px",
              }}
            ></div>
          </div>
          <div
            style={{
              height: "100%",
              width: "50%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                height: "15px",
                width: "15px",
                backgroundColor: `${ballClr}`,
                marginLeft: "10px",
                borderRadius: "50%",
              }}
            ></div>
            {isChecked && (
              <div className="gameCustom-container">
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
                <div className="ball"></div>
              </div>
            )}
          </div>
        </div>
        <div
          className={!ballSelection ? "ballSelected" : ""}
          style={{
            color: "white",
            display: "flex",
            width: "80%",
            margin: "10px auto",
            justifyContent: "center",
            height: "40px",
            minHeight: "40px",
          }}
        >
          <label
            style={{
              height: "100%",
              width: "130px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0",
              marginTop: "0",
              border: "none",
              background:
                "linear-gradient(90deg, rgba(68, 45, 106, 1), rgba(68, 45, 106, 0.5))",
              textIndent: "0",
              borderRadius: "20px",
              fontSize: "15px",
              gap: "5px",
            }}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="checkbox-input"
            />
            <span className="checkbox-custom"></span>
            Ball Effect
          </label>
        </div>
        <div className="gameCustom-selects">
          <button onClick={() => navigate("/mainpage/game")}>Back</button>
          <div>
            <button onClick={resetSettings}>Reset</button>
            {!onSavingParams ? (
              <button onClick={saveSettings}>Save</button>
            ) : (
              <button id="gameCustom-selects-saving" style={{ opacity: "0.5" }}>
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GameSettings;
