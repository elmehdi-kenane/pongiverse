import AuthContext from '../navbar-sidebar/Authcontext'
import { useContext } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

import NavbarIconSearch from "./NavbarIconSearch";
import NavbarprofNotifs from "./NavbarProfNotifs";

function Navbar({ Icons, handleExapandSidebar, searchbar, handleSearchBar }) {

    return (
        <div className="navbar blur">
            <NavbarIconSearch
                Icons={Icons}
                handleExapandSidebar={handleExapandSidebar}
                handleSearchBar={handleSearchBar}
                searchbar={searchbar}
            />
            <NavbarprofNotifs
                Icons={Icons} 
                handleSearchBar={handleSearchBar}
            />
        </div>
    );
}

export default Navbar;