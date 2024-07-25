import React, { useState } from "react";
import ReactFlagsSelect from "react-flags-select";

const CountrySelector = () => {
  const [selected, setSelected] = useState("");

  return (
    <>
      <ReactFlagsSelect
        selected={selected}
        onSelect={(code) => setSelected(code)}
        placeholder={<div className="update__country-placeholder">Select a Country</div>} 
        searchable
        searchPlaceholder="Search Countries"
        countries={["IL"]}
        blacklistCountries
        selectButtonClassName="country__select-button"
      />
    </>
  )
};

export default CountrySelector;