import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import menu from "../assets/LandingPage/menu.svg";
import cross from "../assets/LandingPage/cross.svg";

const Sidebar = () => {
    const sidebarRef = useRef(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            setIsMenuOpen(false); // Close the sidebar if the click is outside
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	return (
        <div className="sidebarLandingPage" ref={sidebarRef}>
			{isMenuOpen ? (
				<>
					<img
						src={menu}
						alt="menu"
                        className="menuLandingPage openMenuLandingPage"
						// className={`sidebarIcon ${isMenuOpen ? "" : "hidden"}`}
						onClick={toggleMenu}
					/>
                    <ol className="sidebarSectionsLandingPage">
                        <a className="sidebarSectionsElement" href="#Home" onClick={toggleMenu}>
							Home
						</a>
                        <a className="sidebarSectionsElement" href="#About" onClick={toggleMenu}>
							About
						</a>
                        <a className="sidebarSectionsElement" href="#Team" onClick={toggleMenu}>
							Team
						</a>
                        <button> <Link to="/signin" className="loginLink">Login</Link> </button>
					</ol>
				</>
			) : (
				<img
					src={menu}
					alt="menu"
                        className="menuLandingPage"
					// className={`sidebarIcon ${isMenuOpen ? "open" : ""}`}
					onClick={toggleMenu}
				/>
            )}
		</div>
	);
};

export default Sidebar;
