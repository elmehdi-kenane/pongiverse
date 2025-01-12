import { useState, useRef, useContext, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../navbar-sidebar/Authcontext";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import * as Icons from "../../assets/navbar-sidebar";
import GameCustomizationPreview from "./GameCustomizationPreview";
import "./GameCustomization.css";
import { toast, Toaster } from "react-hot-toast";

const GameCustomization = () => {
  const [activeTab, setActiveTab] = useState("Paddle");
  const [tableColor, setTableColor] = useState("#00ff00");
  const [paddleColor, setPaddleColor] = useState("#0000ff");
  const [ballColor, setBallColor] = useState("#ff0000");
  const [showPreview, setShowPreview] = useState(false);

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [typeChosen, setTypeChosen] = useState(1);
  const preventSlideChange = useRef(false);
  const [selectedItems, setSelectedItems] = useState([0, 0, 0]);
  const [initialValue, setInitialValue] = useState(0);
  const [onSavingParams, setonSavingParams] = useState(false);

  let { privateCheckAuth, user, setIsBlur, isBlur } = useContext(AuthContext);

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

  const savingSettings = async () => {
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

  const TABS = [
    { name: "Paddle", type: 1 },
    { name: "Ball", type: 2, },
    { name: "Table", type: 3,},
  ];

  const handleTypeChange = (tab) => {
    preventSlideChange.current = true;
    setTypeChosen(tab.type);
    setActiveTab(tab.name);
    preventSlideChange.current = false;
  };


  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  }


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

  const saveSettings = () => {
    setonSavingParams(true);
    savingSettings();
  };

  return (
    <>
      {showPreview && (
        <GameCustomizationPreview
          setShowPreview={setShowPreview}
          paddleClr={paddleClr}
          ballClr={ballClr}
          tableClr={tableClr}
          setIsBlur={setIsBlur}
          isChecked={isChecked}
        />
      )}
    <div className={ isBlur ? "customization-page blur" : 'customization-page'}>
    <Toaster
          toastOptions={{
            className: "",
            style: {
              border: "1px solid #713200",
              color: "#713200",
            },
          }}
        />
      <div className="customization-container">
        <div className="customization-tabs">
          {TABS.map((tab) => (
            <div
              key={tab.name}
              className={`customization-tab ${
                activeTab === tab.name ? "customization-tab-active" : ""
              }`}
              onClick={() => {
                handleTypeChange(tab);
              }}
            >
              {tab.name}
              </div>
          ))}
        </div>
        <div className="customization-options">
        <div className="customization-preview" >
            <p className="customization-preview-text" onClick={()=>{setShowPreview(true); setIsBlur(true)}}>Preview</p>
        </div>
          {typeChosen === 2 ? (
            <div className="customization-options-ball-effect">
              <div
          className={!ballSelection ? "ballSelected" : ""}
          style={{
            color: "white",
            display: "flex",
            width: "80%",
            margin: "0 auto",
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
            </div>
          ): ""}
          

          <div className="slider-container">
            <Swiper
              ref={swiperRef}
              effect={"coverflow"}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={2}
              loop={true}
              initialSlide={initialValue}
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 4,
              }}
              pagination={{
                el: ".swiper-pagination",
                clickable: true,
              }}
              navigation={{
                clickable: false,
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }}
              onSlideChange={handleSlideChange}
              modules={[EffectCoverflow, Pagination, Navigation]}
              className="mySwiper"
            >
              {[0, 1, 2, 3, 4].map((index) => (
                <SwiperSlide
                  key={index}
                  className={
                    activeSlideIndex === index ? "slider-container-active" : ""
                  }
                >
                  <div className="slider-container-bg">
                    <img src={Icons.bgPaddleCm} alt="Background" />
                    {typeChosen === 1 ? (
                      <div className="slider-container-pbb">
                        <img
                          className={
                            activeSlideIndex === index
                              ? "slider-container-rotatePaddle"
                              : ""
                          }
                          src={Icons[`paddle${index}`]}
                          alt="Paddle"
                        />
                      </div>
                    ) : typeChosen === 2 ? (
                      <div className="slider-container-pbb">
                        <img
                          className={
                            activeSlideIndex === index
                              ? "slider-container-ball slider-container-moveBall"
                              : "slider-container-ball"
                          }
                          src={Icons[`ball${index}`]}
                          alt="Ball"
                        />
                      </div>
                    ) : (
                      <div className="slider-container-pbb">
                        <img
                          className={
                            activeSlideIndex === index
                              ? "slider-container-rotatePaddle"
                              : ""
                          }
                          src={Icons[`board${index}`]}
                          alt="Board"
                        />
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
              {typeChosen !== 3 &&
                [5, 6, 7].map((index) => (
                  <SwiperSlide
                    key={index}
                    className={
                      activeSlideIndex === index
                        ? "slider-container-active"
                        : ""
                    }
                  >
                    <div className="slider-container-bg">
                      <img src={Icons.bgPaddleCm} alt="Background" />
                      {typeChosen === 1 ? (
                        <div className="slider-container-pbb">
                          <img
                            className={
                              activeSlideIndex === index
                                ? "slider-container-rotatePaddle"
                                : ""
                            }
                            src={Icons[`paddle${index}`]}
                            alt="Paddle"
                          />
                        </div>
                      ) : typeChosen === 2 ? (
                        <div className="slider-container-pbb">
                          <img
                            className={
                              activeSlideIndex === index
                                ? "slider-container-ball slider-container-moveBall"
                                : "slider-container-ball"
                            }
                            src={Icons[`ball${index}`]}
                            alt="Ball"
                          />
                        </div>
                      ) : (
                        <div className="slider-container-pbb">
                          <img
                            className={
                              activeSlideIndex === index
                                ? "slider-container-rotatePaddle"
                                : ""
                            }
                            src={Icons[`board${index}`]}
                            alt="Board"
                          />
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                ))}
            </Swiper>
            <div className="swiper-pagination"></div>
            <div className="swiper-button-next"></div>
            <div className="swiper-button-prev"></div>
          </div>
        </div>
        <div className="customization-actions">
          <div className="customization-actions-buttons">
      
            <div className="customization-save-actions">
              {/* Back and play buttons */}
              <button
                className="customization-back"
                onClick={() => {
                  navigate("/mainpage/game");
                }}
              >
                Back
              </button>
          </div>
          <div className="customization-save-actions">
              {/* Applay and reset buttons */}
              <button
                className="customization-save"
                onClick={() => {
                  saveSettings();
                }}
                disabled={onSavingParams}
              >
                Save
              </button>
              <button className="customization-reset" onClick={resetSettings}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default GameCustomization;
