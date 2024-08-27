import { useContext } from "react";
import { Link } from "react-router-dom";

import AuthContext from "./Authcontext";

function SidebarLaptop({ Icons }) {

    const {isGlass} = useContext(AuthContext);
    const sideBarItems = [
        {
            id: 1,
            icon: Icons.dashboard,
            route: "dashboard",
            text: "Dashboard",
        },
        {
            id: 2,
            icon: Icons.friends,
            route: "friends",
            text: "Friends",
        },
        {
            id: 3,
            icon: Icons.chat,
            route: "chat",
            text: "Chat",
        },
        {
            id: 4,
            icon: Icons.console,
            route: "game",
            text: "Game",
        },
        {
            id: 5,
            icon: Icons.channels,
            route: "channels",
            text: "Channels",
        }
    ]
    return (
        <div className={(isGlass) ?"blur sidebar":"sidebar"}>
            {sideBarItems.map((item, index) => {
                return (
                    <div className="sidebar-navigations" id={`sidebar-${item.route}`} key={index}>
                        <div className="sidebar-icons">
                            <Link to={item.route}>
                                <img src={item.icon} alt={`${item.text}-logo`} />
                                <p className="sidebar-titles"> {item.text} </p>
                            </Link>
                        </div>
                    </div>
                )
            })}
            {/* <div className="sidebar-navigations" id="none"></div> */}
        </div>
    );
}

export default SidebarLaptop;