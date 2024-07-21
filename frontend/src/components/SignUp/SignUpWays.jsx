import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from '../../assets/SignUp/SignUpPage.module.css'
import logo42 from '../../assets/SignUp/42_logo.svg'
import logoGoogle from '../../assets/SignIn/GoogleIcon.svg'
import Swal from 'sweetalert2';


<<<<<<< HEAD
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
=======
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

	const verify_email = async (email, picture) => {
		console.log("the dta : ", email)
		const response = await fetch(`http://localhost:8000/auth/checkemail/`, {
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
				Swal.fire({
					text: 'Email already used',
					icon: 'error',
				});
			} else if (data.Case === "Email does not exist") {
				const userData = {
					email: email,
					avatar: picture,
				};
				navigate('/WaysSecondStep', { state: userData });
			}
		} else {
			console.error('Failed to fetch data');
		}
	}

	useEffect(() => {
		const google_get_data = async () => {
			const response = await fetch(`http://localhost:8000/auth/sign-up-google-login-get-token/`, {
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
			const response = await fetch(`http://localhost:8000/auth/sign-up-intra-login-get-token/`, {
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
				console.error('Failed to fetch data');
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
			const response = await fetch(`http://localhost:8000/auth/sign-up-google-get-url`, {
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
			}
		}
		getGoogleUrl()
	}
	const handleIntraClick = () => {
		const getIntraUrl = async () => {
			const response = await fetch(`http://localhost:8000/auth/sign-up-intra-get-url/`, {
				method: "GET",
				headers: {
					'Content-Type': 'application/json',
				},
			});
			if (response.ok) {
				const data = await response.json();
				setIntraAuthUrl(data.code);
			} else {
				console.error('Failed to fetch data');
			}
		}
		getIntraUrl()
	}
	return (
		<>
			<div className={styles["Intra"]} onClick={handleIntraClick}>
				<img className={styles["intraLogo"]} src={logo42} alt="" />
				<button className={styles["IntraButton"]} >Sign In With Intra</button>
			</div>
			<div className={styles["Google"]} onClick={handleGoogleClick}>
				<img className={styles["googleLogo"]} src={logoGoogle} alt="" />
				<button className={styles["GoogleButton"]}>Sign In with google</button>
			</div>
		</>

	);
}

export default SignUpWays



// const data = {
// 	email: decoded.email,
// 	avatar: decoded.picture,
// };