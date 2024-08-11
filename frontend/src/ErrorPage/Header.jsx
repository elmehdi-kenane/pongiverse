import Racket from '../assets/error_page/racket.svg';

function Header() {
    return (
        <div className="header">
            <div className="box-page-not-found"> <strong> OOPS ! PAGE NOT FOUND. </strong> </div>
            <div className="box-404">
              <strong>4</strong> <img src={Racket} /> <strong>4</strong> 
            </div>
          </div>
    );
}

export default Header;