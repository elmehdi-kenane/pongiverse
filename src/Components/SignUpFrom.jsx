import React, { useState } from 'react';
import '../assets/SignUp/style.css'

function SignUpForm() {
	const [formData, SetFromData] = useState({
		email: '',
		password: '',
		confirmPassword: ''
	})

	const [errors, setErrors] = useState({})

	const handleChange = (e) => {
		const {name, value} = e.target;
		SetFromData({
			...formData, [name] : value
		})
	}
	const handleSubmit = (e) => {
		e.preventDefault()
		const validationErrors = {}
		if (!formData.email.trim()){
			validationErrors.email = "email is required"
		}else if(!/\S+@\S+\.\S+/.test(formData.email)){
			validationErrors.email = "email is not valid"
		}

		if (!formData.password.trim()){
			validationErrors.password = "password is required"
		}else if(formData.password.length < 8){
			validationErrors.password = "password should be atleast 8 characters"
		}

		if (!formData.confirmPassword.trim()){
			validationErrors.confirmPassword = "Please confirm your password"
		}else if(formData.confirmPassword !== formData.password){
			validationErrors.confirmPassword = "password not matched"
		}
		setErrors(validationErrors)
		if (Object.keys(validationErrors).length === 0){
			alert("Form submitted")
		}
	}
	return (
	<form action="" className="formC" onSubmit={handleSubmit} noValidate>
		<div className="items">
			<div className="enterEmail">
				<input type="email" name='email' placeholder="Enter your Email" onChange={handleChange} />
				{errors.email && <span>{errors.email}</span>}
			</div>
			<div className="password">
				<input type="password" name='password' placeholder="Enter your Password" onChange={handleChange} />
				{errors.password && <span>{errors.password}</span>}
			</div>
			<div className="rePassword">
				<input type="password" name='confirmPassword' placeholder="Confirm your Password" onChange={handleChange} />
				{errors.confirmPassword && <span>{errors.confirmPassword}</span>}
			</div>
			<div className="submitBut">
				<button type='submit'>Sign up</button>
			</div>
		</div>
	</form>
  );
}

export default SignUpForm;