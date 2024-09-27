import "../assets/chat/Chat.css";
import ChatConversationItem from "./chatConversationItem";
import ChatContext from "../Groups/ChatContext";
import AuthContext from "../navbar-sidebar/Authcontext";
import ChatConversation from "./chatConversation";
import ChatRoomConversation from "./chatRoomConversation";
import { useContext, useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import TournamentWarning from "../Tournament/RemoteTournament/TournamentWarning";

const Chat = () => {

	const {
		chatRoomConversations,
		directConversations,
		setSelectedChatRoom,
		selectedChatRoom,
		setSelectedDirect,
		selectedDirect,
		isHome,
		setIsHome,
	} = useContext(ChatContext);
	const { user, notifSocket } = useContext(AuthContext);
	const [query, setQuery] = useState("");
	const [selectedItem, setSelectedItem] = useState(null);
	const filteredConversations = directConversations.filter((conversation) => {
		return conversation.name.includes(query);
	});

	//START  HADCHI DYAL RIDA
	const set_is_inside = async () => {
		const response = await fetch(`http://localhost:8000/api/set-is-inside`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				user: user,
				is_inside: false
			})
		})
	}

	useEffect(() => {
		if (user) {
			set_is_inside()
		}
	}, [user])

	// ENDDDD HADCHI DYAL RIDA

	const handleSelectItem = (itemName) => {
		setSelectedItem(itemName);
	};

	return (
		<div className="chat-page">
			{/* <Toaster /> */}
			<TournamentWarning />
			<div className="chat-container">
				<div
					className={
						Object.values(selectedDirect).every((value) => value !== "") || Object.values(selectedChatRoom).every((value) => value !== "")
							? "chat-sidebar-hidden"
							: "chat-sidebar"
					}
				>
					<div className="chat-sidebar-header">
						<input
							type="text"
							placeholder="search"
							value={query}
							className="chat-search-input"
							onChange={(e) => setQuery(e.target.value)}
						/>
						<div className="chat-switch-button-wrapper">
							<button
								className={
									isHome
										? "direct-switch-button-active"
										: "direct-switch-button"
								}
								onClick={() => setIsHome(true)}
							>
								Directs
							</button>
							<button
								className={
									isHome ? "rooms-switch-button" : "rooms-switch-button-active"
								}
								onClick={() => setIsHome(false)}
							>
								Rooms
							</button>
						</div>
					</div>
					<div className="chat-conversations-list">
						{isHome
							? filteredConversations.map((friend, key) => (
								<ChatConversationItem
									key={key}
									name={friend.name}
									status={friend.is_online}
									lastMessage={
										"The correct format would typically be chatRoomConversations"
									}
									imageIndex={key}
									isDirect={isHome}
									setSelectedDirect={setSelectedDirect}
									isSelected={selectedItem === friend.name}
									setSelectedItem={handleSelectItem}
								/>
							))
							: chatRoomConversations.map((chatRoom, key) => (
								<ChatConversationItem
									key={key}
									name={chatRoom.name}
									lastMessage={
										"The correct format would typically be chatRoomConversations"}
									imageIndex={key}
									isDirect={isHome}
									membersCount={chatRoom.membersCount}
									roomId={chatRoom.id}
									setSelectedChatRoom={setSelectedChatRoom}
									isSelected={selectedItem === chatRoom.name}
									setSelectedItem={handleSelectItem}
								/>
							))}
					</div>
				</div>
				<div
					className={
						Object.values(selectedDirect).every((value) => value !== "") || Object.values(selectedChatRoom).every((value) => value !== "")
							? "chat-window"
							: "chat-window-hidden"
					}
				>
					{isHome &&
						Object.values(selectedDirect).every((value) => value !== "") ? (
						<ChatConversation />
					) : !isHome &&
						Object.values(selectedChatRoom).every((value) => value !== "") ? (
						<ChatRoomConversation />
					) : (
						""
					)}
				</div>
			</div>
		</div>
	);
};

export default Chat;
