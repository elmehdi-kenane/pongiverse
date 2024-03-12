import React from 'react';
import '../../assets/SignUp/style.css'
import logo42 from '../../assets/SignUp/42_logo.svg'
import googleIcon from '../../assets/SignUp/googleIcon.png'

function SignUpWays(props) {
  return (
	<>
		<div className="Intra">
			<img className="intraLogo" src={logo42} alt=""/>
			<button className="IntraButton">{props.IntraTitle}</button>
		</div>
		<div className="Google">
			<img className="googleLogo" src={googleIcon} alt=""/>
			<button className="GoogleButton">{props.GoogleTitle}</button>
		</div>
	</>

  );
}

export default SignUpWays;