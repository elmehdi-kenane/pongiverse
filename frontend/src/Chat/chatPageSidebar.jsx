import { useContext, useEffect, useState } from "react"
import ChatContext from "../Context/ChatContext"
import ChatConversationItem from "./chatConversationItem"
import AuthContext from "../navbar-sidebar/Authcontext"
import ChatConversationSearchItem from "./chatConversationSearchItem"
import { useNavigate } from "react-router-dom"

const ChatSideBar = ({
  directs,
  setDirects,
  directsOnScroll,
  directsListInnerRef,
  chatRooms,
  setChatRooms,
  chatRoomsOnScroll,
  chatRoomsListInnerRef,
  setChatRoomMessages,
  setMessages,
  searchValue,
  setSearchValue,
  directsSearch,
  setDirectsSearch,
  chatRoomsSearch,
  setChatRoomsSearch,
}) => {
  const {
    setSelectedChatRoom,
    selectedChatRoom,
    setSelectedDirect,
    selectedDirect,
    setSelectedItem,
    isHome,
    setIsHome,
    selectedItem,
  } = useContext(ChatContext)

  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const handleSelectItem = (itemName) => {
    setSelectedItem(itemName)
  }
  const searchHandler = async () => {
    if (isHome) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS
          }:${import.meta.env.VITE_PORT}/chatAPI/directsSreach?searchUsername=${searchValue}&user=${user}`, {
          credentials: 'include'
        }
        )
        const data = await response.json()
        if (response.ok) {
          setDirectsSearch(data)
        } else if (response.status === 401)
          navigate("/signin")
        else {
         console.log("opps! something went wrong")
        }
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS
          }:${import.meta.env.VITE_PORT}/chatAPI/chatRoomsSreach?searchRoomName=${searchValue}&user=${user}`, {
          credentials: "include"
        }
        )
        const data = await response.json()
        if (response.ok) {
          setChatRoomsSearch(data)
        } else if (response.status === 401)
          navigate("/signin")
        else {
         console.log("opps! something went wrong")
        }
      } catch (error) {
      }
    }
  }

  useEffect(() => {
    if (searchValue) searchHandler()
    else {
      setDirectsSearch([])
      setChatRoomsSearch([])
    }
  }, [searchValue])

  return (
    <div
      className={
        Object.values(selectedDirect).every((value) => value !== "") ||
          Object.values(selectedChatRoom).every((value) => value !== "")
          ? "chat-sidebar-hidden"
          : "chat-sidebar"
      }
    >
      <div className="chat-sidebar-header">
        <input
        maxLength={18}
          type="text"
          placeholder="search"
          className="chat-search-input"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <div className="chat-switch-button-wrapper">
          <button
            className={
              isHome ? "direct-switch-button-active" : "direct-switch-button"
            }
            onClick={() => {
              setIsHome(true)
              setSelectedChatRoom({
                name: "",
                membersCount: "",
                icon: "",
                id: "",
              })
              setSelectedItem("")
              setChatRoomMessages([])
              setSearchValue("")
            }}
          >
            Directs
          </button>
          <button
            className={
              isHome ? "rooms-switch-button" : "rooms-switch-button-active"
            }
            onClick={() => {
              setIsHome(false)
              setSelectedDirect({
                id: "",
                name: "",
                status: "",
                avatar: "",
              })
              setSelectedItem("")
              setMessages([])
              setSearchValue("")
            }}
          >
            Rooms
          </button>
        </div>
      </div>
      {isHome && (
        <>
          {/* Render default conversations list if no search results and search value is empty */}
          {directsSearch.length === 0 && searchValue === "" && (
            <div
              className="chat-conversations-list"
              onScroll={directsOnScroll}
              ref={directsListInnerRef}
            >
              {directs.length > 0 && !directsSearch.length && !searchValue ? directs.map((friend, index) => (
                <ChatConversationItem
                  key={index}
                  friendId={friend.id}
                  name={friend.name}
                  avatar={friend.avatar}
                  status={friend.is_online}
                  lastMessage={friend.lastMessage}
                  unreadCount={friend.unreadCount}
                  isDirect={isHome}
                  setSelectedDirect={setSelectedDirect}
                  isSelected={selectedItem === friend.name}
                  setSelectedItem={handleSelectItem}
                  setDirects={setDirects}
                  directs={directs}
                />
              )) : <div className="chat-conversation-list-no-results">
                You haven't started any conversations yet. Start one by using the search above.
              </div>}
            </div>
          )}

          {/* Render search results if there are search results or search value is not empty */}
          {(directsSearch.length !== 0 || searchValue !== "") && (
            <>
              <div className="chat-rooms-conversation-search-header">
                Results:
              </div>
              <div className="chat-conversation-search-list">
                {directsSearch.length > 0 ? directsSearch.map((friend, index) => (
                  <ChatConversationSearchItem
                    key={index}
                    friendId={friend.id}
                    name={friend.name}
                    avatar={friend.avatar}
                    status={friend.is_online}
                    lastMessage={friend.lastMessage}
                    unreadCount={friend.unreadCount}
                    isDirect={isHome}
                    setSelectedDirect={setSelectedDirect}
                    isSelected={selectedItem === friend.name}
                    setSelectedItem={handleSelectItem}
                    setDirects={setDirects}
                    directs={directs}
                  />
                )) : <div className="chat-conversation-search-list-no-results">
                  No results found
                </div>}
              </div>
            </>
          )}
        </>
      )}

      {!isHome && (
        <>
          {chatRoomsSearch.length === 0 && searchValue === "" && (
            <div
              className="chat-rooms-conversations-list"
              onScroll={chatRoomsOnScroll}
              ref={chatRoomsListInnerRef}
            >
              {chatRoomsSearch.length === 0 &&
                searchValue === "" &&
                chatRooms.length > 0 ? (
                chatRooms.map((chatRoom, index) => (
                  <ChatConversationItem
                    key={index}
                    roomId={chatRoom.id}
                    name={chatRoom.name}
                    icon={chatRoom.icon}
                    lastMessage={chatRoom.lastMessage}
                    membersCount={chatRoom.membersCount}
                    unreadCount={chatRoom.unreadCount}
                    cover={chatRoom.cover}
                    topic={chatRoom.topic}
                    isDirect={isHome}
                    setSelectedChatRoom={setSelectedChatRoom}
                    isSelected={selectedItem === chatRoom.name}
                    setSelectedItem={handleSelectItem}
                    setChatRooms={setChatRooms}
                    chatRooms={chatRooms}
                  />
                ))
              ) : (
                <div className="chat-rooms-conversation-list-no-results">
                  You haven't joined any chat rooms with conversations yet.
                  Start one by using the search above or create a new chat room
                  by visiting the Groups page.
                </div>
              )}
            </div>
          )}
          {(chatRoomsSearch.length !== 0 || searchValue !== "") && (
            <>
              <div className="chat-rooms-conversation-search-header">
                Results:
              </div>
              <div className="chat-rooms-conversations-search-list">
                {chatRoomsSearch.length ? (
                  chatRoomsSearch.map((chatRoom, index) => (
                    <ChatConversationSearchItem
                      key={index}
                      roomId={chatRoom.id}
                      name={chatRoom.name}
                      icon={chatRoom.icon}
                      lastMessage={chatRoom.lastMessage}
                      membersCount={chatRoom.membersCount}
                      unreadCount={chatRoom.unreadCount}
                      cover={chatRoom.cover}
                      topic={chatRoom.topic}
                      isDirect={isHome}
                      setSelectedChatRoom={setSelectedChatRoom}
                      isSelected={selectedItem === chatRoom.name}
                      setSelectedItem={handleSelectItem}
                      setChatRooms={setChatRooms}
                      chatRooms={chatRooms}
                    />
                  ))
                ) : (
                  <div className="chat-rooms-conversation-search-list-no-results">
                    No results found
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default ChatSideBar
