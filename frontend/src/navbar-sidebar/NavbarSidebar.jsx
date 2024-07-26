import React, { useContext, useState, useEffect } from 'react'
import { toast, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import * as Icons from '../assets/navbar-sidebar'
import { useNavigate } from 'react-router-dom'
import AuthContext from './Authcontext'
import SocketDataContext from './SocketDataContext'
import NotificationPopupCard from './NotificationPopupCard'
import { Outlet } from 'react-router-dom'

function NavbarSidebar() {
	const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
    const location = useLocation()
	const [searchbar, setSearchBar] = useState(false);
    let { user, socket, privateCheckAuth, setUser } = useContext(AuthContext)
	let navigate = useNavigate()
    const [newRecievedFriendReqNotif, setNewRecievedFriendReqNotif] = useState(false);
    const [friendReqUsername, setFriendReqUsername] = useState('');
    const [removeFriendReqNotif, setRemoveFriendReqNotif] = useState(false);
    const data = useContext(SocketDataContext);

    const notify = () => {
        console.log("+++++++++ call notify +++++++++")
        setNewRecievedFriendReqNotif(false)
        toast(
            <NotificationPopupCard secondUsername={friendReqUsername} />,
            {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            }
        );
    };

    useEffect(() => {
        console.log("============ socket-notif-start ============");
        console.log(data.message, data.type);
        console.log("============ socket-notif-end ============");

        if (data.type === 'recieve-friend-request') {
            setNewRecievedFriendReqNotif(true);
            setRemoveFriendReqNotif(false);
            setFriendReqUsername(data.message.second_username);
        }
        else if (data.type === 'confirm-friend-request' && data.message.second_username === friendReqUsername) {
            setRemoveFriendReqNotif(true);
        }
        else if (data.type === 'remove-friend-request' && data.message.second_username === friendReqUsername) {
            setRemoveFriendReqNotif(true);
        }
        else
            console.log("unknown notif type");
    }, [data]);

    useEffect(() => {
        { console.log("path url:", location.pathname) }
        { console.log("newRecievedFriendReqNotif: ", newRecievedFriendReqNotif, "location.pathname !== '/mainpage/friends'", location.pathname !== '/mainpage/friends') }
        {
            (newRecievedFriendReqNotif && location.pathname !== '/mainpage/friends') ?
                (
                    // removeFriendReqNotif ?
                    //     console.log("current notif should be disappears")
                    //     :
                    notify()
                )
                :
                console.log("there's no newRecievedFriendReqNotif")
        }
    }, [data.message.to_user, data.type]);

	useEffect(() => {
		privateCheckAuth()
	}, [])

	window.addEventListener('resize', () => {
		if (window.innerWidth > 768) {
			setSidebarIsOpen(false);
			setSearchBar(false);
		}
	});

	const handleExapandSidebar = () => {
		setSidebarIsOpen(!sidebarIsOpen)
	}

	const handleSearchBar = () => {
		setSearchBar(!searchbar);
	}

	let logout = async (e) => {
		e.preventDefault();

		try {
			let response = await fetch('http://localhost:8000/api/logout', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			})
			let content = await response.json()
			if (content.message) {
				setUser('')
				navigate('/signin')
			}
		} catch (e) {
			console.log('Error in network or URL')
		}
	}
	return (
		<>
			<Navbar
				Icons={Icons}
				searchbar={searchbar}
				setSearchBar={setSearchBar}
				handleSearchBar={handleSearchBar}
			/>
			<div className='sidebarWrapper'>
				<Sidebar
					Icons={Icons}
				/>
				<Outlet />
			</div>
		</>
	);
}

export default NavbarSidebar;