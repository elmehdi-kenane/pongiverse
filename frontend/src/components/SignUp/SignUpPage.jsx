import { useState } from 'react';
import '../SignIn/signinexample.css'
import logo42 from '../../assets/SignUp/42_logo.svg'
import logo from '../../assets/SignUp/logo.svg'
import logoGoogle from '../../assets/SignIn/GoogleIcon.svg'
import pingPongBg from '../SignIn/ping_pong_bg.jpg'
import { Link } from 'react-router-dom';
import SignUpForm from './SignUpForm';
import SignUpWays from './SignUpWays';

function SignInPage() {

	return (
		<div className='authentication-page'>
			<div className='authentication-navbar'>
				<img src={logo} alt="" />
			</div>
			<div className='authentication-container'>
				<div className={'authentication-signupdiv'}>
					<div className='authentication-signup'>
						<div className='authentication-signup-form'>
							<div className="authentication-signup-title-div">
								<p className='authentication-signup-title'>Sign Up</p>
							</div>
							<SignUpForm/>
							<div className='authentication-signup-line'>
								<div className='authentication-signup-little-line'></div>
								<p className='authentication-signup-or'>Or</p>
								<div className='authentication-signup-little-line'></div>
							</div>
							<SignUpWays/>
							<p className='authentication-signup-have-account'>Already have an account? <Link to="/signin" className='authentication-signup-have-account-link' >Sign In</Link></p>
						</div>
					</div>
					<div className='authentication-signup-rightdesign'>
						<img src={pingPongBg} alt="" />
					</div>
				</div>
			</div>
		</div>
	);
}

export default SignInPage