import React, { useContext, useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import * as Icons from "../assets/navbar-sidebar";
import { useNavigate } from "react-router-dom";
import AuthContext from "./Authcontext";
import { Outlet } from "react-router-dom";

function NavbarSidebar() {
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const location = useLocation()
  const [isSearchBarMobileOpen, setIsSearchBarMobileOpen] = useState(false);
  let { user, socket, privateCheckAuth, setUser, hideNavSideBar } = useContext(AuthContext)
  let navigate = useNavigate()

  // useEffect(() => {
  //   privateCheckAuth();
  // }, []);
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      setSidebarIsOpen(false);
    }
  });

  const handleSearchBar = () => {
    setIsSearchBarMobileOpen(!isSearchBarMobileOpen);
  };

  let logout = async (e) => {
    e.preventDefault();
    try {
      let response = await fetch(
        `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/api/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 401)
        navigate('/signin')
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
          isSearchBarMobileOpen={isSearchBarMobileOpen}
          setIsSearchBarMobileOpen={setIsSearchBarMobileOpen}
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
