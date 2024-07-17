// import { useContext, useEffect, useState } from "react";
// import SmallScreenConversation from "./smallScreenConversation";
// import * as ChatIcons from "../assets/chat/media/index";
// import ChatContext from "../Groups/ChatContext";
// import AuthContext from "../navbar-sidebar/Authcontext";
// import MyMessage from "./MyMessage";
// import OtherMessage from "./OtherMessage";
// import DirectMessages from "./DirectMessages";

// const ChatSmallScreen = (props) => {
//   const [newMessage, setNewMessage] = useState("");
//   const [directMessage, setDirectMessage] = useState([]);
//   const {
//     channelsConversations,
//     directsConversations,
//     setSelectedChannel,
//     selectedChannel,
//     setSelectedDirect,
//     selectedDirect,
//   } = useContext(ChatContext);
//   const { user, socket, userImg } = useContext(AuthContext);
//   const sendMessage = (e) => {
//     e.preventDefault();
//     if (
//       socket &&
//       socket.readyState === WebSocket.OPEN &&
//       newMessage.trim() !== ""
//     ) {
//       socket.send(
//         JSON.stringify({
//           type: "directMessage",
//           data: {
//             sender: user,
//             reciver: selectedDirect.name,
//             message: newMessage,
//           },
//         })
//       );
//       setNewMessage("");
//     }
//   };
//   useEffect(() => {
//     const fetchMessages = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:8000/chatAPI/Directs/messages`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               user: user,
//               friend: selectedDirect.name,
//             }),
//           }
//         );
//         const data = await response.json();
//         if (data) {
//           setDirectMessage(data);
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     if (Object.values(selectedDirect).every(value => value !== '')) {
//       console.log("selected Direct: ", selectedDirect);
//       fetchMessages();
//     }

//     // let scrollView = document.getElementById("start");
//     // scrollView.scrollTop = scrollView.scrollHeight;
//   }, [selectedDirect]);
  
//   return (
//     <>
//       <div
//         className={
//           Object.values(selectedDirect).every((value) => value !== "")
//             ? "sm-screen-conversation-container-collapsed"
//             : "sm-screen-conversation-container-expanded"
//         }
//       >
//         <div className="sm-screen-button-switcher-container">
//           <div className="sm-screen-chat-toggle-buttons">
//             <button className="sm-screen-direct-messages-button">
//               Directs
//             </button>
//             <button className="sm-screen-rooms-button">Rooms</button>
//           </div>
//           <input type="text" className="sm-screen-chat-search-input" />
//         </div>
//         <div className="sm-screen-conversations-list-wrapper">
//           <div className="sm-screen-conversations-list-content">
//             {props.filteredConversation.map((user, index) => (
//               <SmallScreenConversation
//                 name={user.name}
//                 key={index}
//                 index={index}
//                 status={user.is_online}
//                 setSelectedDirect={setSelectedDirect}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//       {Object.values(selectedDirect).every((value) => value !== "") ? (
//         <DirectMessages/>
//         <div className="sm-screen-conversation-container">
//           <div className="sm-screen-conversation-header">
//             <div className="sm-screen-conversation-header-info">
//               <img
//                 src={ChatIcons.arrowLeft}
//                 alt=""
//                 className="sm-screen-conversation-back-arrow"
//                 onClick={() =>
//                   setSelectedDirect({
//                     name: "",
//                     avatar: "",
//                     status: "",
//                   })
//                 }
//               />
//               <img
//                 src={selectedDirect.avatar}
//                 alt="Avatar"
//                 className="sm-screen-conversation-avatar"
//               />
//               <div className="sm-screen-conversation-details">
//                 <div className="sm-screen-conversation-name">
//                   {selectedDirect.name}
//                 </div>
//                 <div className="sm-screen-conversation-info">
//                   {selectedDirect.status ? "online" : "offline"}
//                 </div>
//               </div>
//             </div>
//             <div className="sm-screen-conversation-options">
//               <img
//                 src={ChatIcons.InviteToPlay}
//                 alt="Invite"
//                 className="sm-screen-conversation-invite-icon"
//               />
//               <img
//                 src={ChatIcons.ThreePoints}
//                 alt="Options"
//                 className="sm-screen-conversation-options-icon"
//               />
//             </div>
//           </div>
//           <div className="sm-screen-conversation-content">
//             {directMessage.length !== 0 &&
//               directMessage &&
//               directMessage.map((message, index) =>
//                 message.sender === user ? (
//                   <MyMessage
//                     key={index}
//                     content={message.content}
//                     avatar={userImg}
//                   />
//                 ) : (
//                   <OtherMessage
//                     key={index}
//                     content={message.content}
//                     avatar={selectedDirect.avatar}
//                   />
//                 )
//               )}
//           </div>
//           <form action="submit" className="sm-screen-conversation-form" onSubmit={sendMessage}>
//             <input
//               type="text"
//               className="sm-screen-conversation-input"
//               placeholder="Type your message"
//               value={newMessage}
//               onChange={(e)=>setNewMessage(e.target.value)}
//             />
//           </form>
//         </div>
//       ) 
//       : (
//         ""
//       )}
//     </>
//   );
// };

// export default ChatSmallScreen;
