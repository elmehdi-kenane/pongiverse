import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import './signinexample.css'

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
						duration: 1000,
					});
					setData({ ...data, 'password': '' });
				}
			})
			.catch(error => {
				console.error('There was an error!', error);
			});
	};

	return (
		<>
			<Toaster
				// position="top-right"
				reverseOrder={false}
			/>
			<input className='authentication-signin-input' type="text" value={data.username} onChange={handleChange} name='username' placeholder='Enter your username' />
			<input className='authentication-signin-input' type="password" name='password' value={data.password} onChange={handleChange} placeholder='Enter your password' />
			<div className='authentication-signin-forget-password-div'>
				<Link className='authentication-signin-forget-password' to="/ForgotPassword">Forget your password?</Link>
			</div>
			<button className='authentication-signin-button' onClick={handleSubmit}>Sign In</button>
		</>
	);
}

export default SignInForm;