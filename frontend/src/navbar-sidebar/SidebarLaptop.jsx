import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";

import AuthContext from "./Authcontext";

function SidebarLaptop({ Icons }) {
  const notifications = 0;

  const {
    isGlass,
    chatRoomInvitationsCounter,
    chatNotificationCounter,
    setChatRoomInvitationsCounter,
    setChatNotificationCounter,
    RoomsInvitationRef,
    chatNotificationRef,
  } = useContext(AuthContext);
  const sideBarItems = [
    {
      id: 1,
      icon: Icons.dashboard,
      route: "dashboard",
      text: "Dashboard",
    },
    {
      id: 2,
      icon: Icons.friends,
      route: "Friendship",
      text: "Friendship",
    },
    {
      id: 3,
      icon: Icons.chat,
      route: "chat",
      text: "Chat",
    },
    {
      id: 4,
      icon: Icons.console,
      route: "game",
      text: "Game",
    },
    {
      id: 5,
      icon: Icons.channels,
      route: "groups",
      text: "Channels",
    },
  ];

  const handleClick = (route) => {
    if(route === "chat"){
      setChatNotificationCounter(0);
    }else if(route === "groups"){
      setChatRoomInvitationsCounter(0);
    }
  };

  return (
    <div className={isGlass ? "blur sidebar" : "sidebar"}>
      {sideBarItems.map((item, index) => {
        return (
          <div
            className="sidebar-navigations"
            id={`sidebar-${item.route}`}
            key={index}
            onClick={()=>handleClick(item.route)}
          >
            <Link to={item.route} className="sidebar-icons">
              <img src={item.icon} alt={`${item.text}-logo`} />
              <p className="sidebar-titles"> {item.text} </p>
            {item.route === "chat" && chatNotificationCounter > 0 ? (
              <div className="sidebar-notifications">{chatNotificationCounter}</div>
            ) : null}
            {item.route === "groups" &&  chatRoomInvitationsCounter > 0 ? (
              <div className="sidebar-notifications">{chatRoomInvitationsCounter}</div>
            ) : null}
            </Link>
          </div>
        );
      })}
      {/* <div className="sidebar-navigations" id="none"></div> */}
    </div>
  );
}

export default SidebarLaptop;
