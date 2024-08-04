import React, { useRef } from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import SocketDataContext from '../navbar-sidebar/SocketDataContext'
import { useState } from 'react'
import { useContext } from 'react'
import { useEffect } from 'react'
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

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })

    const {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick
    } = usePrevNextButtons(emblaApi)

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
            {
                setFriends(res);
                console.log(friends);
            }
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
                const updatedSentRequests = prevSentRequests.filter(SentRequest => SentRequest.username !== message.username);
                return updatedSentRequests;
            });
            // delay added because when cancel clicked immediately after add friend that make bad ui
            setTimeout(() => {
                setFriendSuggestions((prevSuggestions) => {
                    const updatedSuggestions = [message, ...prevSuggestions];
                    return updatedSuggestions;
                });
            }, 1000);
        }
        else if (type === 'remove-friendship') {
            setFriends((prevFriends) => {
                const updatedFriends = prevFriends.filter(Friend => Friend.friend_username !== message.username);
                return updatedFriends;
            });
            setFriendSuggestions((prevSuggestions) => {
                const updatedSuggestions = [message, ...prevSuggestions];
                return updatedSuggestions;
            });            
        }
        else if (type === 'block-friend') {
            setFriends((prevFriends) => {
                const updatedFriends = prevFriends.filter(Friend => Friend.username !== message.username);
                return updatedFriends;
            });
            setBlockedFriends((prevBlockedFriends) => {
                const updatedBlockedFriends = [message, ...prevBlockedFriends];
                return updatedBlockedFriends;
            });
        }
        else if (type === 'unblocker-move-to-suggestions') {
            setFriendSuggestions((prevSuggestions) => {
                const updatedSuggestions = [message, ...prevSuggestions];
                return updatedSuggestions;
            });
            setBlockedFriends((prevBlockedFriends) => {
                const updatedBlockedFriends = prevBlockedFriends.filter(UnblockedFriend => UnblockedFriend.friend_username !== message.username);
                return updatedBlockedFriends;
            });
        }
        else if (type === 'unblocker-friend') {
            setBlockedFriends((prevBlockedFriends) => {
                const updatedBlockedFriends = prevBlockedFriends.filter(UnblockedFriend => UnblockedFriend.username !== message.username);
                return updatedBlockedFriends;
            });
        }
        else if (type === 'unblocked-friend') {
            setFriendSuggestions((prevSuggestions) => {
                const updatedSuggestions = [message, ...prevSuggestions];
                return updatedSuggestions;
            });
            setFriends((prevFriends) => {
                const updatedFriends = prevFriends.filter(Friend => Friend.username !== message.username);
                return updatedFriends;
            });
            setBlockedFriends((prevBlockedFriends) => {
                const updatedBlockedFriends = prevBlockedFriends.filter(UnblockedFriend => UnblockedFriend.username !== message.username);
                return updatedBlockedFriends;
            });
        }
        else if (type === 'remove-friend-request') {
            setRecievedRequests((prevRecievedRequests) => {
                const updatedRecievedRequests = prevRecievedRequests.filter(RecievedRequest => RecievedRequest.username !== message.username);
                return updatedRecievedRequests;
            });
            setFriendSuggestions((prevSuggestions) => {
                const updatedSuggestions = [message, ...prevSuggestions];
                return updatedSuggestions;
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
        }
        else if (type === 'send-friend-request') {
            setSentRequests((prevSentRequests) => {
                const updatedSentRequests = [message, ...prevSentRequests];
                return updatedSentRequests;
            });
            setTimeout(() => {
                setFriendSuggestions((prevFriendSuggestions) => {
                    const updatedFriendSuggestions = prevFriendSuggestions.filter(suggestion => suggestion.username !== message.username);
                    return updatedFriendSuggestions;
                });
            }, 1000);
        }
        else if (type === 'recieve-friend-request') {
            setRecievedRequests((prevRecievedRequests) => {
                const updatedRecievedRequests = [message, ...prevRecievedRequests];
                return updatedRecievedRequests;
            });
            setFriendSuggestions((prevFriendSuggestions) => {
                const updatedFriendSuggestions = prevFriendSuggestions.filter(suggestion => suggestion.username !== message.username);
                return updatedFriendSuggestions;
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
          <h3 className="FriendsPageHeader SuggestionsHeader">{user} Suggestions List</h3>
          {
              friendSuggestions.length === 0 &&
              <div className="friendSuggestionsEmpty">friend suggestions Empty :/</div>
          }
          <div className={`embla ${friendSuggestions.length === 0 ? "emblaUndisplayble" : ""}`}>
              <div className="embla__viewport" ref={emblaRef}>
                  <div className={`embla__container ${(prevBtnDisabled && nextBtnDisabled) ? "embla__container_centered" : ""}`}>
                      {
                          friendSuggestions.length !== 0 &&
                              friendSuggestions.map((SuggestionUser) => (
                                  <SuggestionFriendCard key={SuggestionUser.username} currentUsername={user} secondUsername={SuggestionUser.username} avatar={SuggestionUser.avatar}></SuggestionFriendCard>
                              ))
                      }
                  </div>
                  <div className={`embla__buttons ${(prevBtnDisabled && nextBtnDisabled) ? "disableEmblaBtns" : ""}`}>
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
                            {/* <FriendCard isLastTwoElements={false} currentUsername={user} secondUsername={"test"}></FriendCard>
                            <FriendCard isLastTwoElements={false} currentUsername={user} secondUsername={"test"}></FriendCard>
                            <FriendCard isLastTwoElements={false} currentUsername={user} secondUsername={"test"}></FriendCard>
                            <FriendCard isLastTwoElements={true} currentUsername={user} secondUsername={"test"}></FriendCard>
                            <FriendCard isLastTwoElements={true} currentUsername={user} secondUsername={"test"}></FriendCard> */}
                              {
                                  friends.slice(0, (friends.length - 2)).map((request, index) => (
                                      <FriendCard key={index} isLastTwoElements={false} currentUsername={user} secondUsername={request.friend_username} avatar={request.avatar}></FriendCard>
                                  ))
                              }
                              {
                                  friends.slice(-2).map((request, index) => (
                                      <FriendCard key={index} isLastTwoElements={friends.length > 3 ? true : false} currentUsername={user} secondUsername={request.friend_username} avatar={request.avatar}></FriendCard>
                                  ))
                              }
                              <div className="spaceLeft"></div>
                          </>
                  }
              </div>
              <div className="friendSection">
                  <h3 className="FriendsPageHeader">Pending</h3>
                  {
                      recievedRequests.length === 0 ?
                          <div className="friendPageEmptyList">
                              There are no pending friend requests.
                          </div>
                          :
                          <>
                              {recievedRequests.map((request, index) => (
                                  <RecievedFriendReqCard key={index} currentUsername={user} secondUsername={request.username} send_at={request.send_at} avatar={request.avatar}></RecievedFriendReqCard>
                              ))}
                              <div className="spaceLeft"></div>
                          </>
                  }
              </div>
              <div className="friendSection">
                  <h3 className="FriendsPageHeader">Requests</h3>
                  {
                      sentRequests.length === 0 ?
                          <div className="friendPageEmptyList">
                              There are no sent friend requests.
                          </div>
                          :
                          <>
                              {sentRequests.map((request, index) => (
                                  <SentFriendReqCard key={index} currentUsername={user} secondUsername={request.username} send_at={request.send_at} avatar={request.avatar}></SentFriendReqCard>
                              ))}
                              <div className="spaceLeft">
                              </div>
                          </>
                  }
              </div>
              <div className="friendSection">
                  <h3 className="FriendsPageHeader">Blocked</h3>
                  {blockedFriends.length === 0 ?
                      <div className="friendPageEmptyList">
                          There are no blocked Accounts.
                      </div>
                      :
                      <>
                          {blockedFriends.map((blockedFriend, index) => (
                              <BlockedAccountCard key={index} secondUsername={blockedFriend.friend_username} avatar={blockedFriend.avatar}></BlockedAccountCard>
                          ))}
                          <div className="spaceLeft">
                          </div>
                      </>
                  }
              </div>
          </div>
          <div className="optionBar">
              <div className="optionBtns">
                  <button className={`${(selectedButton === "Friends") ? "selectedBtn" : ""}`} onClick={() => { handlesSelectedButton("Friends") }}>Friends</button>
                  <button className={`${(selectedButton === "Friend_Requests") ? "selectedBtn" : ""}`} onClick={() => { handlesSelectedButton("Friend_Requests") }}>Pending</button>
                  <button className={`${(selectedButton === "Sent_Requests") ? "selectedBtn" : ""}`} onClick={() => { handlesSelectedButton("Sent_Requests") }}>Requests</button>
                  <button className={`${(selectedButton === "Blocked_Accounts") ? "selectedBtn" : ""}`} onClick={() => { handlesSelectedButton("Blocked_Accounts") }}>Blocked</button>
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
                                                  <FriendCard key={index} isLastTwoElements={false} currentUsername={user} secondUsername={request.friend_username} avatar={request.avatar}></FriendCard>
                                              ))
                                          }
                                          {
                                              friends.slice(-2).map((request, index) => (
                                                  <FriendCard key={index} isLastTwoElements={friends.length > 2 ? true : false} currentUsername={user} secondUsername={request.friend_username} avatar={request.avatar}></FriendCard>
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
                                          <RecievedFriendReqCard key={index} currentUsername={user} secondUsername={request.username} send_at={request.send_at} avatar={request.avatar}></RecievedFriendReqCard>
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
                                          <SentFriendReqCard key={index} currentUsername={user} secondUsername={request.username} send_at={request.send_at} avatar={request.avatar}></SentFriendReqCard>
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
                                      <>
                                      {blockedFriends.map((blockedFriend, index) => (
                                          <BlockedAccountCard key={index} secondUsername={blockedFriend.friend_username} avatar={blockedFriend.avatar}></BlockedAccountCard>
                                      ))}
                                      </>
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