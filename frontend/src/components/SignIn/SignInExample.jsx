import { useState } from 'react';
import './signinexample.css'
import logo42 from '../../assets/SignUp/42_logo.svg'
import logo from '../../assets/SignUp/logo.svg'
import logoGoogle from '../../assets/SignIn/GoogleIcon.svg'
import pingPongBg from './ping_pong_bg.jpg'
import { Link } from 'react-router-dom';
import SignInForm from './SignInForm';
import SignInWays from './SignInWays';

function SignInExample() {
	const [isSingIn, setIsSignIn] = useState(true)

	const handleSignUpSwitch = () => {
		setIsSignIn(!isSingIn)
	}

	return (
		<div className='authentication-page'>
			<div className='authentication-navbar'>
				<img src={logo} alt="" />
			</div>
			<div className='authentication-container'>
				<div className={`authentication-signupdiv ${isSingIn ? 'hide' : 'show'}`}>
					<div className='authentication-signup'>
						<div className='authentication-signup-form'>
							<div className="authentication-signup-title-div">
								<p className='authentication-signup-title'>Sign Up</p>
							</div>
							<input type='email' className='authentication-signup-input' placeholder='Enter your email' />
							<input type='password' className='authentication-signup-input' placeholder='Enter a password' />
							<input type='password' className='authentication-signup-input' placeholder='Confirm your password' />
							<button className='authentication-signup-button'>Sign Up</button>
							<div className='authentication-signup-line'>
								<div className='authentication-signup-little-line'></div>
								<p className='authentication-signup-or'>Or</p>
								<div className='authentication-signup-little-line'></div>
							</div>
							<div className='authentication-signup-ways'>
								<img src={logoGoogle} alt="" />
								<img src={logo42} alt="" />
							</div>
							<p className='authentication-signup-have-account'>Already have an account? <Link onClick={handleSignUpSwitch} className='authentication-signup-have-account-link' >Sign In</Link></p>
						</div>
					</div>
					<div className='authentication-signup-rightdesign'>
						<img src={pingPongBg} alt="" />
					</div>
				</div>
				<div className={`authentication-signindiv ${isSingIn ? 'show' : 'hide'}`}>
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
							<p className='authentication-signin-dont-have-account'>Don't have an account? <Link onClick={handleSignUpSwitch} className='authentication-signin-dont-have-account-link' >Sign up</Link></p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SignInExample