import { Link } from "react-router-dom";
import styles from '../../assets/error_page/ErrorPage.module.css';


function Button() {
    return (
        <div className={styles["button"]}>
            <strong> <Link href='/'> BACK TO HOME </Link></strong>
          </div>
    );
}

export default Button;