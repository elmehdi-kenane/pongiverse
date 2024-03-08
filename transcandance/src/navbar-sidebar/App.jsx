import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useState } from 'react';
import '../assets/navbar-sidebar/index.css';
import * as Icons from '../assets/navbar-sidebar';


function App() {
    const [sidebarIsOpen, setSidebarIsOpen] = new useState(false);
    const [searchbar, setSearchBar] = new useState(false);

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

  return (
      <div className="page">
          <Navbar
              Icons={Icons}
              handleExapandSidebar={handleExapandSidebar}
              searchbar={searchbar}
              setSearchBar={setSearchBar}
              handleSearchBar={handleSearchBar}
          />
          <Sidebar
              sidebarIsOpen={sidebarIsOpen}
              Icons={Icons}
          />
      </div>
  );
}

export default App;