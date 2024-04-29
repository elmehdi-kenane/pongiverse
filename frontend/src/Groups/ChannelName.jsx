import React, { useState } from "react";
import threePoints from './threePoints.svg'
import avatar from './avatar.svg'

const ChannelName = (props) => {
    const [showOptions, setShowOptions] = useState(false)

    const handlOnclick = (e) =>{
        if(!showOptions)
            setShowOptions(true)
        else
            setShowOptions(false)
    }

    return (
        <>
            <div className="channel">
                <div className="channel-details">
                    <img src={avatar} alt="" />
                    <div className="name-container">
                        <div className="channel-name">{props.name}</div>
                        <div className="members-number">12 Members</div>
                    </div>
                </div>
                <div id="three-points"  onClick={handlOnclick}>
                    <img src={threePoints} alt=""/>
                    {/* {showOptions &&    <div className="options">
                    </div>} */}
                </div>
            </div>
        </>
    )
}


export default ChannelName