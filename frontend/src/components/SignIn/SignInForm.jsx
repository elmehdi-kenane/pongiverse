import React, { useState } from 'react';
import styles from '../../assets/SignUp/SignUpPage.module.css'
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';

function SignInForm() {

	const [data, setData] = useState({
		username: '',
		password: ''
	});

	const handleChange = (e) => {
		setData({ ...data, [e.target.name]: e.target.value });
	};
	const navigate = useNavigate();

	const handleSubmit = (e) => {
		e.preventDefault();
		fetch('http://localhost:8000/auth/login/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(data),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				if (data.Case === "Login successfully") {
					navigate('/mainpage');
				} else if (data.Case === "Invalid username or password!!") {
					toast.error(data.Case, {
						duration: 4000,
						className: styles['center-toast'] // Apply custom class
					  });
				}
			})
			.catch(error => {
				console.error('There was an error!', error);
			});
	};

	return (
		<>
			<Toaster
				position="top-center"
				reverseOrder={false}
			/>
			<input className={styles["inputs"]} value={data.username} onChange={handleChange} type="text" name='username' placeholder="enter your username" />
			<input className={styles["inputs"]} type="password" name='password' value={data.password} onChange={handleChange} placeholder="enter your password" />
			<Link className={styles["forget"]} to="/ForgotPassword">Forget your password?</Link>
			<button className={styles["submitButton"]} onClick={handleSubmit}>Sign In</button>
		</>
	);
}

export default SignInForm;