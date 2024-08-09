import React, { useContext, useState } from "react";
import ReactFlagsSelect from "react-flags-select";
import AuthContext from "../../navbar-sidebar/Authcontext";
import SettingsContext from "../SettingsWrapper";
import toast from 'react-hot-toast';

function UpdateCountry() {
   
  const { user } = useContext(AuthContext);
  const { userCountry, setUserCountry } = useContext(SettingsContext);

  const notifySuc = (suc) => toast.success(suc);
  const notifyErr = (err) => toast.error(err);

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
        notifySuc(res.case)
        setUserCountry(country);
      }
      else
        notifyErr(res.error)
    } catch (error) {
      notifyErr(error)
      console.log(error)
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
