import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
const client = axios.create({
baseURL: "http://localhost:8000",
});


function Test()
{
	const form = new FormData()
	const [data, setData] = useState({
		avatar : null
	})
	const handleclick = (e) =>
	{
		e.preventDefault();
		form.append("user_id" , 1)
		client.post('/auth/test/', form, {
			headers: {
				'Content-Type': 'application/json',
			}
		}).then(response => {
				setData(response.data.data)
				console.log(response.data)
			})
			.catch(error => {
				console.error('There was an error!', error);
			});
	}

	return (
		<>
			<button onClick={handleclick}>Click</button>
			{data.avatar &&
				<>
					<img src={data.avatar} alt="NOP" />
					<p>hello rida</p>
				</>
			}
		</>
	);
}

export default Test