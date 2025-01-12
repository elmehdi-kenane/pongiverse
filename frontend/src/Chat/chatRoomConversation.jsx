import { useContext, useEffect, useRef, useState } from "react"
import * as ChatIcons from "../assets/chat/media/index"
import ChatContext from "../Context/ChatContext"
import AuthContext from "../navbar-sidebar/Authcontext"
import MyMessage from "./myMessage"
import OtherMessage from "./otherMessage"
import { useClickOutSide } from "../Chat/chatConversation"
import SendMessage from "./sendMessage"
import LeaveChatRoomPopUp from "./chatRoomOptions/leaveChatRoomPopUp"
import ChatRoomMembersList from "./chatRoomOptions/chatRoomMembersList"
import ChatRoomInfos from "./chatRoomOptions/chatRoomInfos"
import { resetChatRoomUnreadMessages } from "./chatConversationItem"
import { useNavigate } from "react-router-dom"

const ChatRoomConversation = ({
  chatRoomMessages,
  setChatRoomMessages,
  chatRooms,
  setChatRooms,
  searchValue,
  setSearchValue,
  setChatRoomsSearch,
}) => {
  const [showChatRoomInfos, setShowChatRoomInfos] = useState(false)
  const [showChatRoomMembers, setShowChatRoomMembers] = useState(false)
  const [showLeaveRoomPopUp, setShowLeaveRoomPopUp] = useState(false)
  const [showChatRoomOptions, setShowChatRoomOptions] = useState(false)
  const navigate = useNavigate()
  const [currentChatRoomMessagesPage, setCurrentChatRoomMessagesPage] =
    useState(1)
  const [hasMoreChatRoomMessages, setHasMoreChatRoomMessages] = useState(true)
  const [chatRoomChanged, setChatRoomChanged] = useState(false)
  const messageEndRef = useRef(null)
  const messageBodyRef = useRef(null)
  const [lastMessage, setLastMessage] = useState(messageEndRef)
  const [firstScroll, setFirstScroll] = useState(true)
  const [loading, setLoading] = useState(false)

  const { selectedChatRoom, setSelectedChatRoom, setSelectedItem } = useContext(ChatContext)
  const { user, chatSocket } = useContext(AuthContext)

  const [messageToSend, setMessageToSend] = useState("")
  const sendMessage = (message) => {
    if (
      chatSocket &&
      chatSocket.readyState === WebSocket.OPEN &&
      message.trim() !== ""
    ) {
      chatSocket.send(
        JSON.stringify({
          type: "message",
          data: {
            id: selectedChatRoom.id,
            name: selectedChatRoom.name,
            sender: user,
            message: message,
          },
        })
      )
      if (searchValue !== "") {
        const isExist = chatRooms.some((room) => room.id === selectedChatRoom.id)
        if (!isExist) {
          const newChatRoomConversation = {
            id: selectedChatRoom.id,
            name: selectedChatRoom.name,
            icon: selectedChatRoom.icon,
            lastMessage: message,
            unreadCount: 0,
          }
          setChatRooms([newChatRoomConversation, ...chatRooms])

        } else {
          setChatRooms((prev) => {
            const updatedChatRooms = prev.map((room) => {
              if (room.id === selectedChatRoom.id) {
                return { ...room, lastMessage: message }
              }
              return room
            }
            )
            return updatedChatRooms
          })
          const selectedChatRoomIndex = chatRooms.findIndex(
            (room) => room.id === selectedChatRoom.id
          )
          const splitedChatRooms = chatRooms.splice(selectedChatRoomIndex, 1)
          setChatRooms([splitedChatRooms[0], ...chatRooms])
          resetChatRoomUnreadMessages(user, selectedChatRoom.id, navigate)
        }
      }
      setSearchValue("")
      setChatRoomsSearch("")
      setMessageToSend("")
    }
  }

  useEffect(() => {
    setChatRoomMessages([])
    setCurrentChatRoomMessagesPage(1)
    setHasMoreChatRoomMessages(true)
    setChatRoomChanged(true)
    setFirstScroll(true)
  }, [selectedChatRoom.name])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS
          }:${import.meta.env.VITE_PORT}/chatAPI/chatRoom/messages/${selectedChatRoom.id
          }?page=${currentChatRoomMessagesPage}`, {
          credentials: "include",
        }
        )
        if (response.ok) {
          const { next, results } = await response.json()
          setChatRoomMessages([...results, ...chatRoomMessages])
          if (!next) setHasMoreChatRoomMessages(false)
        } else if (response.status === 401)
          navigate("/signin")
        else {
         console.log("Error fetching messages")
        }
      } catch (error) {
        console.log(error)
      }
    }
    if (hasMoreChatRoomMessages) {
      if (currentChatRoomMessagesPage > 1) {
        const previousScrollHeight = messageBodyRef.current.scrollHeight
        fetchMessages().then(() => {
          setTimeout(() => {
            const newScrollHeight = messageBodyRef.current.scrollHeight
            const scrollHeightDifference =
              newScrollHeight - previousScrollHeight
            messageBodyRef.current.scrollTop = scrollHeightDifference
          }, 0)
        })
      } else {
        fetchMessages()
      }
    }
    setChatRoomChanged(false)
  }, [chatRoomChanged, currentChatRoomMessagesPage])

  const updateLastMessage = () => {
    setChatRooms((prev) => {
      const updatedChatRooms = prev.map((room) => {
        if (room.roomId === selectedChatRoom.id) {
          return { ...room, lastMessage: chatRoomMessages[0].content }
        }
        return room
      })
      return updatedChatRooms
    })
  }

  
  useEffect(() => {
    if (messageEndRef && messageEndRef.current && messageBodyRef && messageBodyRef.current) {
      const messageEndOffset = messageEndRef.current.offsetTop
      const containerHeight = messageBodyRef.current.clientHeight

      messageBodyRef.current.scrollTo({
        top: messageEndOffset - containerHeight + messageEndRef.current.clientHeight,
        behavior: "smooth"
      })
      
      updateLastMessage()
      setFirstScroll(false)
    }
  }, [chatRoomMessages, lastMessage])

  let domNode = useClickOutSide(() => {
    setShowChatRoomOptions(false)
  })

  const handleScroll = () => {
    if (messageBodyRef.current) {
      const { scrollTop } = messageBodyRef.current
      if (scrollTop === 0 && hasMoreChatRoomMessages && !firstScroll) {
        setLoading(true)
        setCurrentChatRoomMessagesPage((prev) => prev + 1)
      }
    }
  }

  return (
    <>
      {showLeaveRoomPopUp && (
        <LeaveChatRoomPopUp
          setShowLeaveRoomPopUp={setShowLeaveRoomPopUp}
          roomId={selectedChatRoom.id}
          setSelectedChatRoom={setSelectedChatRoom}
        />
      )}
      {showChatRoomMembers && (
        <ChatRoomMembersList
          showChatRoomMembers={showChatRoomMembers}
          setShowChatRoomMembers={setShowChatRoomMembers}
          roomId={selectedChatRoom.id}
          setSelectedChatRoom={setSelectedChatRoom}
        />
      )}
      {showChatRoomInfos && (
        <ChatRoomInfos
          setShowChatRoomInfos={setShowChatRoomInfos}
          selectedChatRoom={selectedChatRoom}
          setSelectedChatRoom={setSelectedChatRoom}
        />
      )}
      <div className="conversation-header">
        <div className="conversation-header-info">
          <img
            src={ChatIcons.arrowLeft}
            alt=""
            className="conversation-back-arrow"
            onClick={() => {
              setSelectedChatRoom({
                name: "",
                membersCount: "",
                icon: "",
                id: "",
              })
              setChatRoomMessages([])
              setSelectedItem("")
            }}
          />
          <img
            src={selectedChatRoom.icon}
            alt="Avatar"
            className="conversation-avatar"
          />
          <div className="conversation-details">
            <div className="conversation-name">{selectedChatRoom.name}</div>
            <div className="conversation-info">
              {selectedChatRoom.membersCount}{" "}
              {selectedChatRoom.membersCount > 1 ? "Members" : "Member"}
            </div>
          </div>
        </div>
        <div className="conversation-options-wrapper" ref={domNode}>
          <img
            onClick={() => {
              showChatRoomOptions
                ? setShowChatRoomOptions(false)
                : setShowChatRoomOptions(true)
            }}
            src={ChatIcons.ThreePoints}
            alt="Options"
            className="conversation-options-icon"
          />
          {showChatRoomOptions ? (
            <div className="room-options-container">
              <div
                className="leave-chat-room-option"
                onClick={() => {
                  setShowLeaveRoomPopUp(true)
                  setShowChatRoomOptions(false)
                }}
              >
                Leave Chat Room
              </div>
              <div
                className="members-list-option"
                onClick={() => {
                  setShowChatRoomMembers(true)
                  setShowChatRoomOptions(false)
                }}
              >
                Members List
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <div
        className="conversation-body"
        ref={messageBodyRef}
        onScroll={handleScroll}
      >
        {chatRoomMessages.length !== 0 &&
          chatRoomMessages.map((message, index) =>
            message.sender === user ? (
              <MyMessage
                key={index}
                name={user}
                content={message.content}
                date={message.date}
                length={chatRoomMessages.length}
                endRef={messageEndRef}
                index={index}
              />
            ) : (
              <OtherMessage
                key={index}
                name={message.sender}
                content={message.content}
                date={message.date}
                length={chatRoomMessages.length}
                endRef={messageEndRef}
                index={index}
              />
            )
          )}
        <div ref={messageEndRef}></div>
      </div>
      <SendMessage
        sendMessage={sendMessage}
        messageToSend={messageToSend}
        setMessageToSend={setMessageToSend}
      />
    </>
  )
}

export default ChatRoomConversation
