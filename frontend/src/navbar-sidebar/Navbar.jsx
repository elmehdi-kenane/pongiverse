import { useContext } from "react";
import NavbarIconSearch from "./NavbarIconSearch";
import NavbarprofNotifs from "./NavbarProfNotifs";

import AuthContext from "./Authcontext";


function Navbar({ Icons, handleExapandSidebar, searchbar, handleSearchBar }) {

    const {isGlass} = useContext(AuthContext);

    return (
        <div className={(isGlass) ?"navbar profile-blur":"navbar"}>
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