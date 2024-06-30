import { useEffect, useState } from "react";


function LoginGoogleTest(){
	const [authUrl, setAuthUrl] = useState('')
	const [code , setCode] = useState('')



	useEffect(() =>{
		const getQueryParam = (name) => {
			const urlParams = new URLSearchParams(window.location.search);
			return urlParams.get(name);
		};
		const extracted_code = getQueryParam('code');
		setCode(extracted_code)
	},[])

	useEffect(() =>{
		const getUrl = async () =>{
			const response = await fetch(`http://localhost:8000/auth/GoogleL`, {
				method: "GET",
				headers: {
					'Content-Type': 'application/json',
				},
			});
			if (response.ok) {
				const data = await response.json();
				setAuthUrl(data.code);
			} else {
				console.error('Failed to fetch data');
			}
		}
		getUrl()
	},[])

	useEffect(() =>{
		const get_token = async () =>{
			const response = await fetch(`http://localhost:8000/auth/google-login-get-token/`, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					code: code
				})
			});
			if (response.ok) {
				const data = await response.json();
			} else {
				console.error('Failed to fetch data');
			}
		}
		if (code)
			get_token()
	},[code])
	const handleClick = () =>{
		if (authUrl){
			console.log("hmededede")
			window.location.href = authUrl;
		}
	}
	return(
		<div>
			<button onClick={handleClick}>login with google</button>
		</div>

	);
}

export default LoginGoogleTest