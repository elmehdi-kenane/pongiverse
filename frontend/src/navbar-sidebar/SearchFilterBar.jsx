import { useState, useEffect, useRef, useCallback } from "react";

const SearchFilterBar = ({ selectedBtn, setSelectedBtn }) => {
  return (
    <div className="SearchFilterBar">
      <div className="SearchFilterBarBtns">
        <button
          className={`${selectedBtn === "all" ? "selectedBtn" : ""}`}
          onClick={() => setSelectedBtn("all")}
        >
          All
        </button>
        <button
          className={`${selectedBtn === "people" ? "selectedBtn" : ""}`}
          onClick={() => setSelectedBtn("people")}
        >
          People
        </button>
        <button
          className={`${selectedBtn === "rooms" ? "selectedBtn" : ""}`}
          onClick={() => setSelectedBtn("rooms")}
        >
          Rooms
        </button>
      </div>
      <div className="verticalRow"></div>
    </div>
  );
};

export default SearchFilterBar;
