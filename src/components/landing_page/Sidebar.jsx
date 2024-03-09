import { useState } from "react";

import menu from "../../assets/landing_page/menu.svg";
import cross from "../../assets/landing_page/cross.svg";

const Sidebar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	return (
		<div className="sidebar">
			{isMenuOpen ? (
				<>
					<img
						src={cross}
						alt="cross"
						className="cross"
						// className={`sidebarIcon ${isMenuOpen ? "" : "hidden"}`}
						onClick={toggleMenu}
					/>
					<ol className="sidebarSections">
						<a href="#Home" onClick={toggleMenu}>
							Home
						</a>
						<a href="#About" onClick={toggleMenu}>
							About
						</a>
						<a href="#Team" onClick={toggleMenu}>
							Team
						</a>
						<a href="login">
							<button> Login </button>
						</a>
					</ol>
				</>
			) : (
				<img
					src={menu}
					alt="menu"
					className="menu"
					// className={`sidebarIcon ${isMenuOpen ? "open" : ""}`}
					onClick={toggleMenu}
				/>
			)}
			<div className={`sidebarMenu ${isMenuOpen ? "open" : ""}`}></div>
		</div>
	);
};

export default Sidebar;
