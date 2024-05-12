from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from rest_framework.views import APIView
from .serializers import MyModelSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from .models import customuser
from datetime import datetime
import requests
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken, TokenError, AccessToken
from django.contrib.auth import authenticate
from django.conf import settings
from django.middleware import csrf
import random
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .serializers import MyModelSerializer


class SignUpView(APIView) :
	parser_classes = (MultiPartParser, FormParser)
	def post(self, request, *args, **kwargs):
		if request.data.get('avatar') == 'null':
			my_dict = dict(username=request.data.get('username'), email=request.data.get('email'), password=request.data.get('password'), is_active=request.data.get('is_active'))
		else:
			my_dict = dict(username=request.data.get('username'), email=request.data.get('email'), password=request.data.get('password'), is_active=request.data.get('is_active'), avatar=request.data.get('avatar'))
		serializer = MyModelSerializer(data=my_dict)
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

class WaysSignUpView(APIView) :
	parser_classes = (MultiPartParser, FormParser)
	def post(self, request, *args, **kwargs):
		my_data = {}
		my_data['username'] = request.data.get('username')
		my_data['email'] = request.data.get('email')
		my_data['password'] = request.data.get('password')
		my_data['is_active'] = request.data.get('is_active')
		image_response = requests.get(request.data.get('avatar'))
		if image_response.status_code == 200:
			image_content = image_response.content
			if image_content:
				image_file = InMemoryUploadedFile(ContentFile(image_content), None, 'image.jpg', 'image/jpeg', len(image_content), None)
				print(f'IMAGE CONTENT IS : {image_file}')
				my_data['avatar'] = image_file
		# else:
			# response.data = {"Case" : "Error"}
		serializer = MyModelSerializer(data=my_data)
		if serializer.is_valid():
			user = serializer.save()
			response = Response()
			response.data = {"Case" : "Sign up successfully"}
			return response
		else:
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
			data = get_tokens_for_user(user)
			response.set_cookie('token', data['access'], httponly=True)
			response.data = {"Case" : "Login successfully"}
			return response
		else:
			response.data = {"Case" : "Invalid username or password!!"}
			return response

class GoogleLoginView(APIView):
	def post(self, request, format=None):
		data = request.data
		response = Response()
		email = data.get('email', None)
		user = customuser.objects.filter(email=email).first()
		if user is not None:
			data = get_tokens_for_user(user)
			response.set_cookie('token', data['access'], httponly=True)
			response.data = {"Case" : "Login successfully"}
			return response
		else:
			response.data = {"Case" : "Invalid username or password!!"}
			return response


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
		username = request.data['user']
		print(f"THE USERNAME OF THE USER IS : {username}")
		try:
			token = request.COOKIES.get('token')
			decoded_token = AccessToken(token)
			print("CHI L33IYBAAAAAA")
			data = decoded_token.payload
			if not data.get('user_id'):
				if username:
					user = customuser.objects.filter(username=username).first()
					if user:
						print(f"THIS SPECIFIC USER IS HEREEEEEEE !!!!!!!!!!")
						user.is_online = False
						user.save()
				response.data = {"Case" : "Invalid token"}
				return response
			user = customuser.objects.filter(id=data['user_id']).first()
			if user is not None:
				user.is_online = True
				user.save()
				serializer = MyModelSerializer(user)
				response.data = {"Case" : "valid token", "data" : serializer.data}
				return response
			else:
				response.data = {"Case" : "Invalid token"}
				return response
		except TokenError as e:
			# print(username)
			if username == '':
				response.data = {"Case" : "Invalid token"}
				return response
			else:
				user = customuser.objects.filter(username=username).first()
				if user is not None:
					user.is_online = True
					user.save()
					tokens = get_tokens_for_user(user)
					response.set_cookie('token', tokens['access'], httponly=True)
					# print(tokens['access'])
					return response
				else:
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


class TestView(APIView):
	def post(self, request, format=None):
		response =  Response()
		id = request.data['user_id']
		user = customuser.objects.filter(id=6).first()
		serializer = MyModelSerializer(user)
		response.data = {"Case" : "REDA", "data" : serializer.data}
		return response
