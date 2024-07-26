import React, { useRef } from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import SocketDataContext from '../navbar-sidebar/SocketDataContext'
import { useState } from 'react'
import { useContext } from 'react'
import { useEffect } from 'react'
import { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import {
    PrevButton,
    NextButton,
    usePrevNextButtons
} from './EmblaCarouselArrowButtons'
import "../assets/Friends/FriendsPage.css";
import SuggestionFriendCard from "./SuggestionFriendCard.jsx";
import FriendCard from "./FriendCard.jsx";
import RecievedFriendReqCard from "./RecievedFriendReqCard.jsx";
import SentFriendReqCard from "./SentFriendReqCard.jsx";
import BlockedAccountCard from './BlockedAccountCard.jsx'

const Friends = () => {
    const { user, socket } = useContext(AuthContext);
    const { message, type } = useContext(SocketDataContext);
    const [friends, setFriends] = useState([]);
    const [blockedFriends, setBlockedFriends] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [recievedRequests, setRecievedRequests] = useState([]);
    const [friendSuggestions, setFriendSuggestions] = useState([]);
    const [selectedButton, setSelectedButton] = useState('Friends');
    const [redCercle, setRedCercle] = useState('');

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })

    const {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick
    } = usePrevNextButtons(emblaApi)

    const handlesSelectedButton = (selectedButton) => {
        setSelectedButton(selectedButton);
        if (selectedButton === "Sent_Requests" && redCercle === "send-friend-request")
            setRedCercle('')
        else if (selectedButton === "Friends" && (redCercle === "unblock-friend" || redCercle === "confirm-friend-request"))
            setRedCercle('')
        else if (selectedButton === "Blocked_Accounts" && redCercle === "block-friend")
            setRedCercle('')
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
            if (res)
                setFriendSuggestions(res);
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
        console.log("============ socket-start ============");
        console.log("message:", message, "type:", type);
        console.log("============ socket-end ============");
        console.log("the type is", type);
        if (type === 'cancel-friend-request') {
            setSentRequests((prevSentRequests) => {
                const updatedSentRequests = prevSentRequests.filter(SentRequest => SentRequest.second_username !== message.second_username);
                return updatedSentRequests;
            });
        }
        else if (type === 'remove-friendship') {
            setFriends((prevFriends) => {
                const updatedFriends = prevFriends.filter(Friend => Friend.friend !== message.friend);
                return updatedFriends;
            });
        }
        else if (type === 'block-friend') {
            setFriends((prevFriends) => {
                const updatedFriends = prevFriends.filter(Friend => Friend.second_username !== message.second_username);
                return updatedFriends;
            });
            setBlockedFriends((prevBlockedFriends) => {
                const updatedBlockedFriends = [message, ...prevBlockedFriends];
                return updatedBlockedFriends;
            });
            if (selectedButton !== "Blocked_Accounts")
                setRedCercle('block-friend');
        }
        else if (type === 'unblock-friend') {
            setFriends((prevFriends) => {
                const friendExists = prevFriends.some(friend => friend.second_username === message.second_username);
                if (!friendExists) {
                    const updatedFriends = [message, ...prevFriends];
                    return updatedFriends;
                } else
                    return prevFriends;
            });
            setBlockedFriends((prevBlockedFriends) => {
                const updatedBlockedFriends = prevBlockedFriends.filter(UnblockedFriend => UnblockedFriend.second_username !== message.second_username);
                return updatedBlockedFriends;
            });
            if (selectedButton !== "Friends")
                setRedCercle('unblock-friend');
        }
        else if (type === 'remove-friend-request') {
            setRecievedRequests((prevRecievedRequests) => {
                const updatedRecievedRequests = prevRecievedRequests.filter(RecievedRequest => RecievedRequest.friend !== message.friend);
                return updatedRecievedRequests;
            });
        }
        else if (type === 'friend-request-accepted') {
            setSentRequests((prevSentRequests) => {
                const updatedSentRequests = prevSentRequests.filter(SentRequest => SentRequest.to_user !== message.to_user);
                return updatedSentRequests;
            });
            setFriends((prevFriends) => {
                const updatedFriends = [message, ...prevFriends];
                return updatedFriends;
            });
        }
        else if (type === 'confirm-friend-request') {
            setRecievedRequests((prevRecievedRequests) => {
                const updatedRecievedRequests = prevRecievedRequests.filter(RecievedRequest => RecievedRequest.to_user !== message.to_user);
                return updatedRecievedRequests;
            });
            setFriends((prevFriends) => {
                const updatedFriends = [message, ...prevFriends];
                return updatedFriends;
            });
            if (selectedButton !== "Friends")
                setRedCercle('confirm-friend-request');
        }
        else if (type === 'send-friend-request') {
            setSentRequests((prevSentRequests) => {
                const updatedSentRequests = [message, ...prevSentRequests];
                return updatedSentRequests;
            });
            setTimeout(() => {
                setFriendSuggestions((prevFriendSuggestions) => {
                    const updatedFriendSuggestions = prevFriendSuggestions.filter(suggestion => suggestion.username !== message.second_username);
                    return updatedFriendSuggestions;
                });
            }, 1000);
            if (selectedButton !== "Sent_Requests")
                setRedCercle('send-friend-request');
        }
        else if (type === 'recieve-friend-request') {
            setRecievedRequests((prevRecievedRequests) => {
                const updatedRecievedRequests = [message, ...prevRecievedRequests];
                return updatedRecievedRequests;
            });
        }
        else
            console.log("unknown type");
    }, [message, type, socket]);

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
            if (res)
                setBlockedFriends(res);
        };
        if (user) getBlockedList();
    }, [user]);

  return (
      <div className="FriendPage">
          <h3 className="FriendsPageHeader">{user} Suggestions List</h3>
          {
              friendSuggestions.length === 0 &&
              <div className="friendSuggestionsEmpty">friend suggestions Empty</div>
          }
          <div className="embla">
              <div className="embla__viewport" ref={emblaRef}>
                  <div className={`embla__container ${(prevBtnDisabled && nextBtnDisabled) ? "embla__container_centered" : ""}`}>
                      {
                          friendSuggestions.length !== 0 &&
                              friendSuggestions.map((SuggestionUser) => (
                                  <SuggestionFriendCard key={SuggestionUser.username} currentUsername={user} secondUsername={SuggestionUser.username} avatar={SuggestionUser.avatar}></SuggestionFriendCard>
                              ))
                      }
                  </div>
                  <div className="embla__buttons">
                      <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled}>Prev</PrevButton>
                      <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled}>Next</NextButton>
                  </div>
              </div>
          </div>
          <div className="friendPageSections">
              <div className="friendSection">
                  <h3 className="FriendsPageHeader">Friends</h3>
                  {
                      friends.length === 0 ?
                          <div className="friendPageEmptyList">
                              There are no friends :/.
                          </div>
                          :
                          <>
                              {
                                  friends.slice(0, (friends.length - 2)).map((request, index) => (
                                      <FriendCard key={index} isLastTwoElements={false} currentUsername={user} secondUsername={request.second_username} avatar={request.avatar}></FriendCard>
                                  ))
                              }
                              {
                                  friends.slice(-2).map((request, index) => (
                                      <FriendCard key={index} isLastTwoElements={friends.length > 2 ? true : false} currentUsername={user} secondUsername={request.second_username} avatar={request.avatar}></FriendCard>
                                  ))
                              }
                          </>
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
                          recievedRequests.map((request, index) => (
                              <RecievedFriendReqCard key={index} currentUsername={user} secondUsername={request.second_username} send_at={request.send_at} avatar={request.avatar}></RecievedFriendReqCard>
                          ))
                  }
              </div>
              <div className="friendSection">
                  <h3 className="FriendsPageHeader">Sent Requests</h3>
                  {
                      sentRequests.length === 0 ?
                          <div className="friendPageEmptyList">
                              There are no sent friend requests.
                          </div>
                          :
                          sentRequests.map((request, index) => (
                              <SentFriendReqCard key={index} currentUsername={user} secondUsername={request.second_username} send_at={request.send_at} avatar={request.avatar}></SentFriendReqCard>
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
                          <BlockedAccountCard key={index} secondUsername={blockedFriend.second_username} avatar={blockedFriend.avatar}></BlockedAccountCard>
                      ))
                  }
              </div>
          </div>
          <div className="optionBar">
              <div className="optionBtns">
                  {console.log(redCercle)}
                  <button className={`${(selectedButton === "Friends") ? "selectedBtn" : ""}`} onClick={() => { handlesSelectedButton("Friends") }}><div className={`${(redCercle === "unblock-friend" || redCercle === "confirm-friend-request") ? "redCercle" : ""}`}></div>Friends</button>
                  <button className={`${(selectedButton === "Friend_Requests") ? "selectedBtn" : ""}`} onClick={() => { handlesSelectedButton("Friend_Requests") }}>Friend Requests</button>
                  <button className={`${(selectedButton === "Sent_Requests") ? "selectedBtn" : ""}`} onClick={() => { handlesSelectedButton("Sent_Requests") }}><div className={`${redCercle === "send-friend-request" ? "redCercle" : ""}`}></div>Sent Requests</button>
                  <button className={`${(selectedButton === "Blocked_Accounts") ? "selectedBtn" : ""}`} onClick={() => { handlesSelectedButton("Blocked_Accounts") }}><div className={`${redCercle === "block-friend" ? "redCercle" : ""}`}></div>Blocked Accounts</button>
              </div>
              {
                  <div className="FriendManagement">
                      {(selectedButton === "Friends") && (
                          <div className="Friends">
                              {
                                  friends.length === 0 ?
                                      <div className="friendPageEmptyList">
                                          There are no friends :/.
                                      </div>
                                      :
                                      <>
                                          {
                                              friends.slice(0, (friends.length - 2)).map((request, index) => (
                                                  <FriendCard key={index} isLastTwoElements={false} currentUsername={user} secondUsername={request.second_username} avatar={request.avatar}></FriendCard>
                                              ))
                                          }
                                          {
                                              friends.slice(-2).map((request, index) => (
                                                  <FriendCard key={index} isLastTwoElements={friends.length > 2 ? true : false} currentUsername={user} secondUsername={request.second_username} avatar={request.avatar}></FriendCard>
                                              ))
                                          }
                                      </>
                              }
                          </div>
                      )}
                      {(selectedButton === "Friend_Requests") && (
                          <div className="FriendRequests">
                              {
                                  recievedRequests.length === 0 ?
                                      <div className="friendPageEmptyList">
                                          There are no pending friend requests.
                                      </div>
                                      :
                                      recievedRequests.map((request, index) => (
                                          <RecievedFriendReqCard key={index} currentUsername={user} secondUsername={request.second_username} send_at={request.send_at} avatar={request.avatar}></RecievedFriendReqCard>
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
                                      sentRequests.map((request, index) => (
                                          <SentFriendReqCard key={index} currentUsername={user} secondUsername={request.second_username} send_at={request.send_at} avatar={request.avatar}></SentFriendReqCard>
                                      ))
                              }
                          </div>)}
                      {(selectedButton === "Blocked_Accounts") && (
                          <div className="BlockedAccounts">

                              {
                                  blockedFriends.length === 0 ?
                                      <div className="friendPageEmptyList">
                                          There are no blocked Accounts.
                                      </div>
                                      :
                                      blockedFriends.map((blockedFriend, index) => (
                                          <BlockedAccountCard key={index} secondUsername={blockedFriend.second_username} avatar={blockedFriend.avatar}></BlockedAccountCard>
                                      ))
                              }
                          </div>
                      )}
                  </div>
              }
          </div>
    </div>
  );
};

export default Friends