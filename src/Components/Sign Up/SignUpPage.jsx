import React from 'react';
import '../../assets/SignUp/style.css'
import Header from './Header';
import SignUpWays from './SignUpWays'
import SignUpFrom from './SignUpFrom'

function SignUpPage(props) {
  return (
	<div className="mainPage">
		<Header/>
		<div className="bodyPage">
			<div className="signUpContainer">
				<h1 className="title">Sign Up</h1>
				<SignUpWays IntraTitle="Sign Up With Intra" GoogleTitle="Sign Up With Google" />
				<div className="withEmail">
					<div className="lineBef"></div>
					<div className="withEmailP">
						<p>Sign Up With Email</p>
					</div>
					<div className="lineAf"></div>
				</div>
				<SignUpFrom/>
				<p className='alradyHave'>Already have an account? <a href="#">Sign in</a></p>
			</div>
		</div>
	</div>
  );
}

export default SignUpPage;