function NavbarIconSearch({ Icons, handleExapandSidebar, handleSearchBar, searchbar }) {
    return (
        <>
            <div className="logo">
                <a href="#">
                    <img src={Icons.pingpong} alt="ping pong" />
                </a>
            </div>
            <div className="search-bar">
                <input type="text" placeholder="Search" />
            </div>
            { searchbar && (<div className="search-bar-mobile">
                <input type="text" placeholder="Search" onBlur={handleSearchBar} autoFocus/>
            </div>)}
        </>
    );
}
 
export default NavbarIconSearch;