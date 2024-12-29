import FriendCard from "./FriendCard.jsx";
import ReceivedFriendReqCard from "./ReceivedFriendReqCard.jsx";
import SentFriendReqCard from "./SentFriendReqCard.jsx";
import BlockedAccountCard from './BlockedAccountCard.jsx';

export const DesktopFriendsWrapper = ({ friends, receivedRequests, sentRequests, blockedFriends }) => {
    return (
      <div className="friendPageSections">
        <div className="friendSection">
          <h3 className="FriendsPageHeader">Friends</h3>
          {friends.length === 0 ? (
            <div className="friendPageEmptyList">There are no friends :/.</div>
          ) : (
            <>
              {friends.slice(0, friends.length - 2).map((request, index) => (
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
                  isLastTwoElements={friends.length > 3 ? true : false}
                  secondUsername={request.second_username}
                  avatar={request.avatar}
                  isOnline={request.is_online}
                  friendId={request.friend_id}
                ></FriendCard>
              ))}
              <div className="spaceLeft"></div>
            </>
          )}
        </div>
        <div className="friendSection">
          <h3 className="FriendsPageHeader">Pending</h3>
          {receivedRequests.length === 0 ? (
            <div className="friendPageEmptyList">
              There are no pending friend requests.
            </div>
          ) : (
            <>
              {receivedRequests.map((request, index) => (
                <ReceivedFriendReqCard
                  key={index}
                  secondUsername={request.second_username}
                  send_at={request.send_at}
                  avatar={request.avatar}
                ></ReceivedFriendReqCard>
              ))}
              <div className="spaceLeft"></div>
            </>
          )}
        </div>
        <div className="friendSection">
          <h3 className="FriendsPageHeader">Requests</h3>
          {sentRequests.length === 0 ? (
            <div className="friendPageEmptyList">
              There are no sent friend requests.
            </div>
          ) : (
            <>
              {sentRequests.map((request, index) => (
                <SentFriendReqCard
                  key={index}
                  secondUsername={request.second_username}
                  send_at={request.send_at}
                  avatar={request.avatar}
                ></SentFriendReqCard>
              ))}
              <div className="spaceLeft"></div>
            </>
          )}
        </div>
        <div className="friendSection">
          <h3 className="FriendsPageHeader">Blocked</h3>
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
              <div className="spaceLeft"></div>
            </>
          )}
        </div>
      </div>
    );
}