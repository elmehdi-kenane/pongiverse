import React from 'react'
import { Link } from 'react-router-dom';


function Button() {
    return (
        <div className="button">
            <Link href="/mainpage"
                target="_blank" > BACK TO HOME </Link>
          </div>
    );
}

export default Button