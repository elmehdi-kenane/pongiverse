import React from 'react';
import styles from '../../assets/SignIn/authentication.module.css'
import Header from './Header';
import SignUpWays from './SignUpWays'
import SignUpForm from './SignUpForm'
import { Link } from 'react-router-dom';
import logo from '../../assets/SignUp/logo.svg'
import toast, { Toaster } from 'react-hot-toast';
import pingPongBg from '../SignIn/ping_pong_bg.jpg'

function SignUpPage(props) {
	const handleSignUpSwitch = () => {
	}

	return (
		<div className={styles['authentication-page']}>
			<Toaster/>
			<div className={styles['authentication-navbar']}>
				<img src={logo} alt="" />
			</div>
			<div className={styles['authentication-container']}>
				<div className={styles['authentication-signupdiv']}>
					<div className={styles['authentication-signup']}>
						<div className={styles['authentication-signup-form']}>
							<div className={styles["authentication-signup-title-div"]}>
								<p className={styles['authentication-signup-title']}>Sign Up</p>
							</div>
							<SignUpForm/>
							<div className={styles['authentication-signup-line']}>
								<div className={styles['authentication-signup-little-line']}></div>
								<p className={styles['authentication-signup-or']}>Or</p>
								<div className={styles['authentication-signup-little-line']}></div>
							</div>
							<SignUpWays/>
							<p className={styles['authentication-signup-have-account']}>Already have an account? <Link to="/signin" className={styles['authentication-signup-have-account-link']} >Sign In</Link></p>
						</div>
					</div>
					<div className={styles['authentication-signup-rightdesign']}>
						<img src={pingPongBg} alt="" />
					</div>
				</div>
			</div>
		</div>
	);
}

export default SignUpPage;