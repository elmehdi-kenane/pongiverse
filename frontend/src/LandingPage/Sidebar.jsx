import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import menu from "../assets/LandingPage/menu.svg";
import cross from "../assets/LandingPage/cross.svg";

const Sidebar = () => {
    const sidebarRef = useRef(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const navigate = useNavigate()

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

	const navigateToLogin = () => {
		////console.log("*****HEMDDMDMD")
		if (isAuthenticated)
			navigate("/mainpage/dashboard");
		else
			navigate("/signin")
	}

	async function check_auth() {
		try {
			let response = await fetch(
				`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/auth/verifytoken/`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			);
			response = await response.json();
			if (response.Case !== "Invalid token") {
				setIsAuthenticated(true)
			} else {
				setIsAuthenticated(false)
			}
		} catch (e) {
			////console.log("something wrong with fetch");
		}
	}

	useEffect(() => {
		check_auth()
	},[])

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
                        <button onClick={navigateToLogin}>{!isAuthenticated ? 'Login' : 'Home'}</button>
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
