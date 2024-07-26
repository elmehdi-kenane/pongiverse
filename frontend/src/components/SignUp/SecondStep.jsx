import styles from '../../assets/SignUp/SecondStep.module.css'
import Header from './Header';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import imagePlaceholder from '../../assets/SignUp/imagePlaceholder.svg'
import toast, { Toaster } from 'react-hot-toast';
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
const client = axios.create({
	baseURL: "http://localhost:8000",
});

function SecondStep() {
	const navigate = useNavigate();
	const [nextdata, setNextdata] = useState({
		username: '',
		email: '',
		password: '',
		avatar: null
	});

	const [errors, setErrors] = useState({})
	const location = useLocation();
	const data = location.state || {};
	if (!data.email || !data.password) {
		navigate("/signup");
	}
	const [exist, setExist] = useState(false);
	const handleInputChange = (e) => {
		e.preventDefault();
		if (e.target.name === 'avatar') {
			const file = e.target.files[0];
			if (file)
				setNextdata((prevData) => ({ ...prevData, avatar: file || null }));
		} else {
			setNextdata({ ...nextdata, [e.target.name]: e.target.value });
		}
	};

	useEffect(() => {
		client.post('/auth/checkusername/', nextdata, {
			headers: {
				'Content-Type': 'application/json',
			}
		}).then(response => {
			if (response.data.Case === "Username already exist") {
				setExist(true);
			}
			else {
				setExist(false);
			}
		})
			.catch(error => {
				console.error('There was an error!', error);
			});
	}, [nextdata])

	useEffect(() => setNextdata(prevNextdata => ({
		...prevNextdata,
		email: data.email,
		password: data.password
	})), [data.email, data.password]);

	const notifyError = (message) => toast.error(message, {
		position: 'top-center',
		duration: 6000,
	});



	const handleSubmit = (e) => {
		e.preventDefault();
		const validationErrors = {}
		const regex = /^(?!\d)[a-zA-Z0-9_]{4,10}$/;
		const containsSingleUnderscore = (nextdata.username.match(/_/g) || []).length <= 1;
		if (!nextdata.username.trim()) {
			validationErrors.username = "username is required"
		} else if (!regex.test(nextdata.username) || !containsSingleUnderscore) {
			validationErrors.username = "username must be satisfies : 4-10 characters long, only letters, digits, at most one underscore, not start with digit."
		}
		setErrors(validationErrors)
		if (Object.keys(validationErrors).length === 0) {
			const formData = new FormData();
			formData.append('username', nextdata.username);
			formData.append('email', nextdata.email);
			formData.append('password', nextdata.password);
			formData.append('avatar', nextdata.avatar);
			formData.append('is_active', true);
			client.post('/auth/signup/', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				}
			}).then(response => {
				if (response.data.Case === "Sign up successfully") {
					navigate('/signin');
				}
			})
				.catch(error => {
					console.error('There was an error!', error);
				});
		}
		else if (errors.username){
			notifyError(errors.username)
		}
	}
	const getAvatarUrl = (file) => {
		return file ? URL.createObjectURL(file) : null;
	};

	return (
		<div className={styles["body_page"]}>
			<Toaster
				position="top-right"
				reverseOrder={false}
			/>
			<div className={styles["mainPage"]}>
				<Header />
				<div className={styles["SecondStepContainer"]}>
					<div className={styles["signUpContainer"]}>
						<h1 className={styles["title"]}>Next Step</h1>
						<form className={styles["signUpForm"]} onSubmit={handleSubmit} noValidate>
							<input className={styles["inputs"]} type="text" name='username' value={nextdata.username} onChange={handleInputChange} placeholder="enter a username" />
							{exist && <span className={styles["spans"]}>Username already used</span>}
							<div className={styles["imageField"]}>
								<input type="file" name="avatar" id="image-upload" accept="image/*" onChange={handleInputChange} className={styles["image-upload"]} />
								<label htmlFor="image-upload" className={styles["image-label"]} >Choose a file</label>
								<div className={styles["display-image"]}>
									{
										!nextdata.avatar ? <img src={imagePlaceholder} alt="" /> : <img src={getAvatarUrl(nextdata.avatar)} alt="" />
									}
								</div>
							</div>
							<div className={styles["image-spans"]}>
								<span className={styles["optional"]}>(optional)</span>
							</div>
							<button type="submit" className={styles["submitButton"]}>Sign Up</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SecondStep;
