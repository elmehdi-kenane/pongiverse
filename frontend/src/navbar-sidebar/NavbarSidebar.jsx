import React, { useContext, useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import * as Icons from "../assets/navbar-sidebar";
import { useNavigate } from "react-router-dom";
import AuthContext from "../navbar-sidebar/Authcontext";
import { Outlet } from "react-router-dom";
import { Navigate } from 'react-router-dom';

function NavbarSidebar() {
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [searchbar, setSearchBar] = useState(false);
  let { user, privateCheckAuth, setUser, hideNavSideBar, isAuthenticated } = useContext(AuthContext)
  let navigate = useNavigate()

  useEffect(() => {
    privateCheckAuth()
  }, [])

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

  return (
    <>
      {isAuthenticated ? (
        <>
          {!hideNavSideBar && (
            <Navbar
              Icons={Icons}
              searchbar={searchbar}
              setSearchBar={setSearchBar}
              handleSearchBar={handleSearchBar}
            />
          )}
          <div className='sidebarWrapper'>
            {!hideNavSideBar && <Sidebar Icons={Icons} />}
            <Outlet />
          </div>
        </>
      ) : (
        <Navigate to="/signin" replace />
      )}
    </>
  );
}

export default NavbarSidebar;
