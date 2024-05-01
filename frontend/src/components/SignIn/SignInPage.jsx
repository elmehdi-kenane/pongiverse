import React from 'react';
import styles from '../../assets/SignUp/SignUpPage.module.css'
import Header from '../SignUp/Header';
import SignInWays from './SignInWays'
import SignInForm from './SignInForm'
import { Link } from 'react-router-dom';

function SignInPage(props) {
  return (
	<div className={styles["body_page"]}>
		<div className={styles["mainPage"]}>
			<Header/>
			<div className={styles["bodyPage"]}>
				<div className={styles["signUpContainer"]}>
					<h1 className={styles["title"]}>Sign In</h1>
					<SignInWays/>
					<div className={styles["withEmail"]}>
						<div className={styles["lineBef"]}></div>
						<div className={styles["withEmailP"]}>
							<p>Sign In With Email</p>
						</div>
						<div className={styles["lineAf"]}></div>
					</div>
					<SignInForm/>
					<p className={styles['alradyHave']}>Don't have an account?<Link to="/signup">Sign up</Link></p>
				</div>
			</div>
		</div>
	</div>
  );
}

export default SignInPage;