import React, { useState, useEffect, useContext } from 'react';
import { json, useParams } from "react-router-dom"
import SocketContext from './SocketContext';
import AuthContext from '../navbar-sidebar/Authcontext';




const ChatMessages = () => {
    const {roomId} = useParams()
    const [message , setMessage] = useState('');
    const [messages, setMessages] = useState([])
    const [newMessage, setnewMessage] = useState('')
    const {chatSocket} = useContext(SocketContext)
    const {user} = useContext(AuthContext)

    useEffect(() => {
        const fetchMessages = async () => {
          try {
            const response = await fetch(`http://localhost:8000/chatAPI/channels/messages/${roomId}`);
            const data = await response.json();
            setMessages(data)
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
        chatSocket.send(JSON.stringify({
            type: 'message',
            data : {
                room_id: roomId,
                sender: user,
                message: message,
            }
        }))
    }

    useEffect (() => {
        if(chatSocket){
            chatSocket.onmessage = (e) =>{
                let data = JSON.parse(e.data)
                console.log("recived messages: ",data.message)
                if(data.type === "newMessage")
                    setnewMessage(data.message)
            }
        }
    }, [chatSocket])

    useEffect (() => {
        if(newMessage){
           setMessages((prev) => [...prev, newMessage]) 
        }
    }, [newMessage])


    const getMessage = (e) => {
        setMessage(e.target.value)
    }

    return (
        <div className="full-page">
            <div className="conversation-list">
                Here will be list of Rooms
            </div>
            <div className="conversations">
                <div className="messages-space">
                    {messages.map( mess => (
                            <div key={mess.id}>{mess.content}</div>
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
