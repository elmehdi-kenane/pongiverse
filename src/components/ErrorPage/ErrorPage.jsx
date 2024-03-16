import React from 'react';
import styles from '../../assets/error_page/ErrorPage.module.css';
import NavBar from './NavBar';
import Header from './Header';
import SubHeader from './SubHeader';
import Button from './Button';

function ErrorPage() {
  return (
    <div className={styles['error-page']}>
      <NavBar/>
      <Header />
      <SubHeader />
      <Button />
    </div>
  );
}

export default ErrorPage;