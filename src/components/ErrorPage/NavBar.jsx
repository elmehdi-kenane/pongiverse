import PingLogo from '../../assets/PingLogo.svg';
import styles from '../../assets/error_page/ErrorPage.module.css';

function NavBar() {
    return (
        <div className={styles['nav-bar']} >
            <img src={PingLogo} />
          </div>
    );
}

export default NavBar;