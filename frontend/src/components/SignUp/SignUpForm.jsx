import React, { useState } from 'react';
import styles from '../../assets/SignIn/authentication.module.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
const client = axios.create({
	baseURL: `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}`,
});

function SignUpForm() {

	const navigate = useNavigate();
	const [data, setData] = useState({
		email: '',
		password: '',
		confirmPassword: ''
	});

	const [exist, setExist] = useState(false);

	const [errors, setErrors] = useState({})

	const handleChange = (e) => {
		setData({ ...data, [e.target.name]: e.target.value });
	};

	const handleNextClick = (e) => {
		e.preventDefault()
		const validationErrors = {}
		if (!data.email.trim()) {
			validationErrors.email = "email is required"
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
			validationErrors.email = "email is not valid"
		}

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
			client.post('/auth/checkemail/', data, {
				headers: {
					'Content-Type': 'application/json',
				}
			}).then(response => {
				if (response.data.Case === "Email already exist") {
					setExist(true)
				} else {
					navigate('/SecondStep', { state: data });
				}
			})
				.catch(error => {
					console.error('There was an error!', error);
				});
		}
	}
	return (
		<>
			<form noValidate className={styles['signup-form-form']} onSubmit={handleNextClick}>
				<input type='email' className={styles['authentication-signup-input']} name='email' value={data.email} onChange={handleChange} maxLength={320} placeholder='Enter your email' />
				{errors.email && <span className={styles['span-messages']}>{errors.email}</span>}
				{exist && <span className={styles['span-messages']}>Email Already exist</span>}
				<input type='password' className={styles['authentication-signup-input']} value={data.password} name='password' maxLength={100} autoComplete="off" onChange={handleChange} placeholder='Enter a password' />
				{errors.password && <span className={styles['span-messages']}>{errors.password}</span>}
				<input type='password' className={styles['authentication-signup-input']} name='confirmPassword' onChange={handleChange} maxLength={100} autoComplete="off" placeholder='Confirm your password' />
				{errors.confirmPassword && <span className={styles['span-messages']}>{errors.confirmPassword}</span>}
				<button className={styles['authentication-signup-button']} type='submit' >Next</button>
			</form>
		</>
	);
}

export default SignUpForm;
