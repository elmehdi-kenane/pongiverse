import React, { useContext, useState } from "react";
import ReactFlagsSelect from "react-flags-select";
import AuthContext from "../../navbar-sidebar/Authcontext";
import SettingsContext from "../SettingsWrapper";

const CountrySelector = () => {

  const {user} = useContext(AuthContext);
  const { userCountry, setUserCountry } = useContext(SettingsContext);

  const updateCountry = async (country) => {
    try {
      const response = await fetch('http://localhost:8000/profile/updateUserCountry', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: user,
          country: country
        })
      });
      const res = await response.json()
      if (response.ok) {
        console.log(res.case)
        setUserCountry(country);
      }
      else
        console.log(res.error)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <ReactFlagsSelect
        selected={userCountry}
        onSelect={(code) => updateCountry(code)}
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