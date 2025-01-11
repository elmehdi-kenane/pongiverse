from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from .serializers import MyModelSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from .models import customuser
from mainApp.models import UserMatchStatics
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
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from urllib.parse import urlencode
import json
import os
import certifi
import ssl
from PIL import Image
from io import BytesIO
from requests.packages.urllib3.exceptions import InsecureRequestWarning
from .decorators import authentication_required
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
from mainApp.models import UserMatchStatics
import hmac
import hashlib
import base64
from django.http import JsonResponse

class SignUpView(APIView):
	parser_classes = (MultiPartParser, FormParser)
	def post(self, request, *args, **kwargs):
		try:
			avatar = request.data.get('avatar')
			if avatar == 'null' or avatar is None:
				my_dict = {
					'username': request.data.get('username'),
					'email': request.data.get('email'),
					'password': request.data.get('password'),
					'is_active': request.data.get('is_active', True)
				}
			else:
				my_dict = {
					'username': request.data.get('username'),
					'email': request.data.get('email'),
					'password': request.data.get('password'),
					'is_active': request.data.get('is_active', True),
					'avatar': avatar
				}
			serializer = MyModelSerializer(data=my_dict)
			if serializer.is_valid():
				user = serializer.save()
				response = Response()
				data = get_tokens_for_user(user)
				csrf.get_token(request)
				if user:
					UserMatchStatics.objects.create(
						player=user,
						wins=0,
						losts=0,
						level=0,
						total_xp=0,
						goals=0
					)
				response.data = {"Case": "Sign up successfully", "data": data}
				return response
			else:
				return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			return Response({'error': str(e)}, status=400)


class WaysSignUpView(APIView):
	parser_classes = (MultiPartParser, FormParser)
	def post(self, request, *args, **kwargs):
		try:
			my_data = {}
			my_data['username'] = request.data.get('username')
			my_data['email'] = request.data.get('email')
			my_data['password'] = request.data.get('password')
			my_data['is_active'] = request.data.get('is_active')

			image_response = requests.get(request.data.get('avatar'), verify=False)
			
			if image_response.status_code == 200:
				image_content = image_response.content
				if image_content:
					image_file = InMemoryUploadedFile(ContentFile(image_content), None, 'image.jpg', 'image/jpeg', len(image_content), None)
					my_data['avatar'] = image_file
			
			serializer = MyModelSerializer(data=my_data)
			
			if serializer.is_valid():
				user = serializer.save()
				if user:
					UserMatchStatics.objects.create(
						player=user,
						wins=0,
						losts=0,
						level=0,
						total_xp=0,
						goals=0
					)
				response = Response()
				response.data = {"Case" : "Sign up successfully"}
				return response
			else:
				return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			return Response({'error': str(e)}, status=400)

def get_tokens_for_user(user):
	refresh = RefreshToken.for_user(user)
	return {
		'refresh': str(refresh),
		'access': str(refresh.access_token),
	}

class LoginView(APIView):
	def post(self, request, format=None):
		try:
			data = request.data
			response = Response()
			username = data.get('username', None)
			password = data.get('password', None)
			user = authenticate(username=username, password=password)
			if user is not None:
				if user.is_tfq == True:
					response.data = {"Case": "Login successfully but have tfq", "user" : user.username}
					return response
				else:
					data = get_tokens_for_user(user)
					response.set_cookie('access_token', data['access'], httponly=True)
					response.set_cookie('refresh_token', data['refresh'], httponly=True)
					response.data = {"Case": "Login successfully"}
					return response
			else:
				response.data = {"Case": "Invalid username or password!!"}
				return response
		except Exception as e:
			return Response({'error': str(e)}, status=400)


def encode_email(email):
	SECRET_KEY = os.getenv('SECRET_KEY')
	signature = hmac.new(SECRET_KEY.encode(), email.encode(), hashlib.sha256).digest()
	return base64.urlsafe_b64encode(signature).decode().rstrip("=")

def verify_email(email, signature):
	expected_signature = encode_email(email)
	return hmac.compare_digest(expected_signature, signature)

