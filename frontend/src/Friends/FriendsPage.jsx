import React, { useRef } from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import { useState } from 'react'
import { useContext } from 'react'
import { useEffect } from 'react'
import "../assets/Friends/FriendsPage.css";
import SuggestionFriendCard from "./SuggestionFriendCard.jsx";
import FriendCard from "./FriendCard.jsx";
import RecievedFriendReqCard from "./RecievedFriendReqCard.jsx";
import SentFriendReqCard from "./SentFriendReqCard.jsx";
import BlockedAccountCard from './BlockedAccountCard.jsx'
// import BlockedAccountCard from "./BlockedAccountCard.jsx";
// import MoveBtnPrevious from '../assets/Friends/move-btn-previous.svg';
// import MoveBtnPreviousDisabled from '../assets/Friends/move-btn-previous-disabled.svg';
// import MoveBtnNext from '../assets/Friends/move-btn-next.svg';
// import MoveBtnNextDisabled from '../assets/Friends/move-btn-next-disabled.svg';

// import Profile from '../assets/Friends/profile.png';

const Friends = () => {
    const { user, socket } = useContext(AuthContext);
    const friendSectionRef = useRef(null);
    const [friends, setFriends] = useState([]);
    const [blockedFriends, setBlockedFriends] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [recievedRequests, setRecievedRequests] = useState([]);
    const [friendSuggestions, setfriendSuggestions] = useState([]);
    const [selectedButton, setSelectedButton] = useState('Friends');


    const handlesSelectedButton = (selectedButton) => {
        setSelectedButton(selectedButton);
    }

    useEffect(() => {
        const getFriendSuggestions = async () => {
            const response = await fetch(
                `http://localhost:8000/friends/get_friend_suggestions/${user}`,
                {
                    method: "GET",
                    headers: {
                    },
                }
            );
            const res = await response.json();
            console.log("==getFriendSuggestions===");
            console.log(res);
            console.log("==getFriendSuggestions===");
            if (res)
                setfriendSuggestions(res);
        };
        if (user) getFriendSuggestions();
    }, [user]);

    useEffect(() => {
        const getFriends = async () => {
            const response = await fetch(
                `http://localhost:8000/friends/get_friend_list/${user}`,
                {
                    method: "GET",
                    headers: {
                    },
                }
            );
            const res = await response.json();
            if (res)
                setFriends(res);
        };
        if (user) getFriends();
    }, [user]);

    useEffect(() => {
        if (socket) {
            socket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                console.log("============ socket-start ============");
                console.log(data);
                console.log("============ socket-end ============");
                console.log("the type is ", data.type);
                if (data.type === 'cancel-friend-request') {
                    console.log("handel cancel friend request");
                    setSentRequests((prevSentRequests) => {
                        const updatedSentRequests = prevSentRequests.filter(SentRequest => SentRequest !== data.message);
                        return updatedSentRequests;
                    });
                }
                else if (data.type === 'add-friend-request') {
                    console.log("handel add friend request");
                    setSentRequests((prevSentRequests) => {
                        const updatedSentRequests = [data.message, ...prevSentRequests];
                        return updatedSentRequests;
                    });
                }
            }
        }
    }, [socket]);

    useEffect(() => {
        const getSentRequests = async () => {
            const response = await fetch(
                `http://localhost:8000/friends/get_sent_requests/${user}`,
                {
                    method: "GET",
                    headers: {
                    },
                }
            );
            const res = await response.json();
            console.log("==getSentRequests===");
            console.log(res);
            console.log("==getSentRequests===");
            if (res)
                setSentRequests(res);
            };
        if (user) getSentRequests();
    }, [user]);

    useEffect(() => {
        const getRecievedRequests = async () => {
            const response = await fetch(
                `http://localhost:8000/friends/get_recieved_requests/${user}`,
                {
                    method: "GET",
                    headers: {
                    },
                }
            );
            const res = await response.json();
            console.log("==getRecievedRequests===");
            console.log(res);
            console.log("==getRecievedRequests===");
            if (res)
                setRecievedRequests(res);
        };
        if (user) getRecievedRequests();
    }, [user]);

    useEffect(() => {
        const getBlockedList = async () => {
            const response = await fetch(
                `http://localhost:8000/friends/get_blocked_list/${user}`,
                {
                    method: "GET",
                    headers: {
                    },
                }
            );
            const res = await response.json();
            console.log("==result blocked list===");
            console.log(res);
            console.log("==result blocked list===");
            if (res)
                setBlockedFriends(res);
        };
        if (user) getBlockedList();
    }, [user]);

  return (
      <div className="FriendPage">
          <div className="Suggestions">
              <h3 className="FriendsPageHeader">{user} Suggestions List</h3>
              <div className="Carousel">
                  {friendSuggestions.map((SuggestionUsername, index) => (
                      <SuggestionFriendCard key={index} currentUsername={user} secondUsername={SuggestionUsername}></SuggestionFriendCard>
                  ))}
              </div>
          </div>
          <div className="friendPageSections">
              <div className="friendSection" ref={friendSectionRef}>
                  <h3 className="FriendsPageHeader">Friends</h3>
                  {
                      friends.length === 0 ?
                          <div className="friendPageEmptyList">
                              There are no friends :/.
                          </div>
                          :
                          friends.map((friend, index) => (
                              <FriendCard key={index} name={friend}></FriendCard>
                          ))
                  }
              </div>
              <div className="friendSection">
                  <h3 className="FriendsPageHeader">Friend Requests</h3>
                  {
                      recievedRequests.length === 0 ?
                          <div className="friendPageEmptyList">
                              There are no pending friend requests.
                          </div>
                          :
                          recievedRequests.map((secondUsername, index) => (
                              <RecievedFriendReqCard key={index} currentUsername={user} secondUsername={secondUsername}></RecievedFriendReqCard>
                          ))
                  }
              </div>
              <div className="friendSection">
                  <h3 className="FriendsPageHeader">Sent request</h3>
                  {
                      sentRequests.length === 0 ?
                          <div className="friendPageEmptyList">
                              There are no sent friend requests.
                          </div>
                          :
                          sentRequests.map((secondUsername, index) => (
                              <SentFriendReqCard key={index} currentUsername={user} secondUsername={secondUsername}></SentFriendReqCard>
                          ))
                  }
              </div>
              <div className="friendSection">
                  <h3 className="FriendsPageHeader">Blocked Accounts</h3>
                  {blockedFriends.length === 0 ?
                      <div className="friendPageEmptyList">
                          There are no blocked Accounts.
                      </div>
                      :
                      blockedFriends.map((blockedFriend, index) => (
                        <BlockedAccountCard key={index} name={blockedFriend}></BlockedAccountCard>
                      ))
                  }
              </div>
          </div>
          <div className="optionBar">
              <div className="optionBtns">
                  <button className={(selectedButton === "Friends") ? "selectedBtn" : ""} onClick={() => { handlesSelectedButton("Friends") }}>Friends</button>
                  <button className={(selectedButton === "Friend_Requests") ? "selectedBtn" : ""} onClick={() => { handlesSelectedButton("Friend_Requests") }}>Friend Requests</button>
                  <button className={(selectedButton === "Sent_Requests") ? "selectedBtn" : ""} onClick={() => { handlesSelectedButton("Sent_Requests") }}>Sent Requests</button>
                  <button className={(selectedButton === "Blocked_Accounts") ? "selectedBtn" : ""} onClick={() => { handlesSelectedButton("Blocked_Accounts") }}>Blocked Accounts</button>
              </div>
              {
                  <div className="FriendManagement">
                      {(selectedButton === "Friends") && (
                          friends.length === 0 ?
                              <div className="friendPageEmptyList">
                                  There are no friends :/.
                              </div>
                              :
                              friends.map((friend, index) => (
                                  <div key={index}>{friend}</div>
                              ))
                      )}
                      {(selectedButton === "Friend_Requests") && (
                          <div className="FriendRequests">
                              {
                                  recievedRequests.length === 0 ?
                                      <div className="friendPageEmptyList">
                                          There are no pending friend requests.
                                      </div>
                                      :
                                      recievedRequests.map((secondUsername, index) => (
                                          <RecievedFriendReqCard key={index} currentUsername={user} secondUsername={secondUsername}></RecievedFriendReqCard>
                                      ))
                              }
                          </div>)}
                      {(selectedButton === "Sent_Requests") && (
                          <div className="SentRequests">
                              {
                                  sentRequests.length === 0 ?
                                      <div className="friendPageEmptyList">
                                          There are no sent friend requests.
                                      </div>
                                      :
                                      sentRequests.map((secondUsername, index) => (
                                          <SentFriendReqCard key={index} currentUsername={user} secondUsername={secondUsername}></SentFriendReqCard>
                                      ))}
                          </div>)}
                      {(selectedButton === "Blocked_Accounts") && (
                          blockedFriends.length === 0 ?
                              <div className="friendPageEmptyList">
                                  There are no blocked Accounts.
                              </div>
                              :
                              blockedFriends.map((blockedFriend, index) => (
                                <BlockedAccountCard key={index} ></BlockedAccountCard>
                                //   <div key={index}>{blockedFriend}</div>
                              ))
                      )}
                  </div>
              }
          </div>






          {/* <div className="FriendManagement">
              <div className="FriendRequests">
                  <h3 className="FriendsPageHeader">Friend Requests</h3>
                  {
                      recievedRequests.map((secondUsername, index) => (
                          <RecievedFriendReqCard key={index} currentUsername={user} secondUsername={secondUsername}></RecievedFriendReqCard>
                      ))
                  }
              </div>
              <div className="SentRequests">
                  <h3 className="FriendsPageHeader">Sent Requests</h3>
                  {sentRequests.map((secondUsername, index) => (
                      <SentFriendReqCard key={index} currentUsername={user} secondUsername={secondUsername}></SentFriendReqCard>
                  ))}
              </div>
              <div className="BlockedAccounts">
                  <h3 className="FriendsPageHeader">Blocked Accounts</h3>
              </div>
          </div> */}
    </div>
  );
};

export default Friends