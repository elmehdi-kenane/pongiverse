import React, { useEffect } from 'react';
import Home from './components/Home'
import PrivateRoute from './components/PrivateRoute'
import SignUpPage from './components/SignUp/SignUpPage'
import SecondStep from './components/SignUp/SecondStep'
import WaysSecondStep from './components/SignUp/WaysSecondStep'
import ForgotPassword from './components/SignIn/ForgotPassword'
import ChangePassword from './components/SignIn/ChangePassword'
import SignInPage from './components/SignIn/SignInPage'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'



function App() {
	useEffect(() => {

	  }, []);
	return (
		<Router>
			<Routes>
				<Route path="/signup" element={<SignUpPage />} />
				<Route path="/SecondStep" element={<SecondStep />} />
				<Route path="/WaysSecondStep" element={<WaysSecondStep />} />
				<Route path="/ForgotPassword" element={<ForgotPassword />} />
				<Route path="/ChangePassword" element={<ChangePassword />} />
				<Route path="/Signin" element={<SignInPage />} />

				<Route
					path='/home'
					element= {
						<PrivateRoute>
							<Home/>
						</PrivateRoute>
					}
					/>
			</Routes>
		</Router>
	  );
}

export default App;