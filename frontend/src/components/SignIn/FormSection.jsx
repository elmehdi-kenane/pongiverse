import React from "react";
import { Link } from "react-router-dom";

function FormSection(props)
{
    return(
        <>
        <form className="signInForm" action="">
            <input className="email-input" type="email" name='email' placeholder="Enter your email" />
            <input className="password-input" type="password" name='password' placeholder="Enter your password" />
            <Link id="forgt-password" to="/ForgotPassword"> Forget your password?</Link>
            <button type="submit" className="submitButton">Sign Up</button>
        </form>
        </>
    );
}

export default FormSection;