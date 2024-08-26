import { useState, useEffect, useRef, useCallback } from "react";
import { debounce } from "lodash";
import SearchFilterBar from "./SearchFilterBar";
import AuthContext from "./Authcontext";
import { useContext } from "react";

export const SearchBar = () => {
  const searchBarRef = useRef(null);
  const searchInputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");
  const [searchResult, setSearchResult] = useState([]);
  const [searchUsersResult, setSearchUsersResult] = useState([]);
  const [searchRoomsResult, setSearchRoomsResult] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const termNotFoundText = "Search Term Not Found";

  //   console.log("username from context outside:", user);
  //   useEffect(() => {
  const getSearchResult = async (searchTerm, username) => {
    if (searchTerm !== "") {
      // console.log("username from context inside:", user);
      console.log("fetch search result with term:", searchTerm);

      const response = await fetch(
        `http://localhost:8000/navBar/search_view/?searchTerm=${searchTerm}&username=${username}`,
        {
          method: "GET",
        }
      );
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

  const debouncedSearch = useCallback(debounce(getSearchResult, 500), []);

  const handleInputChange = (event) => {
    // Debounced Function Instantiation: The debouncedSearch function is being re-created every time handleInputChange is called. This means the debounce effect might not work as expected because a new debounced function is created on every keystroke. Solution: Move the instantiation of debouncedSearch outside of the handleInputChange function or use the useCallback hook to memoize it.
    debouncedSearch(event.target.value, user);
    setSearchResult(null);
    setInputValue(event.target.value);
  };

  const handleClickOutside = (event) => {
    if (
      searchBarRef &&
      searchBarRef.current &&
      !searchBarRef.current.contains(event.target)
    ) {
      setIsSearchBarOpen(false);
    }
  };

  const handleEscapeKey = (event) => {
    if (
      searchInputRef &&
      searchInputRef.current &&
      searchInputRef.current.contains(event.target) &&
      event.key === "Escape"
    ) {
      setIsSearchBarOpen(false);
      searchInputRef.current.blur();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  const openSearchBar = () => {
    setIsSearchBarOpen(true);
  };

  return (
    <div className="search-bar" ref={searchBarRef}>
      <input
        type="text"
        placeholder="Search"
        value={inputValue}
        onChange={handleInputChange}
        onClick={openSearchBar}
        ref={searchInputRef}
      />
      {isSearchBarOpen && (
        <div className="searchResultWrapper">
          {inputValue === "" ? (
            searchHistory.length === 0 ? (
              <p className="searchEmpty">Search History is Empty</p>
            ) : (
              <p>show history</p>
            )
          ) : (
            <>
              <SearchFilterBar
                selectedBtn={searchFilter}
                setSelectedBtn={setSearchFilter}
              ></SearchFilterBar>
              {searchResult === null ? (
                <p className="searchEmpty">Loading...</p>
              ) : (
                <>
                  {searchFilter === "all" &&
                    (searchResult.length === 0 ? (
                      <p className="searchEmpty">{termNotFoundText}</p>
                    ) : (
                      searchResult.map((item, index) => {
                        return (
                          <div key={index} className="searchResultItem">
                            <img src={item.avatar} alt={item.avatar} />
                            <p>{item.username}</p>
                            {item.is_friend === false && (
                              <button>
                                {item.result_type === "user"
                                  ? "Add friend"
                                  : "Join room"}
                              </button>
                            )}
                          </div>
                        );
                      })
                    ))}
                  {searchFilter === "people" &&
                    (searchUsersResult.length === 0 ? (
                      <p className="searchEmpty">{termNotFoundText}</p>
                    ) : (
                      searchUsersResult.map((item, index) => {
                        return (
                          <div key={index} className="searchResultItem">
                            <img src={item.avatar} alt={item.avatar} />
                            <p>{item.username}</p>
                            {item.is_friend === false && (
                              <button>Add friend</button>
                            )}
                          </div>
                        );
                      })
                    ))}
                  {searchFilter === "rooms" &&
                    (searchRoomsResult.length === 0 ? (
                      <p className="searchEmpty">{termNotFoundText}</p>
                    ) : (
                      searchRoomsResult.map((item, index) => {
                        return (
                          <div key={index} className="searchResultItem">
                            <img src={item.avatar} alt={item.avatar} />
                            <p>{item.username}</p>
                            {item.is_friend === false && (
                              <button>Join room</button>
                            )}
                          </div>
                        );
                      })
                    ))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
