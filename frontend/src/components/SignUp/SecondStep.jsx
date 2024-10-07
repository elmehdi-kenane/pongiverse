import styles from "../../assets/SignUp/SecondStep.module.css";
import Header from "./Header";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/SignUp/logo.svg";
import { useNavigate } from "react-router-dom";
import imagePlaceholder from "../../assets/SignUp/imagePlaceholder.svg";
import Resizer from "react-image-file-resizer";
import toast, { Toaster } from "react-hot-toast";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
const client = axios.create({
	baseURL: `http://${import.meta.env.VITE_IPADDRESS}:8000`,
});

function SecondStep() {
	const navigate = useNavigate();
	const [nextdata, setNextdata] = useState({
		username: "",
		email: "",
		password: "",
		avatar: null,
	});

	const [errors, setErrors] = useState({});
	const location = useLocation();
	const data = location.state || {};
	if (!data.email || !data.password) {
		navigate("/signup");
	}
	const [exist, setExist] = useState(false);

	const validateImageDimensions = (file) => {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const img = new Image();
				img.src = e.target.result;
				img.onload = () => {
					if (img.width < 400 || img.height < 400) {
						resolve(false); // Invalid dimensions
					} else {
						resolve(true);  // Valid dimensions
					}
				};
			};
			reader.readAsDataURL(file);
		});
	};

	const handleInputChange = async (e) => {
		e.preventDefault();
		if (e.target.name === "avatar") {
			const file = e.target.files[0];
			if (file) {
				const isValid = await validateImageDimensions(file);
				if (file.size > 1048576 || !isValid) {
					if (file.size > 1048576)
						alert("Image size should be less than 1 MB.");
					if (!isValid)
						alert("Image dimensions should be at least 500x500 pixels.");
				}
				else {
					setNextdata((prevData) => ({ ...prevData, avatar: file || null }));
				}
			}
		} else {
			setNextdata({ ...nextdata, [e.target.name]: e.target.value });
		}
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

	useEffect(
		() =>
			setNextdata((prevNextdata) => ({
				...prevNextdata,
				email: data.email,
				password: data.password,
			})),
		[data.email, data.password]
	);

	const notifyError = (message) =>
		toast.error(message, {
			position: "top-center",
			duration: 6000,
		});

	const handleSubmit = (e) => {
		e.preventDefault();
		const validationErrors = {};
		const regex = /^(?!\d)[a-zA-Z0-9_]{4,10}$/;
		const containsSingleUnderscore = (nextdata.username.match(/_/g) || []).length <= 1;
		if (!nextdata.username.trim()) {
			validationErrors.username = "username is required";
		} else if (!regex.test(nextdata.username) || !containsSingleUnderscore) {
			validationErrors.username = "username must be satisfies : 4-10 characters long, only letters, digits, at most one underscore, not start with digit.";
		}
		console.log("validationErrors :", Object.keys(validationErrors).length);
		setErrors(validationErrors);
		if (Object.keys(validationErrors).length === 0) {
			const formData = new FormData();
			formData.append("username", nextdata.username);
			formData.append("email", nextdata.email);
			formData.append("password", nextdata.password);
			formData.append("avatar", nextdata.avatar);
			formData.append("is_active", true);
			client
				.post("/auth/signup/", formData, {
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
		} else if (errors.username) {
			notifyError(errors.username);
		}
	};
	const getAvatarUrl = (file) => {
		return file ? URL.createObjectURL(file) : null;
	};

	return (
		<div className={styles["second-step-page"]}>
			<div className={styles["second-step-navbar"]}>
				<img src={logo} alt="" />
			</div>
			<div className={styles["second-step-form-div"]}>
				<div className={styles["second-step-form"]}>
					<div className={styles["second-step-form-inputs"]}>
						<input
							type="text"
							value={nextdata.username}
							name="username"
							className={styles["second-step-form-inputs-input"]}
							onChange={handleInputChange}
							placeholder="Enter a username"
						/>
						{exist && (
							<span className={styles["spans"]}>Username already used</span>
						)}
						<div className={styles["second-step-form-inputs-image-input"]}>
							<input
								type="file"
								name="avatar"
								id="image-upload"
								className={styles["second-step-form-inputs-image"]}
								accept="image/*"
								onChange={handleInputChange}
							/>
							<label
								className={styles["second-step-form-inputs-image-label"]}
								htmlFor="image-upload"
							>
								Upload your image (Optional)
							</label>
							<div className={styles["second-step-form-display-image"]}>
								{!nextdata.avatar ? (
									<img
										src={imagePlaceholder}
										className={styles["second-step-form-image-default"]}
										alt=""
									/>
								) : (
									<img
										className={styles["second-step-form-image-default"]}
										src={getAvatarUrl(nextdata.avatar)}
										alt=""
									/>
								)}
							</div>
						</div>
					</div>
					<button
						className={styles["second-step-form-button"]}
						onClick={handleSubmit}
					>
						Sign Up
					</button>
				</div>
			</div>
		</div>
	);
}

export default SecondStep;

