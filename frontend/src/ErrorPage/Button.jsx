import React from 'react'
import { Link } from 'react-router-dom';


function Button() {
    return (
        <div className="button">
            <Link to="/mainpage/dashboard" > BACK TO HOME </Link>
          </div>
    );
}

export default Button