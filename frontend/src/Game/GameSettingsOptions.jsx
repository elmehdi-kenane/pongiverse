import React, { useEffect, useRef } from 'react';
import * as Icons from '../assets/navbar-sidebar';
import '../assets/navbar-sidebar/index.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';

const GameSettingsOptions = ({ handleSlideChange, activeSlideIndex, typeChosen, initialValue, swiperRef }) => {
  // const swiperRef = useRef(null);

  // useEffect(() => {
  //  console.log("INITIAL VALUE IS : ", initialValue)
  //   if (swiperRef.current && swiperRef.current.swiper) {
  //     swiperRef.current.swiper.slideToLoop(initialValue, 0, false);
  //   }
  // }, [initialValue]);

  // useEffect(() => {
  //  console.log("INITIAL VALUE IS:", initialValue);
  //   if (swiperRef.current && swiperRef.current.swiper) {
  //     swiperRef.current.swiper.slideToLoop(initialValue, 0, false);
  //   }
  // }, [initialValue, swiperRef]);

  return (
    <div className='slider-container'>
      <Swiper
        ref={swiperRef}
        effect={'coverflow'}
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
          el: '.swiper-pagination',
          clickable: true,
        }}
        navigation={{
          clickable: false,
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        onSlideChange={handleSlideChange}
        modules={[EffectCoverflow, Pagination, Navigation]}
        className="mySwiper"
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <SwiperSlide key={index} className={activeSlideIndex === index ? 'slider-container-active' : ''}>
            <div className='slider-container-bg'>
              <img src={Icons.bgPaddleCm} alt="Background" />
              {typeChosen === 1 ? (
                <div className='slider-container-pbb'>
                  <img className={activeSlideIndex === index ? 'slider-container-rotatePaddle' : ''} src={Icons[`paddle${index}`]} alt="Paddle" />
                </div>
              ) : typeChosen === 2 ? (
                <div className='slider-container-pbb'>
                  <img className={activeSlideIndex === index ? 'slider-container-ball slider-container-moveBall' : 'slider-container-ball'} src={Icons[`ball${index}`]} alt="Ball" />
                </div>
              ) : (
                <div className='slider-container-pbb'>
                  <img className={activeSlideIndex === index ? 'slider-container-rotatePaddle' : ''} src={Icons[`board${index}`]} alt="Board" />
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
        {typeChosen !== 3 && [5, 6, 7].map((index) => (
          <SwiperSlide key={index} className={activeSlideIndex === index ? 'slider-container-active' : ''}>
            <div className='slider-container-bg'>
              <img src={Icons.bgPaddleCm} alt="Background" />
              {typeChosen === 1 ? (
                <div className='slider-container-pbb'>
                  <img className={activeSlideIndex === index ? 'slider-container-rotatePaddle' : ''} src={Icons[`paddle${index}`]} alt="Paddle" />
                </div>
              ) : typeChosen === 2 ? (
                <div className='slider-container-pbb'>
                  <img className={activeSlideIndex === index ? 'slider-container-ball slider-container-moveBall' : 'slider-container-ball'} src={Icons[`ball${index}`]} alt="Ball" />
                </div>
              ) : (
                <div className='slider-container-pbb'>
                  <img className={activeSlideIndex === index ? 'slider-container-rotatePaddle' : ''} src={Icons[`board${index}`]} alt="Board" />
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
  );
};

export default GameSettingsOptions;
