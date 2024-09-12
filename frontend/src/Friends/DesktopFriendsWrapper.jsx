import FriendCard from "./FriendCard.jsx";
import RecievedFriendReqCard from "./RecievedFriendReqCard.jsx";
import SentFriendReqCard from "./SentFriendReqCard.jsx";
import BlockedAccountCard from './BlockedAccountCard.jsx';

export const DesktopFriendsWrapper = ({ friends, recievedRequests, sentRequests, blockedFriends }) => {
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
                  secondUsername={request.friend_username}
                  avatar={request.avatar}
                  friendId={request.friend}
                ></FriendCard>
              ))}
              {friends.slice(-2).map((request, index) => (
                <FriendCard
                  key={index}
                  isLastTwoElements={friends.length > 3 ? true : false}
                  secondUsername={request.friend_username}
                  avatar={request.avatar}
                  friendId={request.friend}
                ></FriendCard>
              ))}
              <div className="spaceLeft"></div>
            </>
          )}
        </div>
        <div className="friendSection">
          <h3 className="FriendsPageHeader">Pending</h3>
          {recievedRequests.length === 0 ? (
            <div className="friendPageEmptyList">
              There are no pending friend requests.
            </div>
          ) : (
            <>
              {recievedRequests.map((request, index) => (
                <RecievedFriendReqCard
                  key={index}
                  secondUsername={request.username}
                  send_at={request.send_at}
                  avatar={request.avatar}
                ></RecievedFriendReqCard>
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
                  secondUsername={request.username}
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
                  secondUsername={blockedFriend.friend_username}
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