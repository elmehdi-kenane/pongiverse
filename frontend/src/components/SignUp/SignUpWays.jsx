import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from '../../assets/SignIn/authentication.module.css'
import logo42 from '../../assets/SignUp/42_logo.svg'
import logoGoogle from '../../assets/SignIn/GoogleIcon.svg'
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';


function SignUpWays() {
	const [googleAuthUrl, setGoogleAuthUrl] = useState('')
	const [intraAuthUrl, setIntraAuthUrl] = useState('')
	const [googleCode, setGoogleCode] = useState('')
	const [intraCode, setIntraCode] = useState('')
	const navigate = useNavigate()

	useEffect(() => {
		const getQueryParam = (name) => {
			const urlParams = new URLSearchParams(window.location.search);
			return urlParams.get(name);
		};
		const extracted_code = getQueryParam('code');
		const fullUrl = window.location.href;
		if (extracted_code && fullUrl && fullUrl.includes("email"))
			setGoogleCode(extracted_code)
		else if (extracted_code) {
			setIntraCode(extracted_code)
		}
	}, [])

	const verify_email = async (email, picture) => {
		const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/auth/checkemail/`, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({
				email: email
			})
		});
		if (response.ok) {
			const data = await response.json();
			if (data.Case === "Email already exist") {
				toast.error("Email already used", { duration: 2000, });
			} else if (data.Case === "Email does not exist") {
				const userData = {
					email: email,
					avatar: picture,
				};
				navigate('/WaysSecondStep', { state: userData });
			}
		} else {
			navigate('/signin')
		}
	}

	useEffect(() => {
		const google_get_data = async () => {
			const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/auth/sign-up-google-login-get-token/`, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					code: googleCode
				})
			});
			if (response.ok) {
				const response_data = await response.json();
				verify_email(response_data.email, response_data.picture)
			} else {
				navigate('/signin')
			}
		}
		if (googleCode) {
			const urlWithoutCode = window.location.href.split('?')[0];
			window.history.replaceState({}, document.title, urlWithoutCode);
			google_get_data()
		}
	}, [googleCode])

	useEffect(() => {
		const intra_get_data = async () => {
			const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/auth/sign-up-intra-login-get-token/`, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					code: intraCode
				})
			});
			if (response.ok) {
				const response_data = await response.json();
				verify_email(response_data.email, response_data.picture)
			} else {
				navigate('/signin')
			}
		}
		if (intraCode) {
			const urlWithoutCode = window.location.href.split('?')[0];
			window.history.replaceState({}, document.title, urlWithoutCode);
			intra_get_data()
		}
	}, [intraCode])

	useEffect(() => {
		if (googleAuthUrl)
			window.location.href = googleAuthUrl;
		if (intraAuthUrl) {
			window.location.href = intraAuthUrl;
		}
	}, [googleAuthUrl, intraAuthUrl])

	const handleGoogleClick = () => {
		const getGoogleUrl = async () => {
			const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/auth/sign-up-google-get-url`, {
				method: "GET",
				headers: {
					'Content-Type': 'application/json',
				},
			});
			if (response.ok) {
				const data = await response.json();
				setGoogleAuthUrl(data.code);
			} else {
				navigate('/signin')
			}
		}
		getGoogleUrl()
	}
	const handleIntraClick = () => {
		const getIntraUrl = async () => {
			const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/auth/sign-up-intra-get-url/`, {
				method: "GET",
				headers: {
					'Content-Type': 'application/json',
				},
			});
			if (response.ok) {
				const data = await response.json();
				setIntraAuthUrl(data.code);
			} else {
				navigate('/signin')
			}
		}
		getIntraUrl()
	}
	return (
		<>
			<div className={styles['authentication-signup-ways']}>
				<img src={logoGoogle} onClick={handleGoogleClick} alt="" />
				<img src={logo42} onClick={handleIntraClick} alt="" />
			</div>
		</>

	);
}

export default SignUpWays



// const data = {
// 	email: decoded.email,
// 	avatar: decoded.picture,
// };