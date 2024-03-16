import styles from '../../assets/error_page/ErrorPage.module.css';

function SubHeader() {
    return (
        <div className={styles['sub-header']}>
            <div className={styles["err-msg"]}>
              <strong> We can't seem to find the page you are looking for. </strong>
            </div>
            <div className={styles["space"]}></div>
          </div>
    );
}

export default SubHeader;