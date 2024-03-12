import React from 'react';
import '../../assets/SignUp/style.css'
import logo from '../../assets/SignUp/logo.svg'
import home from '../../assets/SignUp/homee.svg'
function Header() {
  return (
	<div className="navBar">
			<button className="logo"><img src={logo} alt="logo"/></button>
			<button className="homeLogo"><img src={home} alt="logo"/></button>
		</div>
  );
}

export default Header;