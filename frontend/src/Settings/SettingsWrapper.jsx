import { createContext, useEffect, useState, useContext } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import mavPic from "../assets/Profile/Group.svg"
import bg from "../assets/Profile/bg1.jpg"
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

const SettingsContext = createContext();

export default SettingsContext;

export const SettingsWrapper = ({ child }) => {

    const { user } = useContext(AuthContext);
    const [isInfo, setIsInfo] = useState(true);
    const [userData, setUserData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate();
    const [userPic, setUserPic] = useState(mavPic);
    const [userBg, setUserBg] = useState(bg);
    const [userEmail, setUserEmail] = useState('');
    const [userBio, setUserBio] = useState('');
    const [userLevel, setUserLevel] = useState(null);
    const [userCountry, setUserCountry] = useState(null);
    const [userTfq, setUserTfq] = useState(false);


    const notifySuc = (suc) => toast.success(suc);
    const notifyErr = (err) => toast.error(err);

    useEffect(() => {
        const url = window.location.href;
        const checkUrlEnd = () => {
            if (url.endsWith('/') || url.endsWith('/settings'))
                setIsInfo(true)
            else if (url.endsWith('/security'))
                setIsInfo(false)
        };
        if (url)
            checkUrlEnd();
    }, [window.location.href])

    useEffect(() => {
        const getUserData = async () => {
            try {
                const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/profile/getUserData/${user}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const res = await response.json()
                if (response.ok) {
                    //console.log("Response userData : ", res.userData);
                    setUserData(res.userData);
                }
                else if (response.status === 401) {
                    navigate("/signin")
                }
                else
                   console.log("Error : ", res.error);
            } catch (error) {
               console.log("Error: ", error);
            }
        }
        if (user)
            getUserData();
    }, [user])

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
        //        console.log("Error : ", error)
        //     }
        // }
        if (userData) {
            setUserPic(userData.pic)
            setUserBg(userData.bg)
            setUserBio(userData.bio)
            setUserEmail(userData.email)
            setUserLevel(userData.level)
            setUserCountry(userData.country)
            setUserTfq(userData.tfq)
        }
    }, [userData])

    let userInfoData = {
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
        userCountry: userCountry,
        setUserCountry: setUserCountry,
        userTfq: userTfq,
        setUserTfq: setUserTfq,

        isInfo: isInfo,
        setIsInfo: setIsInfo,
        isLoading: isLoading,
        setIsLoading: setIsLoading,

        notifySuc: notifySuc,
        notifyErr: notifyErr

    };
    return (
        <SettingsContext.Provider value={userInfoData}> {child} </SettingsContext.Provider>
    )
}
