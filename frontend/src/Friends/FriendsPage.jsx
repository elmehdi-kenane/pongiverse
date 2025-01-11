import React from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import "../assets/Friends/FriendsPage.css";
import { DesktopFriendsWrapper } from "./DesktopFriendsWrapper.jsx";
import { MobileFriendsWrapper } from "./MobileFriendsWrapper.jsx";
import { SuggestionsWrapper } from "./SuggestionsWrapper.jsx";
import GameNotifications from "../GameNotif/GameNotifications.jsx";
import { useNavigate } from "react-router-dom";

const FriendshipPage = () => {
  const { user, socket } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [blockedFriends, setBlockedFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [friendSuggestions, setFriendSuggestions] = useState([]);
  const navigate = useNavigate();
  const { notifSocket } = useContext(AuthContext);
  const [data, setData] = useState({ message: 'messageStart', type: 'typeStart' });
  // useEffect(() => {
  //   if (notifSocket) {
  //     //console.log(".............. NEW MESSAGE FROM BACKEND ..............");
  //     notifSocket.onmessage = (e) => {
  //       const parsedData = JSON.parse(e.data);
  //       const data =
  //       {
  //         message: parsedData.message,
  //         type: parsedData.type,
  //       };
  //       setData(data)
  //     }
  //   }
  //   else
  //    console.log("notifSocket doesn't exist");
  // }, [notifSocket]);

  useEffect(() => {
    const getFriendSuggestions = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS
        }:${import.meta.env.VITE_PORT}/friends/get_friend_suggestions`,
        {
          method: "GET",
          credentials: "include",
          headers: {},
        }
      );
      if (response.status === 401)
        navigate('/signin')
      const res = await response.json();
      if (res) setFriendSuggestions(res);
    };
    if (user) getFriendSuggestions();
  }, [user]);

  useEffect(() => {
    const getFriends = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS
        }:${import.meta.env.VITE_PORT}/friends/get_friend_list`,
        {
          method: "GET",
          credentials: "include",
          headers: {},
        }
      );
      if (response.status === 401)
        navigate('/signin')
      const res = await response.json();
      if (res) {
        //console.log("FRIENDS:  ", res);
        setFriends(res);
      }
    };
    if (user) getFriends();
  }, [user]);

  useEffect(() => {
    //console.log("============ socket-start ============");
    //console.log("data.message:", data.message, "data.type:", data.type);
    //console.log("============ socket-end ============");
    if (data.type === "cancel-friend-request") {
      setSentRequests((prevSentRequests) => {
        const updatedSentRequests = prevSentRequests.filter(
          (SentRequest) =>
            SentRequest.second_username !== data.message.second_username
        );
        return updatedSentRequests;
      });
      setReceivedRequests((prevReceivedRequests) => {
        const updatedReceivedRequests = prevReceivedRequests.filter(
          (ReceivedRequest) =>
            ReceivedRequest.second_username !== data.message.second_username
        );
        return updatedReceivedRequests;
      });
      // delay added because when cancel clicked immediately after add friend that make bad ui
      setTimeout(() => {
        setFriendSuggestions((prevSuggestions) => {
          const updatedSuggestions = [data.message, ...prevSuggestions];
          return updatedSuggestions;
        });
      }, 1000);
    } else if (data.type === "remove-friendship") {
      setFriends((prevFriends) => {
        const updatedFriends = prevFriends.filter(
          (Friend) => Friend.second_username !== data.message.second_username
        );
        return updatedFriends;
      });
      setFriendSuggestions((prevSuggestions) => {
        const updatedSuggestions = [data.message, ...prevSuggestions];
        return updatedSuggestions;
      });
    } else if (data.type === "blocker-friend") {
      setFriends((prevFriends) => {
        const updatedFriends = prevFriends.filter(
          (Friend) => Friend.second_username !== data.message.second_username
        );
        return updatedFriends;
      });
      setBlockedFriends((prevBlockedFriends) => {
        const updatedBlockedFriends = [data.message, ...prevBlockedFriends];
        return updatedBlockedFriends;
      });
    } else if (data.type === "blocked-friend") {
      setFriends((prevFriends) => {
        const updatedFriends = prevFriends.filter(
          (Friend) => Friend.second_username !== data.message.second_username
        );
        return updatedFriends;
      });
    } else if (data.type === "unblock-friend") {
      setFriendSuggestions((prevSuggestions) => {
        const updatedSuggestions = [data.message, ...prevSuggestions];
        return updatedSuggestions;
      });
      setBlockedFriends((prevBlockedFriends) => {
        const updatedBlockedFriends = prevBlockedFriends.filter(
          (UnblockedFriend) =>
            UnblockedFriend.second_username !== data.message.second_username
        );
        return updatedBlockedFriends;
      });
    } else if (data.type === "friend-request-accepted") {
      setSentRequests((prevSentRequests) => {
        const updatedSentRequests = prevSentRequests.filter(
          (SentRequest) =>
            SentRequest.second_username !== data.message.second_username
        );
        return updatedSentRequests;
      });
      setFriends((prevFriends) => {
        const updatedFriends = [data.message, ...prevFriends];
        return updatedFriends;
      });
    } else if (data.type === "confirm-friend-request") {
      setReceivedRequests((prevReceivedRequests) => {
        const updatedReceivedRequests = prevReceivedRequests.filter(
          (ReceivedRequest) =>
            ReceivedRequest.second_username !== data.message.second_username
        );
        return updatedReceivedRequests;
      });
      setFriends((prevFriends) => {
        const updatedFriends = [data.message, ...prevFriends];
        return updatedFriends;
      });
    } else if (data.type === "send-friend-request") {
      setSentRequests((prevSentRequests) => {
        const updatedSentRequests = [data.message, ...prevSentRequests];
        return updatedSentRequests;
      });
      setTimeout(() => {
        setFriendSuggestions((prevFriendSuggestions) => {
          const updatedFriendSuggestions = prevFriendSuggestions.filter(
            (suggestion) =>
              suggestion.second_username !== data.message.second_username
          );
          return updatedFriendSuggestions;
        });
      }, 1000);
    } else if (data.type === "receive-friend-request") {
      setReceivedRequests((prevReceivedRequests) => {
        const updatedReceivedRequests = [data.message, ...prevReceivedRequests];
        return updatedReceivedRequests;
      });
      setFriendSuggestions((prevFriendSuggestions) => {
        const updatedFriendSuggestions = prevFriendSuggestions.filter(
          (suggestion) => suggestion.second_username !== data.message.second_username
        );
        return updatedFriendSuggestions;
      });
    } 
  }, [data.message, data.type, socket]);

  useEffect(() => {
    const getSentRequests = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS
        }:${import.meta.env.VITE_PORT}/friends/get_sent_requests`,
        {
          method: "GET",
          credentials: "include",
          headers: {},
        }
      );
      if (response.status === 401)
        navigate('/signin')
      const res = await response.json();
      if (res) setSentRequests(res);
    };
    if (user) getSentRequests();
  }, [user]);

  useEffect(() => {
    const getReceivedRequests = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS
        }:${import.meta.env.VITE_PORT}/friends/get_received_requests`,
        {
          method: "GET",
          credentials: "include",
          headers: {},
        }
      );
      if (response.status === 401)
        navigate('/signin')
      const res = await response.json();
      if (res) setReceivedRequests(res);
    };
    if (user) getReceivedRequests();
  }, [user]);

  useEffect(() => {
    const getBlockedList = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS
        }:${import.meta.env.VITE_PORT}/friends/get_blocked_list`,
        {
          method: "GET",
          credentials: "include",
          headers: {},
        }
      );
      if (response.status === 401)
        navigate('/signin')
      const res = await response.json();
      if (res) setBlockedFriends(res);
    };
    if (user) getBlockedList();
  }, [user]);
  //  console.log("friends", friends);
  //  console.log("receivedRequests", receivedRequests);
  //  console.log("sentRequests", sentRequests);
  return (
    <>
      <GameNotifications setData={setData} />
      <div className="FriendPage">
        <SuggestionsWrapper
          friendSuggestions={friendSuggestions}
        ></SuggestionsWrapper>
        <DesktopFriendsWrapper
          friends={friends}
          receivedRequests={receivedRequests}
          sentRequests={sentRequests}
          blockedFriends={blockedFriends}
        ></DesktopFriendsWrapper>
        <MobileFriendsWrapper
          friends={friends}
          receivedRequests={receivedRequests}
          sentRequests={sentRequests}
          blockedFriends={blockedFriends}
        ></MobileFriendsWrapper>
      </div>
    </>
  );
};

export default FriendshipPage;
