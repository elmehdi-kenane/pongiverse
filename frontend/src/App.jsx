import './assets/navbar-sidebar/index.css'
import NavbarSidebar from './navbar-sidebar/NavbarSidebar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer, Bounce } from 'react-toastify';
import { AuthProvider } from './navbar-sidebar/Authcontext';
import { SocketDataContextProvider } from './navbar-sidebar/SocketDataContext';
import SignIn from './homepage/SignIn'
import SignUp from './homepage/SignUp';
import HomePage from './homepage/HomePage';
import Modes from './Game/Modes';
import Solo from './Game/Solo';
import OneVersusOne from './Game/OneVersusOne';
import PlayMatch from './Game/OneVsOnePlayMatch';
import Groups from './Groups/Groups';
import Friends from './Friends/FriendsPage';
import Dashboard from './Dashboard/Dashboard';
import { Navigate } from 'react-router-dom';
import Game from './Game/Game';
import Chat from './Chat/Chat';
import WaysSecondStep from './components/SignUp/WaysSecondStep';
import ForgotPassword from './components/SignIn/ForgotPassword';
import ChangePassword from './components/SignIn/ChangePassword';
import SignInPage from './components/SignIn/SignInPage';
import SignUpPage from './components/SignUp/SignUpPage';
import SecondStep from './components/SignUp/SecondStep';
import CreateTournament from './Tournament/CreateTournament';
import JoinTournament from './Tournament/JoinTournament';
import MessagesContainer from './Chat/MessagesPage';
import OneVsOneRandom from './Game/OneVsOneRandom';
import OneVsOneFriends from './Game/OneVsOneFriends';
import OneVsOneCreateOrJoin from './Game/OneVsOneCreateOrJoin';
import TournamentBracket from './Tournament/TournamentBracket';
import LoginGoogleTest from './components/SignIn/LoginGoogleTest';

const App = () => {
	return (
		<div className="page">
			<Router>
				<AuthProvider>
                    <SocketDataContextProvider>

					<Routes>
						<Route path="/" element={<HomePage />} exact />
						<Route path="/testest" element={<LoginGoogleTest />} exact />
						<Route path="/signup" element={<SignUpPage />} />
						<Route path="/signin" element={<SignInPage />} />
						<Route path="/SecondStep" element={<SecondStep />} />
						<Route path="/WaysSecondStep" element={<WaysSecondStep />} />
						<Route path="/ForgotPassword" element={<ForgotPassword />} />
						<Route path="/ChangePassword" element={<ChangePassword />} />
						<Route path="/mainpage" element={<NavbarSidebar />} >
							<Route path="dashboard" element={<Dashboard />} />
							<Route path="chat" element={<Chat />} />
							{/* <Route path="chat/:roomId" element={<MessagesContainer />} /> */}
							<Route path="friends" element={<Friends />} />
							<Route path="groups" element={<Groups />} />
							<Route path="game" element={<Modes />} />
							<Route path="game/solo" element={<Solo />} />
							<Route path="game/solo/1vs1" element={<OneVersusOne />} />
							<Route path="game/solo/1vs1/random" element={<OneVsOneRandom />} />
							<Route path="game/solo/1vs1/friends" element={<OneVsOneFriends />} />
							<Route path="game/solo/1vs1/create-or-join" element={<OneVsOneCreateOrJoin />} />
							<Route path="play/1vs1/:roomID" element={<PlayMatch />} />
							<Route path="game/createtournament" element={<CreateTournament />} />
							<Route path="game/jointournament" element={<JoinTournament />} />
							<Route path="game/tournamentbracket" element={<TournamentBracket />} />
						</Route>
					</Routes>
                    </SocketDataContextProvider>
                    <ToastContainer
                        position="top-right"
                        autoClose={5000}
                        limit={1}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                        transition={Bounce} />
				</AuthProvider>
			</Router>
		</div>
	)
}
export default App