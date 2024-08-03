import React from 'react';
import styles from '../../assets/SignUp/SignUpPage.module.css'
import Header from './Header';
import SignUpWays from './SignUpWays'
import SignUpFrom from './SignUpForm'
import { Link } from 'react-router-dom';

function SignUpPage(props) {
  return (
	<div className={styles["body_page"]}>
		<div className={styles["mainPage"]}>
			<Header/>
			<div className={styles["bodyPage"]}>
				<div className={styles["signUpContainer"]}>
					<h1 className={styles["title"]}>Sign Up</h1>
					<SignUpWays IntraTitle="Sign Up With Intra" GoogleTitle="Sign Up With Google" />
					<div className={styles["withEmail"]}>
						<div className={styles["lineBef"]}></div>
						<div className={styles["withEmailP"]}>
							<p>Sign Up With Email</p>
						</div>
						<div className={styles["lineAf"]}></div>
					</div>
					<SignUpFrom/>
					<p className={styles['alradyHave']}>Already have an account? <Link to="/signin">Sign in</Link></p>
				</div>
			</div>
		</div>
	</div>
  );
}

export default SignUpPage;