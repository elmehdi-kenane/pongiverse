import React, { useState, useEffect } from "react";
import styles from "../../assets/SignUp/WaysSecondStep.module.css";
import Header from "./Header";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import logo from '../../assets/SignUp/logo.svg'
import { useNavigate } from "react-router-dom";

import { TiWarning } from "react-icons/ti";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
const client = axios.create({
	baseURL: `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}`,
});

function WaysSecondStep() {
	const navigate = useNavigate();
	const [nextdata, setNextdata] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		avatar: null,
	});
	const [exist, setExist] = useState(false);
	const [errors, setErrors] = useState({});
	const location = useLocation();
	const data = location.state || {};

	useEffect(() => {
		if (!data.email || !data.avatar) {
			navigate("/signup");
		}
	}, [data])

	const handleInputChange = (e) => {
		e.preventDefault();
		setNextdata({ ...nextdata, [e.target.name]: e.target.value });
	};

	useEffect(() => {
		client
			.post("/auth/checkusername/", nextdata, {
				headers: {
					"Content-Type": "application/json",
				},
			})
			.then((response) => {
				if (response.data.Case === "Username already exist") {
					setExist(true);
				} else {
					setExist(false);
				}
			})
			.catch((error) => {
				console.error("There was an error!", error);
			});
	}, [nextdata]);

	useEffect(() => {
		setNextdata((prevNextdata) => ({
			...prevNextdata,
			email: data.email,
			avatar: data.avatar,
		}));
	}, [data.email, data.avatar]);

	const handleSubmit = (e) => {
		e.preventDefault();
		const validationErrors = {};
		const regex = /^(?!\d)[a-zA-Z0-9_]{4,8}$/;
		const containsSingleUnderscore = (nextdata.username.match(/_/g) || []).length <= 1;
		if (!nextdata.username.trim()) {
			validationErrors.username = "username is required"
		} else if (!regex.test(nextdata.username) || !containsSingleUnderscore || exist) {
			if (!regex.test(nextdata.username) || !containsSingleUnderscore)
				validationErrors.username = "Invalid Username"
			else
				validationErrors.username = "Username Already Used"

		}
		if (!nextdata.password.trim()) {
			validationErrors.password = "password is required";
		} else if (nextdata.password.length < 8) {
			validationErrors.password = "password should be atleast 8 characters";
		}
		if (!nextdata.confirmPassword.trim()) {
			validationErrors.confirmPassword = "Please confirm your password";
		} else if (nextdata.confirmPassword !== nextdata.password) {
			validationErrors.confirmPassword = "password not matched";
		}
		setErrors(validationErrors);
		if (Object.keys(validationErrors).length === 0) {
			const formData = new FormData();
			formData.append("username", nextdata.username);
			formData.append("email", nextdata.email);
			formData.append("password", nextdata.password);
			formData.append("is_active", true);
			formData.append("avatar", nextdata.avatar);
			client
				.post("/auth/wayssignup/", formData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				})
				.then((response) => {
					if (response.data.Case === "Sign up successfully") {
						navigate("/signin");
					}
				})
				.catch((error) => {
					console.error("There was an error!", error);
				});
		}
	};

	return (
		<div className={styles["body_page"]}>
			<div className={styles["mainPage"]}>
				<div className={styles['ways-second-step-navbar']}>
					<img src={logo} alt="" />
				</div>
				<div className={styles["bodyPage"]}>
					<div className={styles["signUpContainer"]}>
						<form
							className={styles["signUpForm"]}
							onSubmit={handleSubmit}
							noValidate
						>
							<div className={styles['unchangable-username-warning']}>
								<TiWarning color="#cccccc66" size={17} />
								<p>Username is Unchangeable</p>
							</div>
							<input
								className={styles["inputs"]}
								type="text"
								value={nextdata.username}
								name="username"
								onChange={handleInputChange}
								placeholder="enter a username"
								maxLength={10}
							/>
							{errors.username && <span>{errors.username}</span>}
							<input
								className={styles["inputs"]}
								type="password"
								name="password"
								value={nextdata.password}
								onChange={handleInputChange}
								placeholder="enter a password"
								maxLength={100}
							/>
							{errors.password && <span>{errors.password}</span>}
							<input
								className={styles["inputs"]}
								type="password"
								name="confirmPassword"
								onChange={handleInputChange}
								placeholder="confirm your password"
								maxLength={100}
							/>
							{errors.confirmPassword && <span>{errors.confirmPassword}</span>}
							{
								<button type="submit" className={styles["submitButton"]}>
									Sign Up
								</button>
							}
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

export default WaysSecondStep;
