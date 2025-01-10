import styles from '../../assets/SignIn/ChangePassword.module.css'
import Header from '../SignUp/Header';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/SignUp/logo.svg'
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
const client = axios.create({
	baseURL: `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}`,
});

function ChangePassword() {

	const [data, setData] = useState({
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [errors, setErrors] = useState({})
	const handleChange = (e) => {
		setData({ ...data, [e.target.name]: e.target.value });
	};
	const navigate = useNavigate();
	const location = useLocation();
	const mydata = location.state || {};

	useEffect(() => {
		if (!mydata.email) {
			navigate("/forgotpassword");
		}
	}, [mydata])

	const handleSubmit = (e) => {
		e.preventDefault();
		const validationErrors = {}
		if (!data.password.trim()) {
			validationErrors.password = "password is required"
		} else if (data.password.length < 8) {
			validationErrors.password = "password should be atleast 8 characters"
		}
		if (!data.confirmPassword.trim()) {
			validationErrors.confirmPassword = "Please confirm your password"
		} else if (data.confirmPassword !== data.password) {
			validationErrors.confirmPassword = "password not matched"
		}
		setErrors(validationErrors)
		if (Object.keys(validationErrors).length === 0) {
			mydata.password = data.password
			client.post('/auth/ChangePassword/', mydata, {
				headers: {
					'Content-Type': 'application/json',
				}
			}).then(response => {
				if (response.data.Case === "Password successfully changed") {
					navigate('/signin');
				}
			})
				.catch(error => {
					console.error('There was an error!', error);
				});
		}
	};

	const navigating = () => {
		navigate('/')
	}

	return (
		<div className={styles["body_page"]}>
			<div className={styles["mainPage"]}>
				<div className={styles['change-password-navbar']}>
					<img src={logo} alt="" onClick={navigating}/>
				</div>
				<div className={styles["bodyPage"]}>
					<div className={styles["FPasswordContainer"]}>
						<h1 className={styles["title"]}>Change Your Password</h1>
						<form className={styles["ForgotPasswordForm"]} onSubmit={handleSubmit} noValidate>
							<input className={styles["inputs"]} type="password" name='password' autoComplete="password"  value={data.password} maxLength={100} onChange={handleChange} placeholder="enter a password" />
							{errors.password && <span>{errors.password}</span>}
							<input className={styles["inputs"]} type="password" name='confirmPassword' autoComplete="confirmPassword" value={data.confirmPassword} maxLength={100} onChange={handleChange} placeholder="confirm your password" />
							{errors.confirmPassword && <span>{errors.confirmPassword}</span>}
							<button type="submit" className={styles["submitButton"]}>Sign Up</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ChangePassword;