import React, { useContext } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import AuthContext from '../../navbar-sidebar/Authcontext';
import ProfileContext from '../ProfileWrapper';
import ChatContext from '../../Context/ChatContext';
import { cancelFriendRequest, handleRemoveFriendship } from "../../Friends/utils";

import ChatIcon from '@mui/icons-material/Chat';
import AvatarSvg from "../../assets/Profile/avatar.png"
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';


function FriendsParam(props) {
	const friendsPrm = props.Prm;
	const { user, isBlock, setIsBlock, notifSocket } = useContext(AuthContext);
	const { chatUserId, setIsFriend, userId, userPic, setIsLoading, userIsOnline } = useContext(ProfileContext);
	const navigate = useNavigate();
	const { setSelectedDirect, setSelectedItem, setIsHome } = useContext(ChatContext);


	const handelChallengeRequest = () => {
		if (notifSocket && notifSocket.readyState === WebSocket.OPEN && user) {
			////console.log("inside join")
			notifSocket.send(JSON.stringify({
				type: 'inviteFriendGame',
				message: {
					user: user,
					target: userId
				}
			}))
			// navigate('/mainpage/game/solo/1vs1/friends');
		}
		else
			console.log("Socket is closed for the moment")
	}

	const handleRmFriend = () => {
		setIsLoading(true);
		setTimeout(() => {
		handleRemoveFriendship(user, userId);
		setIsLoading(false);
		setIsFriend('false');
	  }, 1200);
	}
	const handleCnclRequest = (eventType) => {
		setIsLoading(true);
		setTimeout(() => {
		cancelFriendRequest(user, userId, eventType);
		setIsLoading(false);
		setIsFriend('false');
	  }, 1200);
	}
	const handleBlock = () => {
		setIsBlock(!isBlock);
	}
	const chatNavigate = () => {
		const userImage = userPic ? userPic : AvatarSvg
		setSelectedDirect({
			id: chatUserId,
			name: userId,
			status: userIsOnline,
			avatar: userImage,
		})
		setIsHome(true)
		navigate('/mainpage/chat');
		setSelectedItem(userId)
	  }
	
	// Params JSX -----------------------
	const chatJsx = (
		<div className='parameter' onClick={chatNavigate}>
			<ChatIcon />
			<p> Send Message </p>
		</div>
	);
	const challengeJsx = (
		<div className='parameter' onClick={handelChallengeRequest}>
			<SportsEsportsIcon />
			<p> Challenge </p>
		</div>
	);
	const cancelJsx = (
		<div className="parameter" onClick={()=>handleCnclRequest("cancel")}>
			<CancelScheduleSendIcon />
			<p> Cancel Request </p>
		</div>
	)
	const removeJsx = (
		<div className="parameter" onClick={()=>handleCnclRequest("remove")}>
			<CancelScheduleSendIcon />
			<p> Remove Request </p>
		</div>
	)
	const deleteJsx = (
		<div className="parameter" onClick={handleRmFriend}>
			<PersonRemoveIcon />
			<p> Remove Friend </p>
		</div>
	)
	const blockJsx = (
		<div className="parameter" onClick={handleBlock} id='block-click'>
			<NoAccountsIcon />
			<p> Block </p>
		</div>
	);
	// ------------------------------------------

	return (
		<div className="userinfo__friend-param">
			{friendsPrm.map((prm, key) => {
				return (
					<div key={key}>
						{prm === "chat" && chatJsx}
						{prm === "challenge" && challengeJsx}
						{prm === "cancel" && cancelJsx}
						{prm === "remove" && removeJsx}
						{prm === "delete" && deleteJsx}
						{prm === "block" && blockJsx}
					</ div>
				)
			})}
		</div>
  )
}

export default FriendsParam
