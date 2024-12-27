import { useState } from "react";
import ProfileIcon from "./ProfileIcon";
import NotificationsIcon from "./NotificationsIcon";

function NavbarprofNotifs({ Icons, handleSearchBar }) {
    const [profileDropDownisOpen, setProfileDropDownisOpen] = new useState(false);
    const [notificationsDropDownisOpen, setNotificationsDropDownisOpen] = new useState(false);

    const profileHandleDropDown = () => {
        if (notificationsDropDownisOpen)
            setNotificationsDropDownisOpen(!notificationsDropDownisOpen);
        setProfileDropDownisOpen(!profileDropDownisOpen);
    };
    
    const notificationsHandleDropDown = () => {
        if (profileDropDownisOpen)
            setProfileDropDownisOpen(!profileDropDownisOpen);
        setNotificationsDropDownisOpen(!notificationsDropDownisOpen);
    };

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#profile-icon') && profileDropDownisOpen) {
            setProfileDropDownisOpen(!profileDropDownisOpen);
        }
        // if (!e.target.closest('#notifications-icon') && notificationsDropDownisOpen)
        //     setNotificationsDropDownisOpen(!notificationsDropDownisOpen);
    });
    return (
      <div className="profile-notifications">
        <div className="search-icon-mobile" onClick={handleSearchBar}>
          <a href="#">
            <img src={Icons.searchMobile} alt="searchIcon-mobile" />
          </a>
        </div>
        <NotificationsIcon
          notificationsDropDownisOpen={notificationsDropDownisOpen}
          Icons={Icons}
          setNotificationsDropDownisOpen={setNotificationsDropDownisOpen}
        />
        <ProfileIcon
          Icons={Icons}
          profileHandleDropDown={profileHandleDropDown}
          profileDropDownisOpen={profileDropDownisOpen}
        />
      </div>
    );
}
 
export default NavbarprofNotifs;