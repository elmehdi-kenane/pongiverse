import Racket from '../../assets/error_page/racket.svg';
import styles from '../../assets/error_page/ErrorPage.module.css';

function Header() {
    return (
      <div className={styles['header']}>
      <div className={styles["box-page-not-found"]}> <strong> OOPS ! PAGE NOT FOUND. </strong> </div>
            <div className={styles["box-404"]}>
              <strong>4</strong> <img src={Racket} /> <strong>4</strong> 
            </div>
          </div>
    );
}

export default Header;