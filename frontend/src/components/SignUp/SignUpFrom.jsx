import React, { useState } from 'react';
import styles from '../../assets/SignUp/SignUpPage.module.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
const client = axios.create({
	baseURL: "http://localhost:8000",
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
		} else if (!/\S+@\S+\.\S+/.test(data.email)) {
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
			<input className={styles["inputs"]} type="email" name='email' value={data.email} placeholder="enter your email" onChange={handleChange} />
			{errors.email && <span>{errors.email}</span>}
			{exist && <span>Email Already exist</span>}
			<input className={styles["inputs"]} type="password" value={data.password} name='password' placeholder="enter your password" onChange={handleChange} />
			{errors.password && <span>{errors.password}</span>}
			<input className={styles["inputs"]} type="password" name='confirmPassword' placeholder="confirm your password" onChange={handleChange} />
			{errors.confirmPassword && <span>{errors.confirmPassword}</span>}
			<button onClick={handleNextClick} className={styles["submitButton"]}>Next</button>
		</>
	);
}

export default SignUpForm;