import React, { useContext, useState, useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import * as Icons from '../assets/navbar-sidebar'
import { useNavigate } from 'react-router-dom'
import AuthContext from './Authcontext'
import SocketDataContext from './SocketDataContext'
import NotificationPopupCard from './NotificationPopupCard'
import { Outlet } from 'react-router-dom'

function NavbarSidebar() {
    const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
    const [searchbar, setSearchBar] = useState(false);
    let { socket, privateCheckAuth, setUser, hideNavSideBar } = useContext(AuthContext)
    const data = useContext(SocketDataContext)
    let navigate = useNavigate()
    const [newRecievedFriendReqNotif, setNewRecievedFriendReqNotif] = useState(false);

    console.log("xxxxxxx");
    console.log(data);
    console.log("xxxxxxx");
    useEffect(() => {
        console.log("============ socket-notif-start ============");
        console.log(data.message, data.type);
        console.log("============ socket-notif-end ============");
        if (data.type === 'recieve-friend-request') {
            console.log("notification will be appear here");
            setNewRecievedFriendReqNotif(true);
        }
        else
            console.log("unknown notif type");
    }, [data.message, data.type, socket]);

    useEffect(() => {
      privateCheckAuth()
    }, [])

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
          setSidebarIsOpen(false);
          setSearchBar(false);
        }
    });

    const handleExapandSidebar = () => {
        setSidebarIsOpen(!sidebarIsOpen)
    }

    const handleSearchBar = () => {
      setSearchBar(!searchbar);
    }

    let logout = async (e) => {
      e.preventDefault();

      try {
        let response = await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json',
          },
        })
        let content = await response.json()
        if (content.message) {
          setUser('')
          navigate('/signin')
        }
      } catch (e) {
        console.log('Error in network or URL')
      }
    }
    return (
      <>
            {
                newRecievedFriendReqNotif ?
                    <NotificationPopupCard secondUsername={data.message}></NotificationPopupCard>
                    :
                    console.log("there's no newRecievedFriendReqNotif")
        }
          {!hideNavSideBar && (<Navbar
              Icons={Icons}
              searchbar={searchbar}
              setSearchBar={setSearchBar}
              handleSearchBar={handleSearchBar}
          />)}
          {<div className='sidebarWrapper'>
            {!hideNavSideBar && (<Sidebar
                Icons={Icons}
            />)}
            <Outlet />
          </div>}
      </>
    );
}

export default NavbarSidebar;