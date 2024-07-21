import styles from '../../assets/SignUp/SecondStep.module.css'
import Header from './Header';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import imagePlaceholder from '../../assets/SignUp/imagePlaceholder.svg'
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
<<<<<<< HEAD
	const [exist, setExist] = useState(false);		
=======
	if (!data.email || !data.password) {
		navigate("/signup");
	}
	const [exist, setExist] = useState(false);
>>>>>>> d9244a1f3aad9aa9c9c1376e7371c70df57218cc
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


	const handleSubmit = (e) => {
		e.preventDefault();
		const validationErrors = {}
		if (!nextdata.username.trim()) {
			validationErrors.username = "username is required"
<<<<<<< HEAD
		} else if (nextdata.username.length > 10)
		{
			validationErrors.username = "username is too long"
		}
=======
		} else if (nextdata.username.length > 10) {
			validationErrors.username = "username is too long"
		}
		// if (nextdata.avatar) {
		// 	const img = new Image();
		// 	img.src = getAvatarUrl(nextdata.avatar);
		// 	img.onload = () => {
		// 		if (img.width < 100 || img.width > 500 || img.height < 100 || img.height > 500) {
		// 			console.log("hmedddddd")
		// 			validationErrors.avatar = "avatar dimesions is required"
		// 			console.log("validate lengh : ", Object.keys(validationErrors).length)
		// 		}
		// 	}
		// }
>>>>>>> d9244a1f3aad9aa9c9c1376e7371c70df57218cc
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
<<<<<<< HEAD
				}
			}).then(response => {
					if (response.data.Case === "Sign up successfully"){
						navigate('/signin');
					}
				})
=======
				}
			}).then(response => {
				if (response.data.Case === "Sign up successfully") {
					navigate('/signin');
				}
			})
>>>>>>> d9244a1f3aad9aa9c9c1376e7371c70df57218cc
				.catch(error => {
					console.error('There was an error!', error);
				});
		}
<<<<<<< HEAD
	};
	return (
		<div className={styles["body_page"]}>
			<div className={styles["mainPage"]}>
				<Header/>
				<div className={styles["SecondStepContainer"]}>
						<div className={styles["signUpContainer"]}>
						<h1 className={styles["title"]}>Next Step</h1>
						<form className={styles["signUpForm"]} onSubmit={handleSubmit} noValidate>
							<input className={styles["inputs"]} type="text" name='username' value={nextdata.username} onChange={handleInputChange} placeholder="enter a username" />
							{exist && <span>Username already used</span>}
							{errors.username && <span>{errors.username}</span>}
							<input type="file" name="avatar" id="image-upload" accept="image/*" onChange={handleInputChange} className={styles["image-upload"]} />
							<label htmlFor="image-upload">Choose a file</label>
							<button type="submit" className={styles["submitButton"]}>Sign Up</button>
						</form>
						</div>
=======
	}
		const getAvatarUrl = (file) => {
			return file ? URL.createObjectURL(file) : null;
		};

		return (
			<div className={styles["body_page"]}>
				<div className={styles["mainPage"]}>
					<Header />
					<div className={styles["SecondStepContainer"]}>
						<div className={styles["signUpContainer"]}>
							<h1 className={styles["title"]}>Next Step</h1>
							<form className={styles["signUpForm"]} onSubmit={handleSubmit} noValidate>
								<input className={styles["inputs"]} type="text" name='username' value={nextdata.username} onChange={handleInputChange} placeholder="enter a username" />
								{exist && <span className={styles["spans"]}>Username already used</span>}
								{errors.username && <span className={styles["spans"]}>{errors.username}</span>}
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
									{errors.avatar && <span className={styles["spans"]}>{errors.avatar}</span>}
								</div>
								<button type="submit" className={styles["submitButton"]}>Sign Up</button>
							</form>
						</div>
					</div>
>>>>>>> d9244a1f3aad9aa9c9c1376e7371c70df57218cc
				</div>
			</div>
		);
	}

	export default SecondStep;
