import React from 'react';

function NavBarSection(props) {
    return(
    <div className="nav-container">
        <div className="logo">
            <img src={props.logo} alt=""/>
        </div>
        <div className="logo-home">
            <button href="#"><img src={props.homeicon} alt=""/></button>
        </div>
    </div>
    );
}

export default NavBarSection;