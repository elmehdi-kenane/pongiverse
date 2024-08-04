import { useState } from 'react';
import './signinexample.css'
import logo42 from '../../assets/SignUp/42_logo.svg'
import logo from '../../assets/SignUp/logo.svg'
import logoGoogle from '../../assets/SignIn/GoogleIcon.svg'
import pingPongBg from './ping_pong_bg.jpg'
import { Link } from 'react-router-dom';
import SignInForm from './SignInForm';
import SignInWays from './SignInWays';
import SignUpForm from '../SignUp/SignUpForm';
import SignUpWays from '../SignUp/SignUpWays';
import { useNavigate } from 'react-router-dom';

function SignInPage() {

	return (
		<div className='authentication-page'>
			<div className='authentication-navbar'>
				<img src={logo} alt="" />
			</div>
			<div className='authentication-container'>
				<div className='authentication-signindiv'>
					<div className='authentication-signin-leftdesign'>
						<img src={pingPongBg} alt="" />
					</div>
					<div className='authentication-signin'>
						<div className='authentication-signin-form'>
							<div className="authentication-signin-title-div">
								<p className='authentication-signin-title'>Sign In</p>
							</div>
							<SignInForm/>
							<div className='authentication-signin-line'>
								<div className='authentication-signin-little-line'></div>
								<p className='authentication-signin-or'>Or</p>
								<div className='authentication-signin-little-line'></div>
							</div>
							<SignInWays/>
							<p className='authentication-signin-dont-have-account'>Don't have an account? <Link to="/signup" className='authentication-signin-dont-have-account-link' >Sign up</Link></p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SignInPage