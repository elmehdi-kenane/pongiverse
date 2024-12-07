import { Link } from "react-router-dom";

function SidebarMobile({ sidebarIsOpen, Icons }) {
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
        <div className="sidebar-mobile" style={{display:sidebarIsOpen ? "flex":"none"}}>
            hahahahah
            {sideBarItems.map((item, index) => {
                return (
                    <div className="sidebar-navigations" id={`sidebar-${item.route}`}>
                        <div id={`sidebar-${item.route}-image`}>
                            <Link to={item.route}>
                                <img src={item.icon} alt={item.icon} />
                                <p id={`sidebar-titles`}>
                                    {item.text}
                                </p>
                            </Link>
                        </div>
                    </div>
                )
            })}
            </div>
    );
}
 
export default SidebarMobile;