import { useState } from "react";
import FriendCard from "./FriendCard.jsx";
import ReceivedFriendReqCard from "./ReceivedFriendReqCard.jsx";
import SentFriendReqCard from "./SentFriendReqCard.jsx";
import BlockedAccountCard from './BlockedAccountCard.jsx';

export const MobileFriendsWrapper = ({ friends, receivedRequests, sentRequests, blockedFriends }) => {
    const [selectedButton, setSelectedButton] = useState('Friends');

    const handlesSelectedButton = (selectedButton) => {
        setSelectedButton(selectedButton);
    }
    //console.log("receivedRequests", receivedRequests);
    //console.log("sentRequests", sentRequests);
    //console.log("blockedFriends", blockedFriends);
    return (
      <div className="optionBar">
        <div className="optionBtns">
          <button
            className={`${selectedButton === "Friends" ? "selectedBtn" : ""}`}
            onClick={() => {
              handlesSelectedButton("Friends");
            }}
          >
            Friends
          </button>
          <button
            className={`${
              selectedButton === "Friend_Requests" ? "selectedBtn" : ""
            }`}
            onClick={() => {
              handlesSelectedButton("Friend_Requests");
            }}
          >
            Pending
          </button>
          <button
            className={`${
              selectedButton === "Sent_Requests" ? "selectedBtn" : ""
            }`}
            onClick={() => {
              handlesSelectedButton("Sent_Requests");
            }}
          >
            Requests
          </button>
          <button
            className={`${
              selectedButton === "Blocked_Accounts" ? "selectedBtn" : ""
            }`}
            onClick={() => {
              handlesSelectedButton("Blocked_Accounts");
            }}
          >
            Blocked
          </button>
        </div>
        {
          <div className="FriendManagement">
            {selectedButton === "Friends" && (
              <div className="Friends">
                {friends.length === 0 ? (
                  <div className="friendPageEmptyList">
                    There are no friends :/.
                  </div>
                ) : (
                  <>
                    {friends
                      .slice(0, friends.length - 2)
                      .map((request, index) => (
                        <FriendCard
                          key={index}
                          isLastTwoElements={false}
                          secondUsername={request.second_username}
                          avatar={request.avatar}
                          isOnline={request.is_online}
                          friendId={request.friend_id}
                        ></FriendCard>
                      ))}
                    {friends.slice(-2).map((request, index) => (
                      <FriendCard
                        key={index}
                        isLastTwoElements={friends.length > 2 ? true : false}
                        secondUsername={request.second_username}
                        avatar={request.avatar}
                        isOnline={request.is_online}
                        friendId={request.friend_id}
                      ></FriendCard>
                    ))}
                  </>
                )}
              </div>
            )}
            {selectedButton === "Friend_Requests" && (
              <div className="FriendRequests">
                {receivedRequests.length === 0 ? (
                  <div className="friendPageEmptyList">
                    There are no pending friend requests.
                  </div>
                ) : (
                  receivedRequests.map((request, index) => (
                    <ReceivedFriendReqCard
                      key={index}
                      secondUsername={request.second_username}
                      send_at={request.send_at}
                      avatar={request.avatar}
                    ></ReceivedFriendReqCard>
                  ))
                )}
              </div>
            )}
            {selectedButton === "Sent_Requests" && (
              <div className="SentRequests">
                {sentRequests.length === 0 ? (
                  <div className="friendPageEmptyList">
                    There are no sent friend requests.
                  </div>
                ) : (
                  sentRequests.map((request, index) => (
                    <SentFriendReqCard
                      key={index}
                      secondUsername={request.second_username}
                      send_at={request.send_at}
                      avatar={request.avatar}
                    ></SentFriendReqCard>
                  ))
                )}
              </div>
            )}
            {selectedButton === "Blocked_Accounts" && (
              <div className="BlockedAccounts">
                {blockedFriends.length === 0 ? (
                  <div className="friendPageEmptyList">
                    There are no blocked Accounts.
                  </div>
                ) : (
                  <>
                    {blockedFriends.map((blockedFriend, index) => (
                      <BlockedAccountCard
                        key={index}
                        secondUsername={blockedFriend.second_username}
                        avatar={blockedFriend.avatar}
                      ></BlockedAccountCard>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        }
      </div>
    );
}