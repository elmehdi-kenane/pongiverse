import React, { useState, useEffect } from "react";
import styles from "../../assets/SignUp/WaysSecondStep.module.css";
import Header from "./Header";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
const client = axios.create({
	baseURL: "http://10.13.9.12:8000",
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
		console.log(data.avatar);
		setNextdata((prevNextdata) => ({
			...prevNextdata,
			email: data.email,
			avatar: data.avatar,
		}));
	}, [data.email, data.avatar]);

	const handleSubmit = (e) => {
		e.preventDefault();
		const validationErrors = {};
		if (!nextdata.username.trim()) {
			validationErrors.username = "username is required";
		} else if (nextdata.username.length > 10){
			validationErrors.username = "username is too long";
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
				<Header />
				<div className={styles["bodyPage"]}>
					<div className={styles["signUpContainer"]}>
						<h1 className={styles["title"]}>Next Step</h1>
						<form
							className={styles["signUpForm"]}
							onSubmit={handleSubmit}
							noValidate
						>
							<input
								className={styles["inputs"]}
								type="text"
								value={nextdata.username}
								name="username"
								onChange={handleInputChange}
								placeholder="enter a username"
							/>
							{errors.username && <span>{errors.username}</span>}
							{exist && <span>Username already used</span>}
							<input
								className={styles["inputs"]}
								type="password"
								name="password"
								value={nextdata.password}
								onChange={handleInputChange}
								placeholder="enter a password"
							/>
							{errors.password && <span>{errors.password}</span>}
							<input
								className={styles["inputs"]}
								type="password"
								name="confirmPassword"
								onChange={handleInputChange}
								placeholder="confirm your password"
							/>
							{errors.confirmPassword && <span>{errors.confirmPassword}</span>}
							<button type="submit" className={styles["submitButton"]}>
								Sign Up
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}

export default WaysSecondStep;
