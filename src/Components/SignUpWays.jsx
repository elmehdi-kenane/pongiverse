import React from 'react';
import '../assets/SignUp/style.css'

function SignUpWays(props) {
  return (
	<div className="signUpWays">
		<div className="intra">
			<button>
				<div className="intraIcon">
					<img src="42_logo.svg" alt=""/>
				</div>
				<div className="intraTitle">
					<p>{props.IntraTitle}</p>
				</div>
			</button>
		</div>
		<div className="google">
			<button>
				<div className="googleIcon">
					<img src="gg.png" alt=""/>
				</div>
				<div className="googleTitle">
					<p>{props.GoogleTitle}</p>
				</div>
			</button>
		</div>
	</div>
  );
}

export default SignUpWays;