class GoogleLoginView(APIView):
	def post(self, request, format=None):
		try:
			data = request.data
			response = Response()
			email = data.get('email', None)
			signature = data.get('signature', None)
			if not email or not signature:
				response.data = {"Case" : "Missing email or signature"}
				return response
			if not verify_email(email, signature):
				response.data = {"Case" : "Invalid email signature"}
				return response
			user = customuser.objects.filter(email=email).first()
			if user is not None:
				if user.is_tfq == True:
					response.data = {"Case": "Login successfully but have tfq", "user" : user.username}
					return response
				else:
					data = get_tokens_for_user(user)
					response.set_cookie('access_token', data['access'], httponly=True)
					response.set_cookie('refresh_token', data['refresh'], httponly=True)
					response.data = {"Case" : "Login successfully"}
					return response
			else:
				response.data = {"Case" : "Invalid username or password!!"}
				return response
		except Exception as e:
			return Response({'error': str(e)}, status=400)


class CheckEmailView(APIView):
	def post(self, request, format=None):
		try:
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
		except Exception as e:
			return Response({'error': str(e)}, status=400)


class CheckUsernameView(APIView):
	def post(self, request, format=None):
		try:
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
		except Exception as e:
			return Response({'error': str(e)}, status=400)

class VerifyTokenView(APIView):
	def get(self, request, format=None):
		response = Response()
		user_id = -1
		try:
			refresh_token = request.COOKIES.get('refresh_token')
			if not refresh_token:
				response.data = {"Case" : "Invalid token"}
				return response
			decoded_token = RefreshToken(refresh_token)
			data = decoded_token.payload
			user_id = data['user_id']
		except TokenError as e:
			response.data = {"Case" : "Invalid token"}
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			return response
		try:
			token = request.COOKIES.get('access_token')
			decoded_token = AccessToken(token)
			data = decoded_token.payload
			if not data.get('user_id'):
				response.data = {"Case" : "Invalid token"}
				response.delete_cookie('access_token')
				response.delete_cookie('refresh_token')
				return response
			user = customuser.objects.filter(id=data['user_id']).first()
			if user is not None:
				serializer = MyModelSerializer(user)
				usermatchstats = UserMatchStatics.objects.filter(player=user).first()
				response.data = {"Case" : "valid token", "data" : serializer.data, "level": usermatchstats.level}
				return response
			else:
				response.data = {"Case" : "Invalid token"}
				response.delete_cookie('access_token')
				response.delete_cookie('refresh_token')
				return response
		except TokenError:
			if user_id != -1:
				user = customuser.objects.filter(id=user_id).first()
				if user is not None:
					serializer = MyModelSerializer(user)
					tokens = get_tokens_for_user(user)
					response.set_cookie('access_token', tokens['access'], httponly=True)
					usermatchstats = UserMatchStatics.objects.filter(player=user).first()
					response.data = {"Case": "Token refreshed", "data": serializer.data, "level": usermatchstats.level}
					return response
				else :
					response.data = {"Case" : "Invalid token"}
					response.delete_cookie('access_token')
					response.delete_cookie('refresh_token')
					return response
			else:
				response.data = {"Case" : "Invalid token"}
				response.delete_cookie('access_token')
				response.delete_cookie('refresh_token')
				return response


os.environ['SSL_CERT_FILE'] = certifi.where()
class ForgetPasswordView(APIView):
	def post(self, request, format=None):
		try:
			response = Response()
			email = request.data.get('email')
			random_number = random.randint(1000, 10000)
			message = 'Here is the code : ' + str(random_number)
			html_message = f'<p>Here is the code: <strong>{random_number}</strong></p>'
			send_mail(
			'Reset Password',
			message,
			'settings.EMAIL_HOST_USER',
			[email],
			fail_silently=False,
			html_message=html_message
			)
			response.data = {"Case" : "valid token", "Number" : random_number}
			return response
		except Exception as e:
			return Response({'error': str(e)}, status=400)

