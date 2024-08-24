import React from 'react';

function SigInWith(props) {
    return(
        <div className="signInButton">
            <img src={props.logo} alt=""/>
            <button className='button-text'>
                {props.Title}
            </button>
        </div>
    );
}

export default SigInWith;
