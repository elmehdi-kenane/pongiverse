import React, { useContext, useState, useEffect } from "react";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import * as Icons from "../assets/navbar-sidebar";
import { useNavigate } from "react-router-dom";
import AuthContext from "./Authcontext";
import SocketDataContext from "./SocketDataContext";
import NotificationPopupCard from "./NotificationPopupCard";
import { Outlet } from "react-router-dom";

function NavbarSidebar() {
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const location = useLocation();
  const [searchbar, setSearchBar] = useState(false);
  let { user, socket, privateCheckAuth, setUser, hideNavSideBar } =
    useContext(AuthContext);
  let navigate = useNavigate();
  const [newRecievedFriendReqNotif, setNewRecievedFriendReqNotif] =
    useState(false);
  const [friendReq, setFriendReq] = useState("");
  const [removeFriendReqNotif, setRemoveFriendReqNotif] = useState(false);
  const data = useContext(SocketDataContext);

  const notify = () => {
    setNewRecievedFriendReqNotif(false);
    toast(
      <NotificationPopupCard
        secondUsername={friendReq.username}
        avatar={friendReq.avatar}
      />,
      {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      }
    );
  };

  // useEffect(() => {
  //   if (data.type === "recieve-friend-request") {
  //     setNewRecievedFriendReqNotif(true);
  //     setRemoveFriendReqNotif(false);
  //     setFriendReq(data.message);
  //   } else if (
  //     data.type === "confirm-friend-request" &&
  //     data.message.username === friendReq.username
  //   ) {
  //     setRemoveFriendReqNotif(true);
  //   } else if (
  //     data.type === "remove-friend-request" &&
  //     data.message.username === friendReq.username
  //   ) {
  //     setRemoveFriendReqNotif(true);
  //   }
  //   // else
  //   //     console.log("unknown notif type");
  // }, [data.message.to_user, data.type]);

  useEffect(() => {
    {
      newRecievedFriendReqNotif && location.pathname !== "/mainpage/friends"
        ? notify()
        : console.log("");
    }
  }, [newRecievedFriendReqNotif]);

  useEffect(() => {
    privateCheckAuth();
  }, []);
  
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      setSidebarIsOpen(false);
      setSearchBar(false);
    }
  });

  const handleExapandSidebar = () => {
    setSidebarIsOpen(!sidebarIsOpen);
  };

  const handleSearchBar = () => {
    setSearchBar(!searchbar);
  };

  let logout = async (e) => {
    e.preventDefault();
    try {
      let response = await fetch(
        `http://${import.meta.env.VITE_IPADDRESS}:8000/api/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      let content = await response.json();
      if (content.message) {
        setUser("");
        navigate("/signin");
      }
    } catch (e) {
      console.log("Error in network or URL");
    }
  };
  return (
    <>
      {!hideNavSideBar && (
        <Navbar
          Icons={Icons}
          searchbar={searchbar}
          setSearchBar={setSearchBar}
          handleSearchBar={handleSearchBar}
        />
      )}
      <div className="sidebarWrapper">
        {!hideNavSideBar && <Sidebar Icons={Icons} />}
        <Outlet />
      </div>
    </>
  );
}

export default NavbarSidebar;
