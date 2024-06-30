import React from 'react';
import logo42 from '../../assets/SignUp/42_logo.svg'
import { useEffect } from 'react';
import googleIcon from '../../assets/SignUp/googleIcon.png'
import styles from '../../assets/SignUp/SignUpPage.module.css'
import { GoogleOAuthProvider, useGoogleLogin, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';

import { useNavigate } from 'react-router-dom';
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
const client = axios.create({
	baseURL: "http://localhost:8000",
});

function SignInWays() {

	const navigate = useNavigate();
	const CLIENT_ID = 'u-s4t2ud-6b8170511374b774e9fd9a7f9074a092f0f154051627b71f1deca43eb732373e';
	const REDIRECT_URI = 'http://localhost:3000/signin';
	const handleLogin = () => {
		window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
	};

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

	const fetchUserData = (accessToken) => {
		axios.get('https://api.intra.42.fr/v2/me', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			}
		}).then(response => {
			const user_data = response.data
			client.post('/auth/googleLogin/', user_data, {
				headers: {
					'Content-Type': 'application/json',
				},
				withCredentials: true
			}).then(response => {
				if (response.data.Case === "Login successfully") {
					navigate('/mainpage');
				} else if (response.data.Case === "Invalid username or password!!") {
					Swal.fire({
						text: 'No account exist with this email',
						icon: 'error',
					});
				}
			})
				.catch(error => {
					console.error('There was an error!', error);
				});
		}).catch(error => {
			console.error('Error fetching user data:', error);
		});
	};

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');

		if (code) {
			fetchAccessToken(code);
			const urlWithoutCode = window.location.href.split('?')[0];
			window.history.replaceState({}, document.title, urlWithoutCode);
		}
	}, []);


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
			}
		})
			.catch(error => {
				console.error('There was an error!', error);
			});
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

	return (
		<>
			<div className={styles["Intra"]}>
				<img className={styles["intraLogo"]} src={logo42} alt="" />
				<button className={styles["IntraButton"]} onClick={handleLogin} >Sign In With Intra</button>
			</div>
			<div className={styles["Google"]}>
				<GoogleOAuthProvider clientId="295320971655-s5ood5a528rk815h85f2pancufc342of.apps.googleusercontent.com">
					{/* <GoogleLogin
						onSuccess={handleSuccess}
						onError={handleError}
					/> */}
					<CustomGoogleButton />
				</GoogleOAuthProvider>
			</div>
		</>
	);
}

export default SignInWays;