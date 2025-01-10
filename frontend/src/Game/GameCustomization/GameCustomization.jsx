import { useState, useRef, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../navbar-sidebar/Authcontext";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import * as Icons from "../../assets/navbar-sidebar";
import "./GameCustomization.css";

const GameCustomization = () => {
  const [activeTab, setActiveTab] = useState("Table");
  const [tableColor, setTableColor] = useState("#00ff00");
  const [paddleColor, setPaddleColor] = useState("#0000ff");
  const [ballColor, setBallColor] = useState("#ff0000");

  const handleReset = () => {
    setTableColor("#00ff00");
    setPaddleColor("#0000ff");
    setBallColor("#ff0000");
  };
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

  const TABS = [
    { name: "Table", type: 3, icon: Icons.boardEmpty },
    { name: "Ball", type: 2, icon: Icons.ballEmpty },
    { name: "Paddle", type: 1, icon: Icons.paddleEmpty },
  ];

  return (
    <div className="customization-page">
      <div className="customization-container">
        <div className="customization-tabs">
          {TABS.map((tab) => (
            <div
              key={tab.name}
              className={`customization-tab ${
                activeTab === tab.name ? "customization-tab-active" : ""
              }`}
              onClick={() => {
                setActiveTab(tab.name);
                handleTypeChange(tab.type);
              }}
            >
              {tab.name}
              </div>
          ))}
        </div>
        <div className="customization-options">
          <div className="customization-preview">
            <p className="customization-preview-text">Preview</p>
          </div>

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
          <div className="customization-colors">
            <div className="customization-colors-title">
              <p>Choose a color</p>
            </div>
            <div className="customization-colors-options">
              {paddleBallColor.map((color, index) => (
                <div
                  key={index}
                  className="customization-colors-option"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    if (typeChosen === 1) {
                      setPaddleClr(color);
                      setSelectedItems([index, selectedItems[1], selectedItems[2]]);
                    } else if (typeChosen === 2) {
                      setBallClr(color);
                      setSelectedItems([selectedItems[0], index, selectedItems[2]]);
                    } else if (typeChosen === 3) {
                      setTableClr(color);
                      setSelectedItems([selectedItems[0], selectedItems[1], index]);
                    }
                  }}
                ></div>
              ))}
            </div>
          </div>
          <div className="customization-actions-buttons">
            <button
              className="customization-actions-button"
              onClick={() => {
                handleReset();
              }}
            >
              Reset
            </button>
            <button
              className="customization-actions-button"
              onClick={() => {
                setonSavingParams(true);
                gameCustomize(selectedItems[0], selectedItems[1], selectedItems[2]);
                setTimeout(() => {
                  setonSavingParams(false);
                  navigate("/mainpage");
                }, 2000);
              }}
            >
              {onSavingParams ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCustomization;
