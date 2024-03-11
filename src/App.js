import './App.css';
import Header from './Components/Header';
import SignUpWays from './Components/SignUpWays'
import SignUpFrom from './Components/SignUpFrom'
import './assets/SignUp/style.css'





function App() {
  return (
	<div className="SignUpPage">
		<Header />
		<div className="globalFlexContainer">
			<div className="flexContainer">
				<div className="signIn">
					<h2>Sign up</h2>
				</div>
				<SignUpWays IntraTitle="Sign Up With Intra" GoogleTitle="Sign Up With Google" />
				<div className="withEmail">
					<div className="lineBefAft"></div>
					<div className="orSign">
						<p>Or Sign Up With Email</p>
					</div>
					<div className="lineBefAft"></div>
				</div>
				<SignUpFrom />
				<div className="already">
					<p>Already have an account?<a href="#">  Sign in</a></p>
				</div>
			</div>
		</div>
	</div>
);
}

export default App;
