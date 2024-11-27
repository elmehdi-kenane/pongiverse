import { useContext } from "react";
import NavbarIconSearch from "./NavbarIconSearch";
import NavbarprofNotifs from "./NavbarProfNotifs";
import AuthContext from "./Authcontext";


function Navbar({ Icons, isSearchBarMobileOpen, handleSearchBar }) {
  const { isGlass } = useContext(AuthContext);

  return (
    <div className={isGlass ? "navbar blur" : "navbar"}>
      <NavbarIconSearch
        Icons={Icons}
        handleSearchBar={handleSearchBar}
        isSearchBarMobileOpen={isSearchBarMobileOpen}
      />
      <NavbarprofNotifs Icons={Icons} handleSearchBar={handleSearchBar} />
    </div>
  );
}

export default Navbar;