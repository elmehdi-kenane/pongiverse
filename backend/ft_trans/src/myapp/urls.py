from django.urls import path
from .views import SignUpView
from .views import LoginView
from .views import CheckEmailView
from .views import CheckUsernameView
from .views import GoogleLoginView
from .views import VerifyTokenView
from .views import ForgetPasswordView
from .views import ChangePasswordView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='my-model'),
    path('login/', LoginView.as_view(), name='login'),
    path('googleLogin/', GoogleLoginView.as_view(), name='loginGoogle'),
    path('checkemail/', CheckEmailView.as_view(), name='checkemail'),
    path('checkusername/', CheckUsernameView.as_view(), name='checkusername'),
    path('verifytoken/', VerifyTokenView.as_view(), name='verifytoken'),
    path('ForgetPassword/', ForgetPasswordView.as_view(), name='ForgetPassword'),
    path('ChangePassword/', ChangePasswordView.as_view(), name='ChangePassword'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)