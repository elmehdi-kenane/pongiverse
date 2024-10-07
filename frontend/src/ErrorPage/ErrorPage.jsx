import '../assets/error_page/ErrorPage.css'
import NavBar from './NavBar';
import Header from './Header'
import SubHeader from './SubHeader'
import Button from './Button';

function ErrorPage() {
    return (
        <div className="error-page">
          <NavBar></NavBar>
          <Header></Header> {/* Header : {Page Not Found + 404} */}
          <SubHeader></SubHeader> {/* Sub-header : {Error Message} */}
          <Button></Button> {/* Button Back To Home */}
        </div>
    );
}

export default ErrorPage;