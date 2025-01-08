import styles from "../../assets/SignUp/SecondStep.module.css";
import Header from "./Header";
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/SignUp/logo.svg";
import { useNavigate } from "react-router-dom";
import imagePlaceholder from "../../assets/SignUp/imagePlaceholder.svg";
import Resizer from "react-image-file-resizer";
import toast, { Toaster } from "react-hot-toast";
import AvatarEditor from "react-avatar-editor";
import { TiWarning } from "react-icons/ti";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
import { ImCross } from "react-icons/im";
const client = axios.create({
	baseURL: `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}`,
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

	useEffect(() => {
		if (!data.email || !data.password) {
			navigate("/signup");
		}
	}, [data])

	const [exist, setExist] = useState(false);
	const [image, setImage] = useState(null);
	const [displayEditImage, setDisplayEditImage] = useState(false);
	const [scale, setScale] = useState(1);
	const [editorSize, setEditorSize] = useState({ width: 300, height: 300 });
	const editorRef = useRef(null);
	const containerRef = useRef(null);
	const [imagePreview, setImagePreview] = useState(null);


	const updateEditorSize = () => {
		if (containerRef.current) {
			const containerWidth = containerRef.current.offsetWidth;
			////console.log("containerWidth :", containerWidth);
			setEditorSize({
				width: Math.min(containerWidth * 0.8, 400), // 80% of the container width
				height: Math.min(containerWidth * 0.8, 400), // Keep it square
			});
		}
	};

	useEffect(() => {
		updateEditorSize(); // Set initial size
		window.addEventListener("resize", updateEditorSize); // Update on window resize

		return () => {
			window.removeEventListener("resize", updateEditorSize);
		};
	}, []);

	const updateImagePreview = () => {
		if (editorRef.current) {
			const canvas = editorRef.current.getImageScaledToCanvas(); // Get the canvas
			const dataUrl = canvas.toDataURL(); // Convert the canvas to a data URL
			setImagePreview(dataUrl); // Set the image preview state
		}
	};

	useEffect(() => {
		if (image)
			updateImagePreview();
	}, [image, scale]);

	const handleSave = () => {
		if (editorRef.current && image) {
			editorRef.current.getImageScaledToCanvas().toBlob((blob) => {
				if (blob) {
					const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
					setNextdata((prevData) => ({ ...prevData, avatar: file || null }));
					setDisplayEditImage(false);
				}
			}, "image/jpeg");
		}
	};

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

	const notifySuc = (suc) => toast.success(suc);
    const notifyErr = (err) => toast.error(err);

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
			if (file.size > 3 * 1024 * 1024) {
				notifyErr('File size must be less than 3MB.');
				setImage(null);
				setImagePreview(null);
				return;
			}
			setImage(URL.createObjectURL(file));
		} else if (!file) {
			return;
		} else {
			notifyErr('Please select a JPEG or PNG file.');
			setImage(null);
			setImagePreview(null);
		}
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

	const check_username = async (nextdata) => {
		try {
			const response = await client.post("/auth/checkusername/", nextdata, {
				headers: {
					"Content-Type": "application/json",
				},
			});
			if (response.data.Case === "Username already exist") {
				return true; // Indicate the username already exists
			} else {
				return false; // Indicate the username does not exist
			}
		} catch (error) {
			console.error("There was an error!", error);
			return null; // Indicate an error occurred
		}
	};



	useEffect(
		() =>
			setNextdata((prevNextdata) => ({
				...prevNextdata,
				email: data.email,
				password: data.password,
			})),
		[data.email, data.password]
	);


	const handleSubmit = async (e) => {
		e.preventDefault();
		const validationErrors = {};
		const checkusername = await check_username(nextdata)
		////console.log("CHECK USERNAME:", checkusername)
		const regex = /^(?!\d)[a-zA-Z0-9_]{4,8}$/;
		const containsSingleUnderscore = (nextdata.username.match(/_/g) || []).length <= 1;
		if (!nextdata.username.trim())
			validationErrors.username = "username is required";
		else if (exist === true)
			validationErrors.username = "username already exist";
		else if (!regex.test(nextdata.username) || !containsSingleUnderscore)
			validationErrors.username = "username must be satisfies : 4-8 characters long, only letters, digits, at most one underscore, not start with digit.";
		else if (checkusername === true)
			validationErrors.username = "Username already used";
		setErrors(validationErrors);
		////console.log("validate error lenght :", Object.keys(validationErrors).length)
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
		}
	};

	useEffect(() => {
		////console.log("IMAGE:", image)
	}, [image])

	return (
		<div className={styles["second-step-page"]}>
			<Toaster />
			<div className={styles["second-step-navbar"]}>
				<img src={logo} alt="" />
			</div>
			<div className={styles["second-step-form-div"]}>
				{
					displayEditImage &&
					<div className={styles["second-step-edit-image"]} ref={containerRef}>
						<ImCross color="white" className={styles["cros-inside-edit-image"]} onClick={() => { setDisplayEditImage(false); setImage(null); setImagePreview(null) }} />
						<div className={styles["second-step-image-preview"]}>
							{
								imagePreview && <img src={imagePreview} alt="" />
							}
						</div>
						<div className={styles["second-step-avatar-viewer"]}>
							<AvatarEditor
								ref={editorRef}
								image={image}
								width={editorSize.width}
								height={editorSize.height}
								border={10}
								color={[255, 255, 255, 0.2]} // RGBA color for border
								scale={scale}
								rotate={0}
								onImageChange={image ? updateImagePreview : undefined}
							/>
						</div>
						<div className={styles["second-step-avatar-scale"]}>
							<input
								type="range"
								value={scale}
								onChange={(e) => setScale(parseFloat(e.target.value))}
								min="1"
								max="3"
								step="0.01"
							/>
						</div>
						<div className={styles["second-step-avatar-button-and-input"]}>
							<input
								type="file"
								name="avatar"
								id="image-upload"
								className={styles["second-step-form-inputs-image"]}
								accept="image/*"
								onChange={handleFileChange}
							/>
							<label
								className={styles["second-step-form-inputs-image-label"]}
								htmlFor="image-upload"
							>
								Upload
							</label>
							<button className={styles["second-step-form-inputs-image-label"]} onClick={handleSave}>Save Avatar</button>
						</div>
					</div>
				}
				<div className={styles["second-step-form"]}>
					<div className={styles['unchangable-username-warning']}>
						<TiWarning color="#cccccc66" size={17} />
						<p>Username is Unchangeable</p>
					</div>
					<div className={styles["second-step-form-inputs"]}>
						<div className={styles["second-step-form-inputs-input-div"]}>
							<input
								type="text"
								value={nextdata.username}
								name="username"
								className={styles["second-step-form-inputs-input"]}
								onChange={handleInputChange}
								placeholder="Enter a username"
								maxLength={10}
							/>
						</div>
						<div className={styles["second-step-select-image-button-div"]}>
							<button className={styles["second-step-select-image-button"]} onClick={() => { setDisplayEditImage(true) }}>select image</button>
						</div>
					</div>
					{errors.username && (
						<div className={styles["spans-div"]}>
							<span className={styles["spans"]}>{errors.username}</span>
						</div>
					)}
					<button className={styles["second-step-form-button"]} onClick={handleSubmit}>Sign Up </button>
				</div>
			</div>
		</div>
	);
}

export default SecondStep;

