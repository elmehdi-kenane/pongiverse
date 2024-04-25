import React, { useContext, useState, useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import * as Icons from '../assets/navbar-sidebar'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../navbar-sidebar/Authcontext'
import { Outlet } from 'react-router-dom'
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
          <Navbar
              Icons={Icons}
              searchbar={searchbar}
              setSearchBar={setSearchBar}
              handleSearchBar={handleSearchBar}
          />
          <div className='sidebarWrapper'>
            <Sidebar
                Icons={Icons}
            />
            <Outlet />
          </div>
      </>
    );
}

export default NavbarSidebar;