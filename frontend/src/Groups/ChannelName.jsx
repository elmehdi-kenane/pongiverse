import React, { useState } from "react";
import threePoints from './threePoints.svg'
import avatar from './avatar.svg'
import { useNavigate } from "react-router-dom";
import { json, useParams } from "react-router-dom"


const ChannelName = (props) => {
    const [showOptions, setShowOptions] = useState(false)
    const navigate = useNavigate()
    // const {roomId} = useParams()
    const handlOnclick = (e) =>{
        if(!showOptions)
            setShowOptions(true)
        else
            setShowOptions(false)
    }

    const onClickhandler = () => {
        console.log(props.roomId)
        navigate(`../Chat/${props.roomId}`)
    }

    return (
        <>
            <div className="channel" onClick={onClickhandler}>
                <div className="channel-details">
                    <img src={avatar} alt="" className="channel__avatar"/>
                    <div className="name-container">
                        <div className="channel-name">{props.name}</div>
                        <div className="members-number">12 Members</div>
                    </div>
                </div>
                <div id="three-points"  onClick={handlOnclick}>
                    <img src={threePoints} alt=""/>
                    {showOptions &&    <div className="options">
                    </div>}
                </div>
            </div>
        </>
    )
}


export default ChannelName