class ChangePasswordView(APIView):
	def post(self, request, format=None):
		try:
			data = request.data
			email = data.get('email', None)
			password = data.get('password', None)
			response = Response()
			if not email or not password:
				return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)
			try:
				user = customuser.objects.get(email=email)
			except customuser.DoesNotExist:
				return Response({"error": "No user found with this email."}, status=status.HTTP_404_NOT_FOUND)
			if user.is_active:
				try:
					user.set_password(password)
					user.save()
					response.data = {"Case": "Password successfully changed"}
					return response
				except Exception as e:
					response.data = {"Error": "Failed to change password"}
					return response
			else:
				return Response({"error": "This account is not active."}, status=status.HTTP_404_NOT_FOUND)
		except Exception as e:
			return Response({'error': str(e)}, status=400)


@api_view(['GET'])
def SignInGoogleGetUrl(request):
	try:
		response = Response()
		client_id = os.getenv('GOOGLE_SIGNIN_CLIENT_ID')
		redirect_uri = os.getenv('SIGNIN_REDIRECT_URI')
		scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
		response_type = 'code'
		auth_url = 'https://accounts.google.com/o/oauth2/auth'
		params = {
			'client_id': client_id,
			'redirect_uri': redirect_uri,
			'scope': scope,
			'response_type': response_type,
		}
		auth_url_with_params = f'{auth_url}?{urlencode(params)}'
		response.data = {'code' : auth_url_with_params}
		return response
	except Exception as e:
		return Response({'error': str(e)}, status=400)

@api_view(['GET'])
def SignInIntraGetUrl(request):
	try:
		response = Response()
		client_id = os.getenv('INTRA_SIGNIN_CLIENT_ID')
		redirect_uri = os.getenv('SIGNIN_REDIRECT_URI')
		auth_url = 'https://api.intra.42.fr/oauth/authorize'
		response_type = 'code'
		auth_url_with_params = f'{auth_url}?client_id={client_id}&redirect_uri={redirect_uri}&response_type={response_type}'
		response.data = {'code' : auth_url_with_params}
		return response
	except Exception as e:
		return Response({'error': str(e)}, status=400)

@api_view(['POST'])
def SignInGoogleGetUserData(request):
	try :
		code = request.data.get('code')
		response = Response()
		client_id = os.getenv('GOOGLE_SIGNIN_CLIENT_ID')
		redirect_uri = os.getenv('SIGNIN_REDIRECT_URI')
		client_secret = os.getenv('GOOGLE_SIGNIN_SECRET_ID')
		token_url = 'https://oauth2.googleapis.com/token'
		payload = {
			'code': code,
			'client_id': client_id,
			'client_secret': client_secret,
			'redirect_uri': redirect_uri,
			'grant_type': 'authorization_code'
		}
		headers = {
			'Content-Type': 'application/json'
		}
		response = requests.post(token_url, json=payload, headers=headers)
		response_data = json.loads(response.text)
		access_token = response_data.get('access_token')
		user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
		user_info_response = requests.get(user_info_url, headers={'Authorization': f'Bearer {access_token}'})
		user_info_data = user_info_response.json()
		user_email = user_info_data.get('email')
		user_picture = user_info_data.get('picture')
		return Response({'email': user_email, 'picture': user_picture})
	except Exception as e:
		return Response({'error': str(e)}, status=400)

@api_view(['GET'])
def SignUpGoogleGetUrl(request):
	try:
		response = Response()
		client_id = os.getenv('GOOGLE_SIGNUP_CLIENT_ID')
		redirect_uri = os.getenv('SIGNUP_REDIRECT_URI')
		scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
		response_type = 'code'
		auth_url = 'https://accounts.google.com/o/oauth2/auth'
		params = {
			'client_id': client_id,
			'redirect_uri': redirect_uri,
			'scope': scope,
			'response_type': response_type,
		}
		auth_url_with_params = f'{auth_url}?{urlencode(params)}'
		response.data = {'code' : auth_url_with_params}
		return response
	except Exception as e:
		return Response({'error': str(e)}, status=400)


@api_view(['GET'])
def SignUpIntraGetUrl(request):
	try:
		response = Response()
		client_id = os.getenv('INTRA_SIGNUP_CLIENT_ID')
		redirect_uri = os.getenv('SIGNUP_REDIRECT_URI')
		auth_url = 'https://api.intra.42.fr/oauth/authorize'
		response_type = 'code'
		auth_url_with_params = f'{auth_url}?client_id={client_id}&redirect_uri={redirect_uri}&response_type={response_type}'
		response.data = {'code' : auth_url_with_params}
		return response
	except Exception as e:
		return Response({'error': str(e)}, status=400)

