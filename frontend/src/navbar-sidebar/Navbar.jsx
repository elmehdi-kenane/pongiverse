import { useContext } from "react";
import NavbarIconSearch from "./NavbarIconSearch";
import NavbarprofNotifs from "./NavbarProfNotifs";

import AuthContext from "./Authcontext";


function Navbar({ Icons, handleExapandSidebar, searchbar, handleSearchBar }) {

    const {isReport} = useContext(AuthContext);

    return (
        <div className={isReport ?"navbar profile-blur":"navbar blur"}>
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