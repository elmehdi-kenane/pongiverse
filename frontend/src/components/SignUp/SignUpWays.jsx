import React from 'react';
import logo42 from '../../assets/SignUp/42_logo.svg'
import googleIcon from '../../assets/SignUp/googleIcon.png'
import styles from '../../assets/SignUp/SignUpPage.module.css'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
const client = axios.create({
  baseURL: "http://localhost:8000",
});

function SignUpWays(props) {
	const navigate = useNavigate();
	const MySwal = withReactContent(Swal);
	const CLIENT_ID = 'u-s4t2ud-fdda8b756dc2c51a3af969273a6645675c0e962bac731ee65461f6d49cae3ae0';
	const REDIRECT_URI = 'http://localhost:3000/signUp';
	const handleLogin = () => {
		window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
	};

	const fetchAccessToken =  (code) => {
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
			client.post('/auth/checkemail/', user_data, {
				headers: {
					'Content-Type': 'application/json',
				}
			}).then(response => {
				if (response.data.Case === "Email already exist"){
					Swal.fire({
						text: 'Email already used',
						icon: 'error',
					});
				}else{
				const collect = {
					email: user_data.email,
					avatar: user_data.image.link,
				};
				navigate('/WaysSecondStep', { state: collect });
				}
			})
			.catch(error => {
				console.error('There was an error!', error);
			});
			console.log('User Data:', response.data.image.link);
		}).catch(error => {
			console.error('Error fetching user data:', error);
		});
	};

	React.useEffect(() => {
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
			avatar: decoded.picture,
		};
		client.post('/auth/checkemail/', data, {
			headers: {
				'Content-Type': 'application/json',
			}
		}).then(response => {
			if (response.data.Case === "Email already exist"){
				Swal.fire({
					text: 'Email already used',
					icon: 'error',
				});
			}else{
			  navigate('/WaysSecondStep', { state: data });
			}
		})
		.catch(error => {
			console.error('There was an error!', error);
		});
	};

	const handleError = () => {
		console.log('Google login failed');
	};

	return (
		<>
			<div className={styles["Intra"]}>
				<img className={styles["intraLogo"]} src={logo42} alt=""/>
				<button className={styles["IntraButton"]} onClick={handleLogin}>{props.IntraTitle}</button>
			</div>
			<div className={styles["Google"]}>
				<GoogleOAuthProvider clientId="295320971655-s5ood5a528rk815h85f2pancufc342of.apps.googleusercontent.com">
					<GoogleLogin
				onSuccess={handleSuccess}
				onError={handleError}
				/>
				</GoogleOAuthProvider>
				{/* <img className={styles["googleLogo"]} src={googleIcon} alt=""/>
				<button className={styles["GoogleButton"]}>{props.GoogleTitle}</button> */}
			</div>
		</>
	);
}

export default SignUpWays;