@api_view(['POST'])
def SignInIntraGetUserData(request):
	try :
		code = request.data.get('code')
		response = Response()
		client_id = os.getenv('INTRA_SIGNIN_CLIENT_ID')
		client_secret = os.getenv('INTRA_SIGNIN_SECRET_ID')
		redirect_uri = os.getenv('SIGNIN_REDIRECT_URI')
		token_url = 'https://api.intra.42.fr/oauth/token'
		payload = {
			'grant_type': 'authorization_code',
			'client_id': client_id,
			'client_secret': client_secret,
			'code': code,
			'redirect_uri': redirect_uri,
		}
		headers = {
			'Content-Type': 'application/json'
		}
		response = requests.post(token_url, json=payload, headers=headers)
		response_data = json.loads(response.text)
		access_token = response_data.get('access_token')
		user_info_url = 'https://api.intra.42.fr/v2/me'
		user_info_response = requests.get(user_info_url, headers={'Authorization': f'Bearer {access_token}'})
		user_info_data = user_info_response.json()
		user_email = user_info_data.get('email')
		image = user_info_data.get('image')
		user_picture = image.get('link')
		return Response({'email': user_email, 'picture': user_picture})
	except Exception as e:
		return Response({'error': str(e)}, status=400)


@api_view(['POST'])
def SignUpGoogleGetUserData(request):
	try :
		code = request.data.get('code')
		response = Response()
		client_id = os.getenv('GOOGLE_SIGNUP_CLIENT_ID')
		redirect_uri = os.getenv('SIGNUP_REDIRECT_URI')
		client_secret = os.getenv('GOOGLE_SIGNUP_SECRET_ID')
		token_url = 'https://oauth2.googleapis.com/token'
		payload = {
			'code': code,
			'client_id': client_id,
			'client_secret': client_secret,
			'redirect_uri': redirect_uri,
			'grant_type': 'authorization_code'
		}
		headers = {
			'Content-Type': 'application/json'
		}
		response = requests.post(token_url, json=payload, headers=headers)
		response_data = json.loads(response.text)
		access_token = response_data.get('access_token')
		user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
		user_info_response = requests.get(user_info_url, headers={'Authorization': f'Bearer {access_token}'})
		user_info_data = user_info_response.json()
		user_email = user_info_data.get('email')
		user_picture = user_info_data.get('picture')
		return Response({'email': user_email, 'picture': user_picture})
	except Exception as e:
		return Response({'error': str(e)}, status=400)

@api_view(['POST'])
def SignUpIntraGetUserData(request):
	try :
		code = request.data.get('code')
		response = Response()
		client_id = os.getenv('INTRA_SIGNUP_CLIENT_ID')
		client_secret = os.getenv('INTRA_SIGNUP_SECRET_ID')
		redirect_uri = os.getenv('SIGNUP_REDIRECT_URI')
		token_url = 'https://api.intra.42.fr/oauth/token'
		payload = {
			'grant_type': 'authorization_code',
			'client_id': client_id,
			'client_secret': client_secret,
			'code': code,
			'redirect_uri': redirect_uri,
		}
		headers = {
			'Content-Type': 'application/json'
		}
		response = requests.post(token_url, json=payload, headers=headers)
		response_data = json.loads(response.text)
		access_token = response_data.get('access_token')
		user_info_url = 'https://api.intra.42.fr/v2/me'
		user_info_response = requests.get(user_info_url, headers={'Authorization': f'Bearer {access_token}'})
		user_info_data = user_info_response.json()
		user_email = user_info_data.get('email')
		image = user_info_data.get('image')
		user_picture = image.get('link')
		return Response({'email': user_email, 'picture': user_picture})
	except Exception as e:
		return Response({'error': str(e)}, status=400)

@authentication_required
@api_view(['POST'])
def LogoutView(request, **kwargs):
	try:
		response = Response()
		response.delete_cookie('access_token')
		response.delete_cookie('refresh_token')
		response.data = {"Case" : "Logout successfully"}
		return response
	except Exception as e:
		return Response({'error': str(e)}, status=400)
