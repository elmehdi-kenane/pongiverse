import React, { useContext, useState } from "react";
import ReactFlagsSelect from "react-flags-select";
import AuthContext from "../../navbar-sidebar/Authcontext";
import SettingsContext from "../SettingsWrapper";
import { useNavigate } from "react-router-dom";

function UpdateCountry() {
   
  const { user } = useContext(AuthContext);
  const { userCountry, setUserCountry, notifySuc, notifyErr } = useContext(SettingsContext);
  const navigate = useNavigate();
  const updateCountry = async (country) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/updateUserCountry`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: country
        })
      });
      const res = await response.json()
      if (response.ok) {
        notifySuc(res.case)
        setUserCountry(country);
      } else if (response.status === 401) {
        navigate('/signin')
      }
      else
        notifyErr(res.error)
    } catch (error) {
      notifyErr(error)
    }
  }

    return (
      <div className="update country-space">
          <p className='title'> Country </p>
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
      </div>
    )
  }

export default UpdateCountry
