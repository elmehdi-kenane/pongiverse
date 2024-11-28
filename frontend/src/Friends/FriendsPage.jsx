import React from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import { useContext } from "react";
import SocketDataContext from "../navbar-sidebar/SocketDataContext";
import { useState } from "react";
import { useEffect } from "react";
import "../assets/Friends/FriendsPage.css";
import { DesktopFriendsWrapper } from "./DesktopFriendsWrapper.jsx";
import { MobileFriendsWrapper } from "./MobileFriendsWrapper.jsx";
import { SuggestionsWrapper } from "./SuggestionsWrapper.jsx";

const Friends = () => {
  const { user, socket } = useContext(AuthContext);
  const { message, type } = useContext(SocketDataContext);
  const [friends, setFriends] = useState([]);
  const [blockedFriends, setBlockedFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [friendSuggestions, setFriendSuggestions] = useState([]);

  useEffect(() => {
    const getFriendSuggestions = async () => {
      const response = await fetch(
        `http://${
          import.meta.env.VITE_IPADDRESS
        }:8000/friends/get_friend_suggestions/${user}`,
        {
          method: "GET",
          headers: {},
        }
      );
      const res = await response.json();
      if (res) setFriendSuggestions(res);
    };
    if (user) getFriendSuggestions();
  }, [user]);

  useEffect(() => {
    const getFriends = async () => {
      const response = await fetch(
        `http://${
          import.meta.env.VITE_IPADDRESS
        }:8000/friends/get_friend_list/${user}`,
        {
          method: "GET",
          headers: {},
        }
      );
      const res = await response.json();
      if (res) {
        console.log("FRIENDS:  ", res);
        setFriends(res);
      }
    };
    if (user) getFriends();
  }, [user]);

  useEffect(() => {
    console.log("============ socket-start ============");
    console.log("message:", message, "type:", type);
    console.log("============ socket-end ============");
    if (type === "cancel-friend-request") {
      setSentRequests((prevSentRequests) => {
        const updatedSentRequests = prevSentRequests.filter(
          (SentRequest) =>
            SentRequest.second_username !== message.second_username
        );
        return updatedSentRequests;
      });
      setReceivedRequests((prevReceivedRequests) => {
        const updatedReceivedRequests = prevReceivedRequests.filter(
          (ReceivedRequest) =>
            ReceivedRequest.second_username !== message.second_username
        );
        return updatedReceivedRequests;
      });
      // delay added because when cancel clicked immediately after add friend that make bad ui
      setTimeout(() => {
        setFriendSuggestions((prevSuggestions) => {
          const updatedSuggestions = [message, ...prevSuggestions];
          return updatedSuggestions;
        });
      }, 1000);
    } else if (type === "remove-friendship") {
      setFriends((prevFriends) => {
        const updatedFriends = prevFriends.filter(
          (Friend) => Friend.second_username !== message.second_username
        );
        return updatedFriends;
      });
      setFriendSuggestions((prevSuggestions) => {
        const updatedSuggestions = [message, ...prevSuggestions];
        return updatedSuggestions;
      });
    } else if (type === "blocker-friend") {
      setFriends((prevFriends) => {
        const updatedFriends = prevFriends.filter(
          (Friend) => Friend.second_username !== message.second_username
        );
        return updatedFriends;
      });
      setBlockedFriends((prevBlockedFriends) => {
        const updatedBlockedFriends = [message, ...prevBlockedFriends];
        return updatedBlockedFriends;
      });
    } else if (type === "blocked-friend") {
      setFriends((prevFriends) => {
        const updatedFriends = prevFriends.filter(
          (Friend) => Friend.second_username !== message.second_username
        );
        return updatedFriends;
      });
    } else if (type === "unblock-friend") {
      setFriendSuggestions((prevSuggestions) => {
        const updatedSuggestions = [message, ...prevSuggestions];
        return updatedSuggestions;
      });
      setBlockedFriends((prevBlockedFriends) => {
        const updatedBlockedFriends = prevBlockedFriends.filter(
          (UnblockedFriend) =>
            UnblockedFriend.second_username !== message.second_username
        );
        return updatedBlockedFriends;
      });
    } else if (type === "friend-request-accepted") {
      setSentRequests((prevSentRequests) => {
        const updatedSentRequests = prevSentRequests.filter(
          (SentRequest) =>
            SentRequest.second_username !== message.second_username
        );
        return updatedSentRequests;
      });
      setFriends((prevFriends) => {
        const updatedFriends = [message, ...prevFriends];
        return updatedFriends;
      });
    } else if (type === "confirm-friend-request") {
      setReceivedRequests((prevReceivedRequests) => {
        const updatedReceivedRequests = prevReceivedRequests.filter(
          (ReceivedRequest) =>
            ReceivedRequest.second_username !== message.second_username
        );
        return updatedReceivedRequests;
      });
      setFriends((prevFriends) => {
        const updatedFriends = [message, ...prevFriends];
        return updatedFriends;
      });
    } else if (type === "send-friend-request") {
      setSentRequests((prevSentRequests) => {
        const updatedSentRequests = [message, ...prevSentRequests];
        return updatedSentRequests;
      });
      setTimeout(() => {
        setFriendSuggestions((prevFriendSuggestions) => {
          const updatedFriendSuggestions = prevFriendSuggestions.filter(
            (suggestion) =>
              suggestion.second_username !== message.second_username
          );
          return updatedFriendSuggestions;
        });
      }, 1000);
    } else if (type === "receive-friend-request") {
      setReceivedRequests((prevReceivedRequests) => {
        const updatedReceivedRequests = [message, ...prevReceivedRequests];
        return updatedReceivedRequests;
      });
      setFriendSuggestions((prevFriendSuggestions) => {
        const updatedFriendSuggestions = prevFriendSuggestions.filter(
          (suggestion) => suggestion.second_username !== message.second_username
        );
        return updatedFriendSuggestions;
      });
    } else console.log("unknown type");
  }, [message, type, socket]);

  useEffect(() => {
    const getSentRequests = async () => {
      const response = await fetch(
        `http://${
          import.meta.env.VITE_IPADDRESS
        }:8000/friends/get_sent_requests/${user}`,
        {
          method: "GET",
          headers: {},
        }
      );
      const res = await response.json();
      if (res) setSentRequests(res);
    };
    if (user) getSentRequests();
  }, [user]);

  useEffect(() => {
    const getReceivedRequests = async () => {
      const response = await fetch(
        `http://${
          import.meta.env.VITE_IPADDRESS
        }:8000/friends/get_received_requests/${user}`,
        {
          method: "GET",
          headers: {},
        }
      );
      const res = await response.json();
      if (res) setReceivedRequests(res);
    };
    if (user) getReceivedRequests();
  }, [user]);

  useEffect(() => {
    const getBlockedList = async () => {
      const response = await fetch(
        `http://${
          import.meta.env.VITE_IPADDRESS
        }:8000/friends/get_blocked_list/${user}`,
        {
          method: "GET",
          headers: {},
        }
      );
      const res = await response.json();
      if (res) setBlockedFriends(res);
    };
    if (user) getBlockedList();
  }, [user]);
  console.log("friends", friends);
  console.log("receivedRequests", receivedRequests);
  console.log("sentRequests", sentRequests);
  return (
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
  );
};

export default Friends;
