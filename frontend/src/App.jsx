import "./assets/navbar-sidebar/index.css";
import NavbarSidebar from "./navbar-sidebar/NavbarSidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./navbar-sidebar/Authcontext";
import SignIn from "./homepage/SignIn";
import SignUp from "./homepage/SignUp";
import HomePage from "./homepage/HomePage";
import Modes from "./Game/Modes";
import Solo from "./Game/Solo";
import OneVersusOne from "./Game/OneVersusOne";
import Rooms from "./Groups/roomsPage";
import PlayMatch from "./Game/OneVsOnePlayMatch";
import Friends from "./Friends/Friends";
import Dashboard from "./Dashboard/Dashboard";
import Profile from "./Profile/Profile";
import WaysSecondStep from "./components/SignUp/WaysSecondStep";
import ForgotPassword from "./components/SignIn/ForgotPassword";
import ChangePassword from "./components/SignIn/ChangePassword";
import SignInPage from "./components/SignIn/SignInPage";
import SignUpPage from "./components/SignUp/SignUpPage";
import SecondStep from "./components/SignUp/SecondStep";
import CreateTournament from "./Tournament/RemoteTournament/CreateTournament";
import JoinTournament from "./Tournament/RemoteTournament/JoinTournament";
import OneVsOneRandom from "./Game/OneVsOneRandom";
import OneVsOneFriends from "./Game/OneVsOneFriends";
import OneVsOneCreateOrJoin from "./Game/OneVsOneCreateOrJoin";
import TournamentBracket from "./Tournament/RemoteTournament/TournamentBracket";
import LocalTournamentBracket from "./Tournament/LocalTournament/LocalTournamentBracket";
import LoginGoogleTest from "./components/SignIn/LoginGoogleTest";
import { ChatProvider } from "./Groups/ChatContext";
import Chat from "./Chat/chatPage";
import OneVsOnePlayTournamentMatch from "./Game/OneVsOnePlayTournamentMatch"
import TwoVersusTwo from "./Game/TwoVersusTwo";
import TwoVsTwoRandom from "./Game/TwoVsTwoRandom";
import OneVsOnePlayMatch from "./Game/OneVsOnePlayMatch";
import TwoVsTwoPlayMatch from "./Game/TwoVsTwoPlayMatch";
import TwoVsTwoFriends from "./Game/TwoVsTwoFriends";
import TwoVsTwoCreateOrJoin from "./Game/TwoVsTwoCreateOrJoin";
import GameSettings from "./Game/GameSettings";
import Settings from "./Settings/Settings";
import Bot from "./Game/Bot";
import LocalTournamentFillMembers from "./Tournament/LocalTournament/LocalTournamentFillMembers";
import TournamentCelebration from "./Tournament/RemoteTournament/TournamentCelebration";
const App = () => {
	return (
		<div className="page">
			<Router>
				<AuthProvider>
					<ChatProvider>
						<Routes>
							<Route path="/" element={<HomePage />} exact />
							<Route path="/signup" element={<SignUpPage />} />
							<Route path="/signin" element={<SignInPage />} />
							{/* <Route path="/signinexample" element={<SignInExample />} /> */}
							<Route path="/SecondStep" element={<SecondStep />} />
							<Route path="/WaysSecondStep" element={<WaysSecondStep />} />
							<Route path="/ForgotPassword" element={<ForgotPassword />} />
							<Route path="/ChangePassword" element={<ChangePassword />} />
							<Route path="/mainpage" element={<NavbarSidebar />}>
								<Route path="dashboard" element={<Dashboard />} />
								<Route path="profile" element={<Profile />} />
								<Route path="settings" element={<Settings />} />
								<Route path="chat" element={<Chat />} />
								<Route path="friends" element={<Friends />} />
								<Route path="groups" element={<Rooms />} />
								<Route path="game" element={<Modes />} />
								<Route path="game/board" element={<GameSettings />} />
								<Route path="game/solo" element={<Solo />} />
								<Route path="game/solo/computer" element={<Bot />} />
								<Route path="game/solo/1vs1" element={<OneVersusOne />} />
								<Route
									path="game/solo/1vs1/random"
									element={<OneVsOneRandom />}
								/>
								<Route
									path="game/solo/1vs1/friends"
									element={<OneVsOneFriends />}
								/>
								<Route
									path="game/solo/1vs1/create-or-join"
									element={<OneVsOneCreateOrJoin />}
								/>
								<Route path="game/solo/2vs2" element={<TwoVersusTwo />} />
								<Route
									path="game/solo/2vs2/random"
									element={<TwoVsTwoRandom />}
								/>
								<Route
									path="game/solo/2vs2/friends"
									element={<TwoVsTwoFriends />}
								/>
								<Route
									path="game/solo/2vs2/create-or-join"
									element={<TwoVsTwoCreateOrJoin />}
								/>
								<Route
									path="play/1vs1/:roomID"
									element={<OneVsOnePlayMatch />}
								/>
								<Route
									path="play/2vs2/:roomID"
									element={<TwoVsTwoPlayMatch />}
								/>
								<Route
									path="game/createtournament"
									element={<CreateTournament />}
								/>
								<Route
									path="game/jointournament"
									element={<JoinTournament />}
								/>
								<Route
									path="game/tournamentbracket"
									element={<TournamentBracket />}
								/>
								<Route
									path="game/1vs1tournament"
									element={<OneVsOnePlayTournamentMatch />}
								/>
								<Route
									path="game/localtournamentbracket"
									element={<LocalTournamentBracket />}
								/>
								<Route
									path="game/localtournamentfillmembers"
									element={<LocalTournamentFillMembers />}
								/>
								<Route
									path="game/tournamentcel"
									element={<TournamentCelebration />}
								/>
							</Route>
						</Routes>
					</ChatProvider>
				</AuthProvider>
			</Router>
		</div>
	);
};
export default App;
