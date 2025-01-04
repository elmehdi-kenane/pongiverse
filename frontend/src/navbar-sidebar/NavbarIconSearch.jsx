import { Divider } from "@mui/material";
import { SearchBar } from "./SearchBar";
import { SearchBarMobile } from "./SearchBarMobile";
import { Link } from "react-router-dom";

function NavbarIconSearch({ Icons, handleSearchBar, isSearchBarMobileOpen }) {
  return (
    <div className="searchBarsWrapperWithLogo">
      <div className="logo">
        <Link to='/mainpage'>
          <img src={Icons.pingpong} alt="ping pong" />
        </Link>
      </div>
      <div className="searchBarsWrapper">
        <SearchBar></SearchBar>
        {isSearchBarMobileOpen && (
          <SearchBarMobile handleSearchBar={handleSearchBar}></SearchBarMobile>
        )}
      </div>
    </div>
  );
}

export default NavbarIconSearch;
