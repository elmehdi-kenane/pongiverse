import { createContext, useEffect, useState, useContext } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import mavPic from "../assets/Profile/Group.svg"
import bg from "../assets/Profile/bg1.jpg"
import { useParams } from 'react-router-dom';

const ProfileContext = createContext();

export default ProfileContext;

export const ProfileWrapper = ({ child }) => {

    const [userData, setUserData] = useState(null)
    const { user } = useContext(AuthContext);

    const { userId } = useParams();
    const [userPic, setUserPic] = useState(mavPic);
    const [userBg, setUserBg] = useState(bg);
    const [userEmail, setUserEmail] = useState('');
    const [userBio, setUserBio] = useState('');
    const [userLevel, setUserLevel] = useState(0);
    const [userXp, setUserXp] = useState(0);
    const [userCountry, setUserCountry] = useState(null);

    const [checkUser, setCheckUser] = useState(true);
    const [isFriend, setIsFriend] = useState('false');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getUserData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/profile/getUserData/${userId}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const res = await response.json()
                if (response.ok)
                    setUserData(res.userData);
                else 
                    setCheckUser(false);
            } catch (error) {
                console.log("Error: ", error);
            }
        }
        const checkFriendship = async () => {
            try {
                const response = await fetch(`http://localhost:8000/profile/CheckFriendship/${user}/${userId}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const res = await response.json()
                if (response.ok) {
                    setIsFriend(res.data);
                    // console.log(res.data)
                }
                else
                    console.log(res.error);
            } catch (error) {
                console.log("Error: ", error);
            }
        }
        if (userId){
            getUserData();
            if (user && (user != userId))
                checkFriendship();
        }
    }, [user, userId])

    useEffect(() => {
        // const getUserPic = async (picPath, fnc) => {
        //     try {
        //         const response = await fetch(`http://localhost:8000/api/getImage`, {
        //             method: "POST",
        //             headers: { 'Content-Type': 'application/json', },
        //             body: JSON.stringify({
        //                 image: picPath
        //             })
        //         });
        //         const blob = await response.blob();
        //         fnc(URL.createObjectURL(blob));
        //     } catch (error) {
        //         console.log("Error : ", error)
        //     }
        // }
        if (userData) {
            // getUserPic(userData.pic, setUserPic)
            setUserPic(userData.pic)
            setUserBg(userData.bg)
            setUserBio(userData.bio)
            setUserEmail(userData.email)
            setUserLevel(userData.level)
            setUserXp(userData.xp)
            setUserCountry(userData.country)
        }
    }, [userData])

    

    let userInfoData = {
        userId: userId,
        userPic: userPic,
        setUserPic: setUserPic,
        userBg: userBg,
        setUserBg: setUserBg,
        userEmail: userEmail,
        setUserEmail: setUserEmail,
        userBio: userBio,
        setUserBio: setUserBio,
        userLevel: userLevel,
        setUserLevel: setUserLevel,
        userXp: userXp, 
        setUserXp: setUserXp,
        userCountry: userCountry,
        setUserCountry: setUserCountry,

        checkUser: checkUser,
        setCheckUser: setCheckUser,
        isFriend:isFriend,
        setIsFriend:setIsFriend,
        isLoading: isLoading, 
        setIsLoading: setIsLoading,
    };
    return (
        <ProfileContext.Provider value={userInfoData}> {child} </ProfileContext.Provider>
    )
}
