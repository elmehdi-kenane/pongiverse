from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from rest_framework.views import APIView
from .serializers import MyModelSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from .models import customuser
from rest_framework_simplejwt.tokens import RefreshToken, TokenError, AccessToken
from django.contrib.auth import authenticate
from django.conf import settings
from django.middleware import csrf
import random
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model

class SignUpView(APIView) :
    parser_classes = (MultiPartParser, FormParser)
    def post(self, request, *args, **kwargs):
        serializer = MyModelSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            response = Response()
            data = get_tokens_for_user(user)
            csrf.get_token(request)
            response.data = {"Case" : "Sign up successfully","data":data}
            return response
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def get(self, request, format=None):
        queryset = customuser.objects.all()
        serializer = MyModelSerializer(queryset, many=True)
        return Response(serializer.data)

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
    
class LoginView(APIView):
    def post(self, request, format=None):
        data = request.data
        response = Response()
        username = data.get('username', None)
        password = data.get('password', None)
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                data = get_tokens_for_user(user)
                csrf.get_token(request)
                user.is_online = True
                user.save()
                response.data = {"Case" : "Login successfully","data":data}
                return response
            else:
                return Response({"No active" : "This account is not active!!"}, status=status.HTTP_404_NOT_FOUND)
        else:
            response.data = {"Case" : "Invalid username or password!!"}
            return response
    def get(self, request, format=None):
        queryset = customuser.objects.all()
        serializer = MyModelSerializer(queryset, many=True)
        return Response(serializer.data)

class GoogleLoginView(APIView):
    def post(self, request, format=None):
        data = request.data
        response = Response()
        email = data.get('email', None)
        user = customuser.objects.filter(email=email).first()
        if user is not None:
            if user.is_active:
                data = get_tokens_for_user(user)
                csrf.get_token(request)
                response.data = {"Case" : "Login successfully","data":data}
                return response
            else:
                return Response({"No active" : "This account is not active!!"}, status=status.HTTP_404_NOT_FOUND)
        else:
            response.data = {"Case" : "Invalid username or password!!"}
            return response
    def get(self, request, format=None):
        queryset = customuser.objects.all()
        serializer = MyModelSerializer(queryset, many=True)
        return Response(serializer.data)


class CheckEmailView(APIView):
    def post(self, request, format=None):
        data = request.data
        response = Response()
        email = data.get('email', None)
        user = customuser.objects.filter(email=email).first()
        if user is not None:
            response.data = {"Case" : "Email already exist"}
            return response
        else:
            response.data = {"Case" : "Email does not exist"}
            return response
        

class CheckUsernameView(APIView):
    def post(self, request, format=None):
        data = request.data
        response = Response()
        username = data.get('username', None)
        user = customuser.objects.filter(username=username).first()
        if user is not None:
            response.data = {"Case" : "Username already exist"}
            return response
        else:
            response.data = {"Case" : "Username does not exist"}
            return response



class VerifyTokenView(APIView):
    def post(self, request, format=None):
        response = Response()
        token = request.data.get('token')
        try:
            decoded_token = AccessToken(token)
            response.data = {"Case" : "valid token"}
            return response
        except TokenError as e:
            response.data = {"Case" : "Invalid token"}
            return response

class ForgetPasswordView(APIView):
    def post(self, request, format=None):
        response = Response()
        email = request.data.get('email')
        random_number = random.randint(1000, 10000)
        message = 'Here is the code : ' + str(random_number)
        send_mail(
        'Reset Password',
        message,
        'settings.EMAIL_HOST_USER',
        [email],
        fail_silently=False,
        )
        response.data = {"Case" : "valid token", "Number" : random_number}
        return response
    
class ChangePasswordView(APIView):
    def post(self, request, format=None):
        data = request.data
        email = data.get('email', None)
        password = data.get('password', None)
        response = Response()
        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = get_user_model().objects.get(email=email)
        except get_user_model().DoesNotExist:
            return Response({"error": "No user found with this email."}, status=status.HTTP_404_NOT_FOUND)
        
        if user.is_active:
            try:
                user.password = password
                user.save()
                response.data = {"Case": "Password successfully changed"}
                return response
            except Exception as e:
                response.data = {"Error": "Failed to change password"}
                return response
        else:
            return Response({"error": "This account is not active."}, status=status.HTTP_404_NOT_FOUND)

