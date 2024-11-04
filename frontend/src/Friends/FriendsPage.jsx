import React from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import { useContext } from 'react'
import SocketDataContext from '../navbar-sidebar/SocketDataContext'
import { useState } from 'react'
import { useEffect } from 'react'
import "../assets/Friends/FriendsPage.css";
import { DesktopFriendsWrapper } from './DesktopFriendsWrapper.jsx'
import { MobileFriendsWrapper } from './MobileFriendsWrapper.jsx'
import { SuggestionsWrapper } from './SuggestionsWrapper.jsx'

const Friends = () => {
    const { user, socket } = useContext(AuthContext);
    const { message, type } = useContext(SocketDataContext);
    const [friends, setFriends] = useState([]);
    const [blockedFriends, setBlockedFriends] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [recievedRequests, setRecievedRequests] = useState([]);
    const [friendSuggestions, setFriendSuggestions] = useState([]);

    useEffect(() => {
        const getFriendSuggestions = async () => {
            const response = await fetch(
                `https://${import.meta.env.VITE_IPADDRESS}:8000/friends/get_friend_suggestions/${user}`,
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
                `https://${import.meta.env.VITE_IPADDRESS}:8000/friends/get_friend_list/${user}`,
                {
                    method: "GET",
                    headers: {
                    },
                }
            );
            const res = await response.json();
            if (res) {
                // console.log("FRIENDS:  ", res)
                setFriends(res);
            }
        };
        if (user) getFriends();
    }, [user]);

    useEffect(() => {
        // console.log("============ socket-start ============");
        // console.log("message:", message, "type:", type);
        // console.log("============ socket-end ============");
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
                `https://${import.meta.env.VITE_IPADDRESS}:8000/friends/get_sent_requests/${user}`,
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
                `https://${import.meta.env.VITE_IPADDRESS}:8000/friends/get_recieved_requests/${user}`,
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
                `https://${import.meta.env.VITE_IPADDRESS}:8000/friends/get_blocked_list/${user}`,
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
          <SuggestionsWrapper friendSuggestions={friendSuggestions}></SuggestionsWrapper>
          <DesktopFriendsWrapper friends={friends} recievedRequests={recievedRequests} sentRequests={sentRequests} blockedFriends={blockedFriends} ></DesktopFriendsWrapper>
          <MobileFriendsWrapper friends={friends} recievedRequests={recievedRequests} sentRequests={sentRequests} blockedFriends={blockedFriends} ></MobileFriendsWrapper>
    </div>
  );
};

export default Friends