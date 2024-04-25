import React, { useContext, useState, useEffect } from 'react'
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import * as Icons from '../assets/navbar-sidebar';
import { Navigate, useNavigate } from 'react-router-dom'
import AuthContext from '../navbar-sidebar/Authcontext'
import { Routes, Route, Link } from 'react-router-dom'
import Dashboard from '../Dashboard/Dashboard';
import Chat from '../Chat/Chat';
import Groups from '../Groups/Groups';
import Game from '../Game/Game';
import Friends from '../Friends/Friends';
import ChatMessages from '../Groups/ChatMessages';
import { AuthProvider } from '../navbar-sidebar/Authcontext';

function NavbarSidebar() {
    const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
    const [searchbar, setSearchBar] = useState(false);
    let { user, privateCheckAuth, setUser } = useContext(AuthContext)
    let navigate = useNavigate()
    // let { isauthenticated } = useContext(AuthContext)
    // let { setUser } = useContext(AuthContext)
    // let url = `ws://localhost:8000/ws/socket-server`
    // const chatSocket = new WebSocket(url)
    
    useEffect(() => {
      privateCheckAuth()
      // chatSocket.onmessage = (e) => {
      //   let data = JSON.parse(e.data)
      //   if (user)
      //     console.log(data)
      // }
      // return () => {
      //   if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
      //     chatSocket.close();
      //   }
      // };
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

    // let goToGamePage = () => {
    //   navigate('/game')
    // }

    return (
      <>
          <Navbar
              Icons={Icons}
              handleExapandSidebar={handleExapandSidebar}
              searchbar={searchbar}
              setSearchBar={setSearchBar}
              handleSearchBar={handleSearchBar}
          />
          <div style={{display: "flex", flexDirection: "row"}}>
            <Sidebar
                sidebarIsOpen={sidebarIsOpen}
                Icons={Icons}
            />
            <Routes>
              <Route path='/dashboard' Component={Dashboard} />
              <Route path='/chat' Component={Chat} />
              <Route path='/friends' Component={Friends} />
              <Route path='/groups' Component={Groups}/>
              <Route path='/game/*' Component={Game} />
              <Route path='groups/:roomId' Component={ChatMessages}/>
              {/* <div style={{color:"white"}}> <p>Welcome {user}</p></div>
              <div><button onClick={logout}>logout</button></div> */}
            </Routes>
          </div>
      </>
    );
}

export default NavbarSidebar;