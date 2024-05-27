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
import PlayMatch from './Game/PlayMatch';
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
// import ChatMessages from './Groups/ChatMessages';
import MessagesContainer from './Chat/MessagesPage';

const App = () => {
  return (
    <div className="page">
        <Router>
          <AuthProvider>
                <Routes>
                    <Route path="/" element={<HomePage />} exact />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/Signin" element={<SignInPage />} />
                    <Route path="/SecondStep" element={<SecondStep />} />
                    <Route path="/WaysSecondStep" element={<WaysSecondStep />} />
                    <Route path="/ForgotPassword" element={<ForgotPassword />} />
                    <Route path="/ChangePassword" element={<ChangePassword />} />
                    <Route path="/mainpage" element={<NavbarSidebar />} >
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="chat" element={<Chat />} />
                      {/* <Route path="chat/:roomId" element={<MessagesContainer />} /> */}
                      <Route path="friends" element={<Friends />} />
                      <Route path="groups" element={<Groups />} />
                      <Route path="game" element={<Modes />} />
                      <Route path="game/solo" element={<Solo />} />
                      <Route path="game/solo/1vs1" element={<OneVersusOne />} />
                      <Route path="play/1vs1/:roomID" element={<PlayMatch />} />
                    </Route>
                </Routes>
          </AuthProvider>
        </Router>
    </div>
  )
}

export default App