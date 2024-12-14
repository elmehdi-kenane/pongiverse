import { Divider } from "@mui/material";
import { SearchBar } from "./SearchBar";
import { SearchBarMobile } from "./SearchBarMobile";

function NavbarIconSearch({ Icons, handleSearchBar, isSearchBarMobileOpen }) {
  return (
    <div className="searchBarsWrapperWithLogo">
      <div className="logo">
        <a href="#">
          <img src={Icons.pingpong} alt="ping pong" />
        </a>
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
