import MyRoom from "./MyRoom";
import "../assets/chat/Groups.css";

const Rooms = () => {

  const onClickScroller = (handle) => {
    const slider = document.getElementsByClassName("rooms-slider")[0]
    console.log(slider)
    console.log(parseInt(getComputedStyle(slider).getPropertyValue("--slider-index")))
    let sliderIndex = parseInt(getComputedStyle(slider).getPropertyValue("--slider-index"))
    console.log(sliderIndex)
    if(handle === 'left')
      slider.style.setProperty("--slider-index", sliderIndex - 1)
    else if (handle === 'right')
      slider.style.setProperty("--slider-index", sliderIndex + 1)
  }
  return (
    <div className="rooms-page">
      <div className="rooms-container">
      {/* <div className="create-join-row"></div> */}
      {/* <div className="my-rooms-row"> */}
        {/* <div className="hande left-hande" onClick={() => onClickScroller("left")}></div> */}
        {/* <div className="slider-container"> */}
        {/* <div className="rooms-slider">
          <div className="room-box">box1</div>
          <div className="room-box">box2</div>
          <div className="room-box">box3</div>
          <div className="room-box">box4</div>
          <div className="room-box">box5</div>
          <div className="room-box">box6</div>
          <div className="room-box">box7</div>
          <div className="room-box">box8</div>
        </div> */}
        {/* </div> */}
        {/* <div className="hande right-hande" onClick={() => onClickScroller("right") }></div> */}
      {/* </div> */}
      {/* <div className="suggested-room-row"> */}
        {/* <div className="hande left-hande"></div>
        <div className="rooms-slider">
          <div className="room-box">box1</div>
          <div className="room-box">box2</div>
          <div className="room-box">box3</div>
          <div className="room-box">box4</div>
          <div className="room-box">box5</div>
          <div className="room-box">box6</div>
          <div className="room-box">box7</div>
          <div className="room-box">box8</div>
        </div>
        <div className="hande right-hande"></div> */}
      {/* </div> */}
      </div>
    </div> 
  );
};

export default Rooms;
