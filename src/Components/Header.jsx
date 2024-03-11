import React from 'react';
import '../assets/SignUp/style.css'
function Header() {
  return (
    <div className="navContainer">
		<div className="logo">
			<img src="logo.svg" alt=""/>
		</div>
		<div className="logoHome">
			<button href="#"><img src="homee.svg" alt=""/></button>
		</div>
	</div>
  );
}

export default Header;