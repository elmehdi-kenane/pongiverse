import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from '../../assets/SignUp/SignUpPage.module.css'
<<<<<<< HEAD
import { GoogleOAuthProvider, useGoogleLogin, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import Cookies from 'js-cookie';
=======
import logo42 from '../../assets/SignUp/42_logo.svg'
import logoGoogle from '../../assets/SignIn/GoogleIcon.svg'
>>>>>>> d9244a1f3aad9aa9c9c1376e7371c70df57218cc
import Swal from 'sweetalert2';

function SignInWays() {
	const [googleAuthUrl, setGoogleAuthUrl] = useState('')
	const [intraAuthUrl, setIntraAuthUrl] = useState('')
	const [googleCode, setGoogleCode] = useState('')
	const [intraCode, setIntraCode] = useState('')
	const navigate = useNavigate()


<<<<<<< HEAD
	const fetchAccessToken = (code) => {
		axios.post('https://api.intra.42.fr/oauth/token', {
			grant_type: 'authorization_code',
			client_id: CLIENT_ID,
			client_secret: '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',
			code: code,
			redirect_uri: REDIRECT_URI
		}).then(response => {
			fetchUserData(response.data.access_token);
		}).catch(error => {
			console.error('Error fetching access token:', error);
		});
	};
=======
	useEffect(() => {
		const getQueryParam = (name) => {
			const urlParams = new URLSearchParams(window.location.search);
			return urlParams.get(name);
		};
		const extracted_code = getQueryParam('code');
		const fullUrl = window.location.href;
		if (extracted_code && fullUrl && fullUrl.includes("email")) {
			setGoogleCode(extracted_code)
			console.log("ewahaaa")
		}
		else if (extracted_code) {
			console.log("ewahaaa intra")
			setIntraCode(extracted_code)
		}
	}, [])
>>>>>>> d9244a1f3aad9aa9c9c1376e7371c70df57218cc

	const verify_email = async (email) => {
		console.log("the dta : ", email)
		const response = await fetch(`http://localhost:8000/auth/googleLogin/`, {
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
			console.log("ftft : ")
			if (data.Case === "Login successfully") {
				navigate('/mainpage');
			} else if (data.Case === "Invalid username or password!!") {
				Swal.fire({
					text: 'There is no account',
					icon: 'error',
				});
			}
		} else {
			console.error('Failed to fetch data');
		}
	}

	useEffect(() => {
		const google_get_data = async () => {
			const response = await fetch(`http://localhost:8000/auth/google-login-get-token/`, {
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
				verify_email(response_data.email)
			} else {
				console.error('Failed to fetch data');
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
			const response = await fetch(`http://localhost:8000/auth/intra-login-get-token/`, {
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
				verify_email(response_data.email)
			} else {
				console.error('Failed to fetch data');
			}
		}
		if (intraCode) {
			const urlWithoutCode = window.location.href.split('?')[0];
			window.history.replaceState({}, document.title, urlWithoutCode);
			intra_get_data()
		}
	}, [intraCode])

<<<<<<< HEAD

	const handleSuccess = (credentialResponse) => {
		const decoded = jwtDecode(credentialResponse.credential);
		const data = {
			email: decoded.email,
		};
		client.post('/auth/googleLogin/', data, {
			headers: {
				'Content-Type': 'application/json',
			},
			withCredentials: true
		}).then(response => {
			if (response.data.Case === "Login successfully") {
				navigate('/mainpage');
			} else if (response.data.Case === "Invalid username or password!!") {
				alert("there is no account")
=======
	useEffect(() => {
		if (googleAuthUrl)
			window.location.href = googleAuthUrl;
		if (intraAuthUrl) {
			window.location.href = intraAuthUrl;
		}
	}, [googleAuthUrl, intraAuthUrl])

	const handleGoogleClick = () => {
		const getGoogleUrl = async () => {
			const response = await fetch(`http://localhost:8000/auth/google-get-url`, {
				method: "GET",
				headers: {
					'Content-Type': 'application/json',
				},
			});
			if (response.ok) {
				const data = await response.json();
				setGoogleAuthUrl(data.code);
			} else {
				console.error('Failed to fetch data');
>>>>>>> d9244a1f3aad9aa9c9c1376e7371c70df57218cc
			}
		}
		getGoogleUrl()
	}
	const handleIntraClick = () => {
		const getIntraUrl = async () => {
			const response = await fetch(`http://localhost:8000/auth/intra-get-url`, {
				method: "GET",
				headers: {
					'Content-Type': 'application/json',
				},
			});
<<<<<<< HEAD
	};

	const handleError = () => {
		console.log('Google login failed');
	};


	function CustomGoogleButton() {

		const login = useGoogleLogin({
			onSuccess: handleSuccess,
			onError: handleError,
		  });
		return (
		<button  onClick={login}>
		Sign in with Google
		</button>
		);
		}

=======
			if (response.ok) {
				const data = await response.json();
				setIntraAuthUrl(data.code);
			} else {
				console.error('Failed to fetch data');
			}
		}
		getIntraUrl()
	}
>>>>>>> d9244a1f3aad9aa9c9c1376e7371c70df57218cc
	return (
		<>
			<div className={styles["Intra"]} onClick={handleIntraClick}>
				<img className={styles["intraLogo"]} src={logo42} alt="" />
				<button className={styles["IntraButton"]} >Sign In With Intra</button>
			</div>
<<<<<<< HEAD
			<div className={styles["Google"]}>
				<GoogleOAuthProvider clientId="295320971655-s5ood5a528rk815h85f2pancufc342of.apps.googleusercontent.com">
					<GoogleLogin
						onSuccess={handleSuccess}
						onError={handleError}
					/>
					{/* <CustomGoogleButton /> */}
				</GoogleOAuthProvider>
=======
			<div className={styles["Google"]} onClick={handleGoogleClick}>
				<img className={styles["googleLogo"]} src={logoGoogle} alt="" />
				<button className={styles["GoogleButton"]}>Sign In with google</button>
>>>>>>> d9244a1f3aad9aa9c9c1376e7371c70df57218cc
			</div>
		</>

	);
}

export default SignInWays