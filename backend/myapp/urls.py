from django.urls import path
from .views import WaysSignUpView
from .views import LoginView
from .views import SignUpView
from .views import CheckEmailView
from .views import CheckUsernameView
from .views import GoogleLoginView
from .views import VerifyTokenView
from .views import ForgetPasswordView
from .views import ChangePasswordView
from .views import SignInGoogleGetUrl
from .views import SignInIntraGetUrl
from .views import SignInGoogleGetUserData
from .views import SignInIntraGetUserData
from .views import SignUpGoogleGetUrl
from .views import SignUpIntraGetUrl
from .views import SignUpGoogleGetUserData
from .views import SignUpIntraGetUserData
from .views import LogoutView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('wayssignup/', WaysSignUpView.as_view(), name='my-model'),
    path('login/', LoginView.as_view(), name='login'),
    path('googleLogin/', GoogleLoginView.as_view(), name='loginGoogle'),
    path('checkemail/', CheckEmailView.as_view(), name='checkemail'),
    path('checkusername/', CheckUsernameView.as_view(), name='checkusername'),
    path('verifytoken/', VerifyTokenView.as_view(), name='verifytoken'),
    path('ForgetPassword/', ForgetPasswordView.as_view(), name='ForgetPassword'),
    path('ChangePassword/', ChangePasswordView.as_view(), name='ChangePassword'),
    path('google-get-url/', SignInGoogleGetUrl, name='SignInGoogleGetUrl'),
    path('intra-get-url/', SignInIntraGetUrl, name='SignInIntraGetUrl'),
    path('google-login-get-token/', SignInGoogleGetUserData, name='SignInGoogleGetUserData'),
    path('intra-login-get-token/', SignInIntraGetUserData, name='SignInIntraGetUserData'),
    path('sign-up-google-get-url/', SignUpGoogleGetUrl, name='SignUpGoogleGetUrl'),
    path('sign-up-intra-get-url/', SignUpIntraGetUrl, name='SignUpIntraGetUrl'),
    path('sign-up-google-login-get-token/', SignUpGoogleGetUserData, name='SignUpGoogleGetUserData'),
    path('sign-up-intra-login-get-token/', SignUpIntraGetUserData, name='SignUpIntraGetUserData'),
    path('logout/', LogoutView, name='logout'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
