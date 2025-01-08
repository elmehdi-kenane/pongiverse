import { useState, useEffect, useRef, useCallback } from "react";
import { debounce } from "lodash";
import SearchFilterBar from "./SearchFilterBar";
import AuthContext from "./Authcontext";
import { useContext } from "react";
import SearchResultCard from "./SearchResultCard";
import { useNavigate } from "react-router-dom";

export const SearchBarMobile = ({ handleSearchBar }) => {
  const searchBarRef = useRef(null);
  const searchInputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  const [searchFilter, setSearchFilter] = useState("all");
  const [searchResult, setSearchResult] = useState([]);
  const [searchUsersResult, setSearchUsersResult] = useState([]);
  const [searchRoomsResult, setSearchRoomsResult] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  let termNotFoundText;
  if (searchFilter === "all")
    termNotFoundText = `No results found for '${inputValue}'`;
  else
    termNotFoundText = `No results found for '${inputValue}' under ${searchFilter} filter`;

  //   useEffect(() => {
  const getSearchResult = async (searchTerm, username) => {
    if (searchTerm !== "") {

      const response = await fetch(
        `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/navBar/search_view/?searchTerm=${searchTerm}&username=${username}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.status === 401)
        navigate('/signin')
      const res = await response.json();
      if (res) {
        setSearchResult(res);
        setSearchUsersResult(
          res.filter((resultItem) => resultItem.result_type === "user")
        );
        setSearchRoomsResult(
          res.filter((resultItem) => resultItem.result_type === "room")
        );
        setSearchFilter("all");
      }
    }
  };
  //   });

  const delay = 300;
  const debouncedSearch = useCallback(debounce(getSearchResult, delay), []);
  const handleInputChange = (event) => {
    // Debounced Function Instantiation: The debouncedSearch function is being re-created every time handleInputChange is called. This means the debounce effect might not work as expected because a new debounced function is created on every keystroke. Solution: Move the instantiation of debouncedSearch outside of the handleInputChange function or use the useCallback hook to memoize it.
    setSearchResult(null);
    debouncedSearch(event.target.value, user);
    setInputValue(event.target.value);
  };
  const handleClickOutside = (event) => {
    if (
      searchBarRef &&
      searchBarRef.current &&
      !searchBarRef.current.contains(event.target)
    ) {
      handleSearchBar();
    }
  };

  const handleEscapeKey = (event) => {
    if (
      searchInputRef &&
      searchInputRef.current &&
      searchInputRef.current.contains(event.target) &&
      event.key === "Escape"
    ) {
      handleSearchBar();
      searchInputRef.current.blur();
    }
  };

  const navigateToProfile = () => { };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    <div className="search-bar-mobile" ref={searchBarRef}>
      <input
      maxLength={18}
        type="text"
        placeholder="Search for people or rooms..."
        value={inputValue}
        onChange={handleInputChange}
        className="search-bar-mobile-input"
        ref={searchInputRef}
        autoFocus
      />
      <div className="searchResultWrapper">
        {inputValue === "" ? (
          <p className="searchEmpty">Search for people or rooms...</p>
        ) : (
          <div className="searchResultWrapperFilterBar">
            <SearchFilterBar
              selectedBtn={searchFilter}
              setSelectedBtn={setSearchFilter}
            ></SearchFilterBar>
            {searchResult === null ? (
              <p className="searchEmpty">Loading...</p>
            ) : (
              <div className="searchResultWrapperNoFilterBar">
                {
                  searchFilter === "all" &&
                  (searchResult.length === 0 ? (
                    <p className="searchEmpty">{termNotFoundText}</p>
                  ) : (
                    searchResult.map((item, index) => {
                      return (
                        <SearchResultCard
                          key={index}
                          index={index}
                          id={item.id}
                          members_count={item.members_count}
                          resultText={item.username}
                          avatar={item.avatar}
                          result_type={item.result_type}
                          is_friend={item.is_friend}
                          is_joined={item.is_joined}
                          searchResult={searchResult}
                          setSearchResult={setSearchResult}
                          searchTerm={inputValue}
                          handleSearchBar={handleSearchBar}
                          setInputValue={setInputValue}
                        ></SearchResultCard>
                      );
                    })
                  ))
                }
                {
                  searchFilter === "people" &&
                  (searchUsersResult.length === 0 ? (
                    <p className="searchEmpty">{termNotFoundText}</p>
                  ) : (
                    searchUsersResult.map((item, index) => {
                      return (
                        <SearchResultCard
                          key={index}
                          index={index}
                          id={item.id}
                          members_count={item.members_count}
                          resultText={item.username}
                          avatar={item.avatar}
                          result_type={item.result_type}
                          is_friend={item.is_friend}
                          is_joined={item.is_joined}
                          searchResult={searchResult}
                          setSearchResult={setSearchResult}
                          searchTerm={inputValue}
                          handleSearchBar={handleSearchBar}
                          setInputValue={setInputValue}
                        ></SearchResultCard>
                      );
                    })
                  ))
                }
                {searchFilter === "rooms" &&
                  (searchRoomsResult.length === 0 ? (
                    <p className="searchEmpty">{termNotFoundText}</p>
                  ) : (
                    searchRoomsResult.map((item, index) => {
                      return (
                        <SearchResultCard
                          key={index}
                          index={index}
                          id={item.id}
                          members_count={item.members_count}
                          resultText={item.username}
                          avatar={item.avatar}
                          result_type={item.result_type}
                          is_friend={item.is_friend}
                          is_joined={item.is_joined}
                          searchResult={searchResult}
                          setSearchResult={setSearchResult}
                          searchTerm={inputValue}
                          handleSearchBar={handleSearchBar}
                          setInputValue={setInputValue}
                        ></SearchResultCard>
                      );
                    })
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
