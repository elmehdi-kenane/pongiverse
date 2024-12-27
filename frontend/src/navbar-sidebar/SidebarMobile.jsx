import { Link } from "react-router-dom";

function SidebarMobile({ Icons }) {
    const sideBarItems = [
      {
        id: 1,
        icon: Icons.dashboard,
        route: "dashboard",
      },
      {
        id: 2,
        icon: Icons.friends,
        route: "friendship",
      },
      {
        id: 3,
        icon: Icons.chat,
        route: "chat",
      },
      {
        id: 4,
        icon: Icons.console,
        route: "game",
      },
      {
        id: 5,
        icon: Icons.channels,
        route: "channels",
      },
    ];
    return (
        <div className="sidebar-mobile">
            {sideBarItems.map((item, index) => {
                return (
                  <div className="sidebar-navigations" key={index}>
                    <Link to={item.route} className="sidebar-icons-mobile">
                      <img src={item.icon} alt={item.icon} />
                    </Link>
                  </div>
                );
            })}
            </div>
    );
}
 
export default SidebarMobile;