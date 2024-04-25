import '../assets/navbar-sidebar/index.css'
import NavbarSidebar from './NavbarSidebar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './Authcontext';
import SignIn from '../homepage/SignIn'
import SignUp from '../homepage/SignUp';
import HomePage from '../homepage/HomePage';
import Modes from '../Game/Modes';
import Solo from '../Game/Solo';
import OneVersusOne from '../Game/OneVersusOne';
import Game from '../Game/Game';
import PlayMatch from '../Game/PlayMatch';
import Chat from '../Chat/Chat';
import Groups from '../Groups/Groups';
import Friends from '../Friends/Friends';
import Dashboard from '../Dashboard/Dashboard';
import { Navigate } from 'react-router-dom';

const App = () => {
  return (
    <div className="page">
        <Router>
          <AuthProvider>
            <Routes>
                <Route path="/" element={<HomePage />} exact />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/mainpage" element={<NavbarSidebar />} >
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="chat" element={<Chat />} />
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