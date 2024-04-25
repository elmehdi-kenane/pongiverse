import '../assets/navbar-sidebar/index.css'
import NavbarSidebar from './NavbarSidebar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './Authcontext';
import SignIn from '../homepage/SignIn'
import SignUp from '../homepage/SignUp';
import HomePage from '../homepage/HomePage';
import Game from '../Game/Game';
import PlayMatch from '../Game/PlayMatch';
import SocketContext, { SocketProvider } from '../Groups/SocketContext'

const App = () => {
  return (
    <div className="page">
        <Router>
          <AuthProvider>
            <SocketProvider>
              <Routes>
                  <Route path='/' Component={HomePage} exact />
                  <Route path='/signup' Component={SignUp} exact />
                  <Route path='/signin' Component={SignIn} exact />
                  <Route path="/mainpage/*" Component={NavbarSidebar} exact />
                  <Route path="/game" Component={Game} exact />
                  <Route path="/playMatch" Component={PlayMatch} exact />
              </Routes>
            </SocketProvider>
          </AuthProvider>
        </Router>
    </div>
  )
}

export default App