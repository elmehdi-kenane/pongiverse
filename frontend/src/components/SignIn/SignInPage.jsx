import { useState } from 'react';
import styles from '../../assets/SignIn/authentication.module.css'
import logo42 from '../../assets/SignUp/42_logo.svg'
import logo from '../../assets/SignUp/logo.svg'
import logoGoogle from '../../assets/SignIn/GoogleIcon.svg'
import pingPongBg from './signInImage.svg'
import { Link } from 'react-router-dom';
import SignInForm from './SignInForm';
import SignInWays from './SignInWays';
import SignUpForm from '../SignUp/SignUpForm';
import SignUpWays from '../SignUp/SignUpWays';
import toast, { Toaster } from 'react-hot-toast';
function SignInPage() {


	return (
		<div className={styles['authentication-page']}>
			<Toaster />
			<div className={styles['authentication-navbar']}>
				<img src={logo} alt="" />
			</div>
			<div className={styles['authentication-container']}>
				<div className={styles['authentication-signindiv']}>
					<div className={styles['authentication-signin-leftdesign']}>
						<img src={pingPongBg} alt="" />
					</div>
					<div className={styles['authentication-signin']}>
						<div className={styles['authentication-signin-form']}>
							<div className={styles["authentication-signin-title-div"]}>
								<p className={styles['authentication-signin-title']}>Sign In</p>
							</div>
							<SignInForm/>
							<div className={styles['authentication-signin-line']}>
								<div className={styles['authentication-signin-little-line']}></div>
								<p className={styles['authentication-signin-or']}>Or</p>
								<div className={styles['authentication-signin-little-line']}></div>
							</div>
							<SignInWays/>
							<p className={styles['authentication-signin-dont-have-account']}>Don't have an account? <Link to="/signup" className={styles['authentication-signin-dont-have-account-link']} >Sign up</Link></p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SignInPage

