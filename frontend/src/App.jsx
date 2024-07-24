import './assets/navbar-sidebar/index.css'
import NavbarSidebar from './navbar-sidebar/NavbarSidebar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './navbar-sidebar/Authcontext';
import SignIn from './homepage/SignIn'
import SignUp from './homepage/SignUp';
import HomePage from './homepage/HomePage';
import Modes from './Game/Modes';
import Solo from './Game/Solo';
import OneVersusOne from './Game/OneVersusOne';
import PlayMatch from './Game/OneVsOnePlayMatch';
import Groups from './Groups/Groups';
import Friends from './Friends/Friends';
import Dashboard from './Dashboard/Dashboard';
import Profile from './Profile/Profile';
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
import MessagesContainer from './Chat/MessagesPage';
import OneVsOneRandom from './Game/OneVsOneRandom';
import OneVsOneFriends from './Game/OneVsOneFriends';
import OneVsOneCreateOrJoin from './Game/OneVsOneCreateOrJoin';
import TwoVersusTwo from './Game/TwoVersusTwo';
import TwoVsTwoRandom from './Game/TwoVsTwoRandom';
import OneVsOnePlayMatch from './Game/OneVsOnePlayMatch';
import TwoVsTwoPlayMatch from './Game/TwoVsTwoPlayMatch';
import TwoVsTwoFriends from './Game/TwoVsTwoFriends';
import TwoVsTwoCreateOrJoin from './Game/TwoVsTwoCreateOrJoin';
import GameSettings from './Game/GameSettings';
import Settings from './Settings/Settings';
import Bot from './Game/Bot';

const App = () => {
  return (
    <div className="page">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} exact />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/SecondStep" element={<SecondStep />} />
            <Route path="/WaysSecondStep" element={<WaysSecondStep />} />
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            <Route path="/ChangePassword" element={<ChangePassword />} />
            <Route path="/mainpage" element={<NavbarSidebar />} >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />  
              <Route path="chat" element={<Chat />} />
              {/* <Route path="chat/:roomId" element={<MessagesContainer />} /> */}
              <Route path="friends" element={<Friends />} />
              <Route path="groups" element={<Groups />} />
              <Route path="game" element={<Modes />} />
              <Route path="game/board" element={<GameSettings />} />
              <Route path="game/solo" element={<Solo />} />
              <Route path="game/solo/computer" element={<Bot />} />
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
            </Route>
          </Routes>
        </AuthProvider>
      </Router>

    </div>
  )
}
export default App