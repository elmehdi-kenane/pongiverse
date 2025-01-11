import { createContext, useEffect, useState, useContext } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import mavPic from "../assets/Profile/avatar.png"
import bg from "../assets/Profile/bg1.jpg"
import { Navigate, useNavigate, useParams } from 'react-router-dom';

const ProfileContext = createContext();

export default ProfileContext;

export const ProfileWrapper = ({ child }) => {

    const [userData, setUserData] = useState(null)
    const { user, notifSocket } = useContext(AuthContext);
    const navigate = useNavigate();

    const { userId } = useParams();
    const [chatUserId, setChatUserId] = useState(null);
    const [userPic, setUserPic] = useState(mavPic);
    const [userBg, setUserBg] = useState(bg);
    const [userEmail, setUserEmail] = useState('');
    const [userIsOnline, setUserIsOnline] = useState(false);
    const [userBio, setUserBio] = useState('');
    const [userLevel, setUserLevel] = useState(0);
    const [userXp, setUserXp] = useState(0);
    const [userCountry, setUserCountry] = useState(null);

    const [isFriend, setIsFriend] = useState('false');
    const [isFriendLoading, setIsFriendLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [reportValue, setReportValue] = useState(null);
    const [friendsData, setFriendsData] = useState([])

    const getUserFriends = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/getUserFriends/${userId}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const res = await response.json()
            if (response.ok) {
                // console.log("Response data : ", res.data);
                setFriendsData(res.data)
            }
            else if (response.status === 401)
                navigate('/signin')
        } catch (error) {
            console.error("Error: ", error);
        }
    }

    useEffect(() => {
        const checkFriendship = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/CheckFriendship/${userId}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const res = await response.json()
                if (response.ok) {
                    if (res.data === "blocked")
                        navigate("/Error404")
                    setIsFriend(res.data);
                    setIsFriendLoading(true);
                }
                else if (response.status === 401)
                    navigate("/signin")
            } catch (error) {
                console.error("Error: ", error);
            }
        }
        const getUserData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/getUserDataProfile/${userId}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const res = await response.json()
                if (response.ok) {
                    setUserData(res.userData);
                } else if (response.status === 401)
                    navigate("/signin")
                else
                    navigate("/Error404")
            } catch (error) {
                console.error("Error:  ", error);
            }
        }

        if (userId && notifSocket && notifSocket.readyState === WebSocket.OPEN) {
            getUserData();
            if (user && (user != userId))
                checkFriendship();
            else
                setIsFriendLoading(true);
        }
    }, [user, userId, notifSocket])

    useEffect(() => {
        if (userData) {
            setUserPic(userData.pic)
            setChatUserId(userData.id)
            setUserBg(userData.bg)
            setUserBio(userData.bio)
            setUserEmail(userData.email)
            setUserIsOnline(userData.online)
            setUserLevel(userData.level)
            setUserXp(userData.xp)
            setUserCountry(userData.country)
        }
    }, [userData])

    useEffect(() => {
        if (document.querySelector(".profile-page")) {
            document.querySelector(".profile-page").scrollTop = 0;
        }
    }, [userId]);

    let userInfoData = {
        userId: userId,
        chatUserId: chatUserId,
        userPic: userPic,
        setUserPic: setUserPic,
        userBg: userBg,
        setUserBg: setUserBg,
        userEmail: userEmail,
        setUserEmail: setUserEmail,
        userIsOnline: userIsOnline,
        setUserIsOnline: setUserIsOnline,
        userBio: userBio,
        setUserBio: setUserBio,
        userLevel: userLevel,
        setUserLevel: setUserLevel,
        userXp: userXp,
        setUserXp: setUserXp,
        userCountry: userCountry,
        setUserCountry: setUserCountry,

        isFriend: isFriend,
        setIsFriend: setIsFriend,
        isLoading: isLoading,
        setIsLoading: setIsLoading,
        reportValue: reportValue,
        setReportValue: setReportValue,
        friendsData: friendsData,
        setFriendsData: setFriendsData,

        getUserFriends: getUserFriends,
    };
    return (
        <ProfileContext.Provider value={userInfoData}> 
            {isFriendLoading &&
                <>
                {child} 
                </>
            }
        </ProfileContext.Provider>
    )
}
