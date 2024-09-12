import { useState } from "react";
import FriendCard from "./FriendCard.jsx";
import RecievedFriendReqCard from "./RecievedFriendReqCard.jsx";
import SentFriendReqCard from "./SentFriendReqCard.jsx";
import BlockedAccountCard from './BlockedAccountCard.jsx';

export const MobileFriendsWrapper = ({ friends, recievedRequests, sentRequests, blockedFriends }) => {
    const [selectedButton, setSelectedButton] = useState('Friends');

    const handlesSelectedButton = (selectedButton) => {
        setSelectedButton(selectedButton);
    }

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
                          secondUsername={request.friend_username}
                          avatar={request.avatar}
                          friendId={request.friend}
                        ></FriendCard>
                      ))}
                    {friends.slice(-2).map((request, index) => (
                      <FriendCard
                        key={index}
                        isLastTwoElements={friends.length > 2 ? true : false}
                        secondUsername={request.friend_username}
                        avatar={request.avatar}
                        friendId={request.friend}
                      ></FriendCard>
                    ))}
                  </>
                )}
              </div>
            )}
            {selectedButton === "Friend_Requests" && (
              <div className="FriendRequests">
                {recievedRequests.length === 0 ? (
                  <div className="friendPageEmptyList">
                    There are no pending friend requests.
                  </div>
                ) : (
                  recievedRequests.map((request, index) => (
                    <RecievedFriendReqCard
                      key={index}
                      secondUsername={request.username}
                      send_at={request.send_at}
                      avatar={request.avatar}
                    ></RecievedFriendReqCard>
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
                      secondUsername={request.username}
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
                        secondUsername={blockedFriend.friend_username}
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