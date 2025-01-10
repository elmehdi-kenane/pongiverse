import 'react-toastify/dist/ReactToastify.css';
import "./assets/navbar-sidebar/index.css";
import NavbarSidebar from "./navbar-sidebar/NavbarSidebar";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./navbar-sidebar/Authcontext";
import Modes from "./Game/Modes";
import Solo from "./Game/Solo";
import OneVersusOne from "./Game/OneVersusOne";
import Rooms from "./Groups/roomsPage";
import Dashboard from "./Dashboard/Dashboard";
import Profile from "./Profile/Profile";
import { ProfileWrapper } from "./Profile/ProfileWrapper";
import { SettingsWrapper } from "./Settings/SettingsWrapper";
import FriendshipPage from "./Friends/FriendsPage";
import WaysSecondStep from "./components/SignUp/WaysSecondStep";
import ForgotPassword from "./components/SignIn/ForgotPassword";
import ChangePassword from "./components/SignIn/ChangePassword";
import SignInPage from "./components/SignIn/SignInPage";
import SignUpPage from "./components/SignUp/SignUpPage";
import SecondStep from "./components/SignUp/SecondStep";
import LandingPage from "./LandingPage/LandingPage";
import CreateTournament from "./Tournament/RemoteTournament/CreateTournament";
import JoinTournament from "./Tournament/RemoteTournament/JoinTournament";
import OneVsOneRandom from "./Game/OneVsOneRandom";
import OneVsOneFriends from "./Game/OneVsOneFriends";
import OneVsOneCreateOrJoin from "./Game/OneVsOneCreateOrJoin";
import TournamentBracket from "./Tournament/RemoteTournament/TournamentBracket";
import LocalTournamentBracket from "./Tournament/LocalTournament/LocalTournamentBracket";
import { ChatProvider } from "./Context/ChatContext";
import Chat from "./Chat/chatPage";
import OneVsOnePlayTournamentMatch from "./Game/OneVsOnePlayTournamentMatch"
import TwoVersusTwo from "./Game/TwoVersusTwo";
import TwoVsTwoRandom from "./Game/TwoVsTwoRandom";
import OneVsOnePlayMatch from "./Game/OneVsOnePlayMatch";
import TwoVsTwoPlayMatch from "./Game/TwoVsTwoPlayMatch";
import OneVsOneOffline from "./Game/OneVsOneOffline"
import TwoVsTwoFriends from "./Game/TwoVsTwoFriends";
import TwoVsTwoCreateOrJoin from "./Game/TwoVsTwoCreateOrJoin";
import GameSettings from "./Game/GameSettings";
import AiOpponent from "./Game/AiOpponent";
import { ToastContainer, Bounce } from "react-toastify";
import LocalTournamentFillMembers from "./Tournament/LocalTournament/LocalTournamentFillMembers";
import ErrorPage from "./ErrorPage/ErrorPage";
import { DashboardWrapper } from './Dashboard/DashboardWrapper';
import LocalModes from './Game/LocalModes';
import PersonalInfo from './Settings/PersonalInfo';
import Security from './Settings/Security';
import TournamentCelebration from "./Tournament/RemoteTournament/TournamentCelebration";

import GameCustomization from './Game/GameCustomization/GameCustomization';

const App = () => {
  return (
    <div className="page" style={{ backgroundColor: '#250939' }}>
      <Router>
        <AuthProvider>
          <Routes >
            <Route path="/" element={<LandingPage />} exact />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />}  />
            <Route path="/SecondStep" element={<SecondStep />} />
            <Route path="/WaysSecondStep" element={<WaysSecondStep />} />
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            <Route path="/ChangePassword" element={<ChangePassword />} />
            <Route path="/Error404" element={<ErrorPage />} />
            <Route path="/localtournamentbracket" element={<LocalTournamentBracket />} />
            <Route path="/localtournamentfillmembers" element={<LocalTournamentFillMembers />} />
            <Route path="/localmodes" element={<LocalModes />} />
            <Route path="/1vs1/offline" element={<OneVsOneOffline />} />
            <Route path="/mainpage" element={<ChatProvider child={<NavbarSidebar />} />} >
              <Route element={<DashboardWrapper child={<Dashboard />} />} index  />
              <Route path="dashboard" element={<DashboardWrapper child={<Dashboard />} />} />
              <Route path="profile/:userId" element={<ProfileWrapper child={<Profile />} />} />
              <Route path="settings" element={<SettingsWrapper child={<PersonalInfo />} />} />
              <Route path="settings/security" element={<SettingsWrapper child={<Security />} />} />
              <Route path="chat" element={<Chat />} />
              <Route path="Friendship" element={<FriendshipPage />} />
              <Route path="groups" element={<Rooms />} />
              <Route path="game" element={<Modes />} />
              <Route path="game/board" element={<GameSettings />} />
              <Route path="game/solo" element={<Solo />} />
              <Route path="game/solo/computer" element={<AiOpponent />} />
              <Route path="game/solo/1vs1" element={<OneVersusOne />} />
              <Route path="game/solo/1vs1/random" element={<OneVsOneRandom />} />
              <Route path="game/solo/1vs1/friends" element={<OneVsOneFriends />} />
              <Route path="game/solo/1vs1/create-or-join" element={<OneVsOneCreateOrJoin />} />
              <Route path="game/solo/2vs2" element={<TwoVersusTwo />} />
              <Route path="game/solo/2vs2/random" element={<TwoVsTwoRandom />} />
              <Route path="game/solo/2vs2/friends" element={<TwoVsTwoFriends />} />
              <Route path="game/solo/2vs2/create-or-join" element={<TwoVsTwoCreateOrJoin />} />
              <Route path="play/1vs1/:roomID" element={<OneVsOnePlayMatch />} />
              <Route path="play/2vs2/:roomID" element={<TwoVsTwoPlayMatch />} />
              <Route path="game/createtournament" element={<CreateTournament />} />
              <Route path="game/jointournament" element={<JoinTournament />} />
              <Route path="game/tournamentbracket" element={<TournamentBracket />} /> 
              <Route path="game/tournamentcel" element={<TournamentCelebration />} />
              <Route path="game/1vs1tournament" element={<OneVsOnePlayTournamentMatch />} />
              <Route path="game/customization" element={<GameCustomization />} />
            </Route>
            <Route path="*" element={<Navigate to="/Error404" />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            limit={1}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
          />
        </AuthProvider>
      </Router>
    </div>
  );
};
export default App;
