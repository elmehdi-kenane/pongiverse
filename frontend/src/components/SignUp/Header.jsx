import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/SignUp/logo.svg'
import home from '../../assets/SignUp/homee.svg'
import signup from '../../assets/SignUp/Header.module.css'
function Header() {
  return (
	<div className={signup["navBar"]}>
			<button className={signup["logo"]}><img  src={logo} alt="logo"/></button>
		<Link to="/">
			<button className={signup["homeLogo"]}><img src={home} alt="logo"/></button>
		</Link>
		</div>
  );
}

export default Header;