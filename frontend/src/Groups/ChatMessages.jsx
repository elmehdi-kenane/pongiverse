import React, { useState, useEffect, useContext } from 'react';
import { json, useParams } from "react-router-dom"
import AuthContext from '../navbar-sidebar/Authcontext';


import "../assets/chat/Groups.css";

const ChatMessages = () => {
    const {roomId} = useParams()
    const [message , setMessage] = useState('');
    const [messages, setMessages] = useState([])
    const [newMessage, setnewMessage] = useState('')
    const {user} = useContext(AuthContext)
    const {socket} = useContext(AuthContext)

    useEffect(() => {
        const fetchMessages = async () => {
          try {
            const response = await fetch(`http://localhost:8000/chatAPI/channels/messages/${roomId}`);
            const data = await response.json();
            setMessages(data)
            console.log(data)
          } catch (error) {
            console.log(error);
          }
        };
        if(user)
          fetchMessages();
      }, [user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        document.getElementById("message").value = ""
        console.log("Message is:",message)
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log("OPENED")
            socket.send(JSON.stringify({
                type: 'message',
                data : {
                    room_id: roomId,
                    sender: user,
                    message: message,
                }
            }))
        }
    }

    useEffect (() => {
        if(socket){
            socket.onmessage = (e) =>{
                let data = JSON.parse(e.data)
                console.log("recived messages: ",data.message)
                if(data.type === "newMessage")
                {
                    setnewMessage(data.data)
                }
            }
        }
    }, [socket])

    useEffect (() => {
        if(newMessage){
           setMessages((prev) => [...prev, newMessage]) 
        }
    }, [newMessage])


    const getMessage = (e) => {
        setMessage(e.target.value)
    }

    return (
        <div className="full-page" style={{color:'white'}}>
            <div className="conversation-list">
                {/* Here will be list of Rooms */}
            </div>
            <div className="conversations">
                <div className="messages-space">
                    {messages.map( (mess, index) => (
                            <div key={index}>{mess.content}</div>
                        )
                    )}
                </div>
                <form action="submit" onSubmit={handleSubmit}>
                    <input type="text" name="messages" required id="message" placeholder='Type your message...' onChange={getMessage}/>
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    )
}

export default ChatMessages
