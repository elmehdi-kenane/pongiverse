import styles from '../../assets/SignIn/ForgotPassword.module.css'
import Header from '../SignUp/Header';
import React, { useState, useEffect } from 'react';
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
const client = axios.create({
	baseURL: "http://localhost:8000",
});

function ForgotPassword() {

	const [data, setData] = useState({
		email: ''
	});
	const [errors, setErrors] = useState({})
	let attempts = 0;
	const [code, setCode] = useState(-12);
	const [inputCode, setInputCode] = useState(-140);
	const [exist, SetExist] = useState('');
	const navigate = useNavigate();
	const MySwal = withReactContent(Swal);

	const handleChange = (e) => {
		setData({ ...data, [e.target.name]: e.target.value });
	};

	const handleNextClick = (e) => {
		e.preventDefault();
		const validationErrors = {}
		if (!data.email.trim()){
			validationErrors.email = "email is required waaahmed"
		}else if(!/\S+@\S+\.\S+/.test(data.email)){
			validationErrors.email = "email is not valid"
		}
		setErrors(validationErrors)
		if (Object.keys(validationErrors).length === 0)
		{
			client.post('/auth/checkemail/', data, {
				headers: {
					'Content-Type': 'application/json',
				}
			}).then(response => {
				if (response.data.Case === "Email already exist") {
					client.post('/auth/ForgetPassword/', data, {
						headers: {
							'Content-Type': 'application/json',
						}
					}).then(response => {
						setCode(response.data.Number);
						return response.data.Number;
					}).then(code => {
						MySwal.fire({
							title: 'Type the Code',
							width: '400px',
							input: 'text',
							inputPlaceholder: 'Type The Code ...',
							showCancelButton: true,
							cancelButtonColor: '#913DCE',
							allowOutsideClick: false,
							confirmButtonText: 'Submit',
							confirmButtonColor: '#913DCE',
							customClass: {
								popup: styles['popup-style'],
								container: styles['blur-background'] ,
								input: styles['custom-input'],
								title : styles['popup-title-style']
							},
						}).then((result) => {
							if (result.isConfirmed) {
								const inputCode = result.value;
								setInputCode(inputCode);
								return inputCode;
							} else if (result.dismiss === MySwal.DismissReason.cancel) {
								attempts = 3;
							}
						}).then(inputCode => {
							handleFormSubmit(inputCode, code);
						});
					}).catch(error => {
						console.error('There was an error!', error);
					});
				} else {
					SetExist("No User with this email");
				}
			}).catch(error => {
				console.error('There was an error!', error);
			});
		}


		const handleFormSubmit = (inputCode, code) => {
			if (code == inputCode) {
				navigate('/changePassword', { state: data });
			}
			else {
				if (attempts < 2) {
					attempts++;
					MySwal.fire({
						title: 'Enter the Code',
						width: '400px',
						input: 'text',
						inputPlaceholder: 'Type the Code',
						html: '<span><b>Wrong Code!</b></span>',
						showCancelButton: true,
						cancelButtonColor: '#913DCE',
						allowOutsideClick: false,
						confirmButtonText: 'Submit',
						confirmButtonColor: '#913DCE',
						customClass: {
							container: styles['blur-background'] ,
							input: styles['custom-input'],
						},
					}).then((result) => {
						if (result.isConfirmed) {
							const inputCode = result.value;
							setInputCode(inputCode);
							return inputCode;
						} else if (result.dismiss === MySwal.DismissReason.cancel) {
							attempts = 3;
						}
					}).then(inputCode => {
						handleFormSubmit(inputCode, code);
					});
				}
			}
		};
	};

	return (
		<div className={styles["full_page"]}>
				<div className={styles["body_page"]}>
					<div className={styles["mainPage"]}>
						<Header />
						<div className={styles["bodyPage"]}>
							<div className={styles["signUpContainer"]}>
								<h1 className={styles["title"]}>Forgot your password?</h1>
								<h3 className={styles["h3_title"]}>Enter the email address associated with your account, and we'll send you a code to reset your password.</h3>
								<form className={styles["signUpForm"]} onSubmit={handleNextClick} noValidate>
									<input className={styles["inputs"]} type="email" name='email' value={data.email} onChange={handleChange} placeholder="enter your email" />
									{errors.email && <span>{errors.email}</span>}
									{exist && <span>{exist}</span>}
									<button type="submit" className={styles["submitButton"]}>Send Reset Code</button>
									<button className={styles["CancelButton"]}>Go Back</button>
								</form>
							</div>
						</div>
					</div>
				</div>
		</div>
	);
}

export default ForgotPassword;