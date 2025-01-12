import { useContext, useEffect, useRef, useState } from "react"
import ChatContext from "../Context/ChatContext"
import AuthContext from "../navbar-sidebar/Authcontext"
import SendMessage from "./sendMessage"
import ChatConversationHeader from "./chatConversationHeader"
import ChatConversationBody from "./chatConversationBody"
import { resetUnreadMessages } from "./chatConversationItem"
import { useNavigate } from "react-router-dom"

export let useClickOutSide = (handler) => {
  let domNode = useRef()
  useEffect(() => {
    let eventHandler = (event) => {
      if (domNode.current && !domNode.current.contains(event.target)) handler()
    }
    document.addEventListener("mousedown", eventHandler)
    return () => {
      document.removeEventListener("mousedown", eventHandler)
    }
  })
  return domNode
}

const ChatConversation = ({
  messages,
  setMessages,
  setShowBlockPopup,
  directs,
  setDirects,
  searchValue,
  setSearchValue,
  setDirectsSearch,
}) => {
  const [showDirectOptions, setShowDirectOptions] = useState(false)
  const { selectedDirect, setSelectedDirect } = useContext(ChatContext)
  const { user, chatSocket, userImg } = useContext(AuthContext)
  const navigate = useNavigate()
  const [currentMessagePage, setCurrentMessagePage] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [userChanged, setUserChanged] = useState(false)
  const messageEndRef = useRef(null)
  const messageBodyRef = useRef(null)
  const [lastMessage, setLastMessage] = useState(messageEndRef)
  const [firstScroll, setFirstScroll] = useState(true)
  const [loading, setLoading] = useState(false)

  const [messageToSend, setMessageToSend] = useState("")
  const sendMessage = (message) => {
    if (
      chatSocket &&
      chatSocket.readyState === WebSocket.OPEN &&
      message.trim() !== ""
    ) {
      chatSocket.send(
        JSON.stringify({
          type: "directMessage",
          data: {
            sender: user,
            receiver: selectedDirect.id,
            message: message,
          },
        })
      )
      if (searchValue !== "") {
        const allDirects = directs
        const isExist = allDirects.some(
          (friend) => friend.name === selectedDirect.name
        )
        if (!isExist) {
          const newConversation = {
            id: selectedDirect.id,
            name: selectedDirect.name,
            avatar: selectedDirect.avatar,
            is_online: selectedDirect.status,
            lastMessage: message,
            unreadCount: 0,
          }
          setDirects([newConversation, ...directs])
        } else {
          // Update the last message of the selected direct and unread count and move to the top
          const updatedDirects = allDirects.map((friend) => {
            if (selectedDirect.name === friend.name) {
              return {
                ...friend,
                lastMessage: message,
                unreadCount: 0,
              }
            }
            return friend
          })
          // move the selected direct to the top
          const selectedDirectIndex = updatedDirects.findIndex(
            (friend) => friend.name === selectedDirect.name
          )
          const splitedDirects = updatedDirects.splice(selectedDirectIndex, 1)
          setDirects([splitedDirects[0], ...updatedDirects])
          resetUnreadMessages(user, selectedDirect.id, navigate)
        }
      }
      setSearchValue("")
      setDirectsSearch([])
      setMessageToSend("")
    }
  }
  let domNode = useClickOutSide(() => {
    setShowDirectOptions(false)
  })

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS
        }:${import.meta.env.VITE_PORT}/chatAPI/Directs/messages?page=${currentMessagePage}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: user,
            friend: selectedDirect.id,
          }),
        }
      )
      const { results, next } = await response.json()
      if (response.ok) {
        setMessages([...results, ...messages])
        if (!next) setHasMoreMessages(false)
      } else if (response.status === 401)
        navigate("/signin")
      else console.log("opps! something went wrong")
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    setMessages([])
    setCurrentMessagePage(1)
    setHasMoreMessages(true)
    setUserChanged(true)
    setFirstScroll(true)
  }, [selectedDirect.name])

  useEffect(() => {
    if (hasMoreMessages && selectedDirect) {
      if (currentMessagePage > 1) {
        const previousScrollHeight = messageBodyRef.current.scrollHeight

        fetchMessages().then(() => {
          setLoading(false)
          setTimeout(() => {
            const newScrollHeight = messageBodyRef.current.scrollHeight
            const scrollDifference = newScrollHeight - previousScrollHeight
            messageBodyRef.current.scrollTop += scrollDifference
          }, 0)
        })
      } else {
        fetchMessages()
      }
    }
    setUserChanged(false)
  }, [userChanged, currentMessagePage])

  const updateLastMessage = () => {
    setDirects((prevDirects) => {
      const updatedDirects = prevDirects.map((friend) => {
        if (friend.name === selectedDirect.name) {
          return {
            ...friend,
            lastMessage: messages[messages.length - 1].content,
          }
        }
        return friend
      })
      return updatedDirects
    })
  }

  const handelScroll = (e) => {
    if (messageBodyRef.current) {
      const { scrollTop } = messageBodyRef.current
      if (scrollTop === 0 && hasMoreMessages && !firstScroll) {
        setLoading(true)
        setCurrentMessagePage(currentMessagePage + 1)
      }
    }
  }

  useEffect(() => {
    if (messageEndRef && messageEndRef.current && messageBodyRef && messageBodyRef.current) {


      const messageEndOffset = messageEndRef.current.offsetTop
      const containerHeight = messageBodyRef.current.clientHeight
      messageBodyRef.current.scrollTo({
        top: messageEndOffset - containerHeight + messageEndRef.current.clientHeight,
        behavior: "smooth",
      })
  
      updateLastMessage()
      setFirstScroll(false)
    }
  }, [messages, lastMessage])
  
  

  return (
    <>
      <ChatConversationHeader
        setSelectedDirect={setSelectedDirect}
        selectedDirect={selectedDirect}
        chatSocket={chatSocket}
        showDirectOptions={showDirectOptions}
        setShowDirectOptions={setShowDirectOptions}
        domNode={domNode}
        user={user}
        setShowBlockPopup={setShowBlockPopup}
        setMessages={setMessages}
      />
      <ChatConversationBody
        loading={loading}
        messages={messages}
        userImg={userImg}
        messageBodyRef={messageBodyRef}
        handelScroll={handelScroll}
        messageEndRef={messageEndRef}
        user={user}
        selectedDirect={selectedDirect}
      />
      <SendMessage
        showDirectOptions={showDirectOptions}
        setShowDirectOptions={setShowDirectOptions}
        setMessageToSend={setMessageToSend}
        messageToSend={messageToSend}
        sendMessage={sendMessage}
      />
    </>
  )
}

export default ChatConversation
