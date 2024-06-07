import NavbarIconSearch from "./NavbarIconSearch";
import NavbarprofNotifs from "./NavbarProfNotifs";
import ChatContext from "../Groups/ChatContext";
import { useContext } from "react";

function Navbar({ Icons, handleExapandSidebar, searchbar, handleSearchBar }) {
    const {isBlur} = useContext(ChatContext)
    return (
        <div className= {isBlur ? "blur navbar" : "navbar"}>
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