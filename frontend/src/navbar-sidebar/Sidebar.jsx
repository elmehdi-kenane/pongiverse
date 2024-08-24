import React from "react";
import SidebarMobile from "./SidebarMobile";
import SidebarLaptop from "./SidebarLaptop";

function Sidebar({ Icons }) {
    return (
        <SidebarLaptop Icons={Icons} />
    );
}

export default Sidebar;