import React from "react";
import SidebarMobile from "./SidebarMobile";
import SidebarLaptop from "./SidebarLaptop";

function Sidebar({ sidebarIsOpen, Icons }) {
    return (
        <>
            <SidebarLaptop Icons={Icons} />
            <SidebarMobile
                sidebarIsOpen={sidebarIsOpen}
                Icons={Icons}
            />
        </>
    );
}

export default Sidebar;