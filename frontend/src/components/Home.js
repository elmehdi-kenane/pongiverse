import React from 'react';
import Cookies from 'js-cookie';
import { useNavigate} from 'react-router-dom';
// import axios from 'axios';
// axios.defaults.xsrfCookieName = "csrftoken";
// axios.defaults.xsrfHeaderName = "X-CSRFToken";
// const client = axios.create({
//   baseURL: "http://127.0.0.1:${import.meta.env.VITE_PORT}",
// });

function Home() {

    const navigate = useNavigate();
    const logout = (e) =>
    {
        e.preventDefault();
        Cookies.remove('token')
        navigate('/signIn');
    }
    return (
        <>
            <h1>HOME</h1>
            <button onClick={logout}>logout</button>
        </>
    );
}

export default Home;
