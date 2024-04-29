import React, { useState } from 'react';
import styles from '../../assets/SignUp/SignUpPage.module.css'
import  { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
const client = axios.create({
	baseURL: "http://127.0.0.1:8000",
	});

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
		fetch('http://127.0.0.1:8000/login/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
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
					Cookies.set('token', data.data.access, { expires: 7, secure: true });
					navigate('/home');
				} else if (data.Case === "Invalid username or password!!") {
					alert(data.Case);
				}
			})
			.catch(error => {
				console.error('There was an error!', error);
			});
	};

	return (
		<>
			<input className={styles["inputs"]} value={data.username} onChange={handleChange} type="text" name='username' placeholder="enter your username" />
			<input className={styles["inputs"]} type="password" name='password' value={data.password} onChange={handleChange} placeholder="enter your password" />
			<Link className={styles["forget"]}  to="/ForgotPassword">Forget your password?</Link>
			<button className={styles["submitButton"]} onClick={handleSubmit}>Next</button>
		</>
  );
}

export default SignInForm;