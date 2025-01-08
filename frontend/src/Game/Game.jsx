import React,  { useContext, useEffect, useState, useRef }  from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import { Link, useNavigate } from 'react-router-dom';


const Game = () => {
    let { privateCheckAuth, socket, setSocket, user, socketRecreated, setSocketRecreated } = useContext(AuthContext)
    const [allSet, setAllSet] = useState(false)
    const [playerNo, setPlayerNo] = useState(0)
    const [roomID, setRoomID] = useState(null)
    const [tmpRoomID, setTmpRoomID] = useState(null)
    const [start, setStart] = useState(false)
    const navigate = useNavigate();

    // useEffect(() => {
    //     privateCheckAuth()
    // }, [])

    useEffect(() => {
        if (socket) {
            if (socketRecreated && user) {
                socket.send(JSON.stringify({
                    type: 'dataBackUp',
                    message: {
                        user: user,
                        roomID: roomID,
                    }
                }))
                setSocketRecreated(false)
            } else if (!socketRecreated && user) {
                if (socket && socket.readyState === WebSocket.OPEN && user) {
                    socket.send(JSON.stringify({
                        type: 'isPlayerInAnyRoom',
                        message: {
                            user: user
                        }
                    }))
                    // setSearchDisable(false)
                }
            }
        }
    }, [socketRecreated, socket, user])

    useEffect(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.onmessage = (event) => {
                let data = JSON.parse(event.data)
                let type = data.type
                let message = data.message
                if (type === 'roomAlreadyStarted') {
                    navigate(`../play/${message.roomID}`)
                } else if (type === "gameReady") {
                    setRoomID(message.id)
                    setAllSet(true)
                    // setStartDisable(false)
                } else if (type === "playersReady") {
                    setAllSet(true)
                } else if (type === "playerNo") {
                    setPlayerNo(message.playerNo)
                    setTmpRoomID(message.id)
                } else if (type === "removeRoom") {
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({
                            type: 'OpponentIsOut',
                            message: {
                                user: user,
                                roomID: roomID
                            }
                        }))
                    }
                    setStart(false)
                    setPlayerNo(0)
                    setAllSet(false)
                    setRoomID(null)
                }
            }
        }

        if (allSet && roomID) {
            setTimeout(() => {
                navigate(`../play/${roomID}`)
            }, 250);
        }
    }, [socket, start, allSet, roomID, tmpRoomID])

    const startSearch = async () => {
        if (socket && socket.readyState === WebSocket.OPEN && !start) {
            //console.log("inside join")
            socket.send(JSON.stringify({
                type: 'join',
                message: {
                    user: user,
                }
            }))
            setStart(!start)
        } else if (socket && socket.readyState === WebSocket.OPEN && start) {
            //console.log("inside join")
            socket.send(JSON.stringify({
                type: 'quit',
                message: {
                    user: user,
                    id: tmpRoomID
                }
            }))
            setTmpRoomID(false)
            setStart(!start)
        } else
            console.log('socket is null or not open, refresh')
    }

    return (
        <div style={{height:"100px"}}>
            <div style={{color:'white', fontSize:'40px'}}>this is the gaming page</div>
            <button onClick={startSearch} style={{cursor:"pointer"}}>{start ? "cancel" : "Start"}</button>
        </div>
    )
}

export default Game