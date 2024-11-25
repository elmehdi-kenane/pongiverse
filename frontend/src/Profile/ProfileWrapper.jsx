import { createContext, useEffect, useState, useContext } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import mavPic from "../assets/Profile/Group.svg"
import bg from "../assets/Profile/bg1.jpg"
import { Navigate, useNavigate, useParams } from 'react-router-dom';

const ProfileContext = createContext();

export default ProfileContext;

export const ProfileWrapper = ({ child }) => {

    const [userData, setUserData] = useState(null)
    const { user, notifSocket } = useContext(AuthContext);
    const navigate = useNavigate();

    const { userId } = useParams();
    const [userPic, setUserPic] = useState(mavPic);
    const [userBg, setUserBg] = useState(bg);
    const [userEmail, setUserEmail] = useState('');
    const [userIsOnline, setUserIsOnline] = useState(false);
    const [userBio, setUserBio] = useState('');
    const [userLevel, setUserLevel] = useState(0);
    const [userXp, setUserXp] = useState(0);
    const [userCountry, setUserCountry] = useState(null);

    const [isFriend, setIsFriend] = useState('false');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getUserData = async () => {
            try {
                const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/profile/getUserData/${userId}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const res = await response.json()
                if (response.ok){
                    setUserData(res.userData);
                }
                else 
                    navigate("/Error404")
                // setCheckUser(false);
            } catch (error) {
                console.log("Error:  ", error);
            }
        }
        const checkFriendship = async () => {
            try {
                const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/profile/CheckFriendship/${user}/${userId}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const res = await response.json()
                if (response.ok) {
                    if(res.data === "blocked")
                        navigate("/Error404")
                    setIsFriend(res.data);
                }
                else
                    console.log(res.error);
            } catch (error) {
                console.log("Error: ", error);
            }
        }
        if (userId && notifSocket && notifSocket.readyState === WebSocket.OPEN){
            getUserData();
            if (user && (user != userId))
                checkFriendship();
        }
    }, [user, userId, notifSocket])

    useEffect(() => {
        if (userData) {
            setUserPic(userData.pic)
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
        if (document.querySelector(".profile-page")){
            document.querySelector(".profile-page").scrollTop = 0;
            // document.querySelector(".profile-page").scrollIntoView({ behavior: 'smooth' });
        }
      }, [userId]);

    let userInfoData = {
        userId: userId,
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

        isFriend:isFriend,
        setIsFriend:setIsFriend,
        isLoading: isLoading, 
        setIsLoading: setIsLoading,
    };
    return (
        <ProfileContext.Provider value={userInfoData}> {child} </ProfileContext.Provider>
    )
}
