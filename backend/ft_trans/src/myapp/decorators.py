from django.http import JsonResponse
from functools import wraps
from rest_framework.response import Response
from .models import customuser
from rest_framework_simplejwt.tokens import RefreshToken, TokenError, AccessToken

def get_tokens_for_user(user):
	refresh = RefreshToken.for_user(user)
	return {
		'refresh': str(refresh),
		'access': str(refresh.access_token),
	}

def authentication_required(view_func):
	@wraps(view_func)
	def _wrapped_view(request, *args, **kwargs):
		user_id = -1
		try:
			refresh_token = request.COOKIES.get('refresh_token')
			if not refresh_token:
				print("************HNA 1")
				response = JsonResponse({"Case": "Invalid token"})
				response.delete_cookie('access_token')
				response.delete_cookie('refresh_token')
				return response
			decoded_token = RefreshToken(refresh_token)
			data = decoded_token.payload
			user_id = data['user_id']
		except TokenError:
			print("************HNA 2")
			response = JsonResponse({"Case": "Invalid token"})
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			return response

		try:
			token = request.COOKIES.get('access_token')
			decoded_token = AccessToken(token)
			# Proceed with the view if the access token is valid
			return view_func(request, *args, **kwargs)
		except TokenError:
			if user_id != -1:
				user = customuser.objects.filter(id=user_id).first()
				if user is not None:
					tokens = get_tokens_for_user(user)
					response = view_func(request, *args, **kwargs)
					response.set_cookie('access_token', tokens['access'], httponly=True)
					return response
			print("************HNA 3")
			response = JsonResponse({"Case": "Invalid token"})
			response.delete_cookie('access_token')
			response.delete_cookie('refresh_token')
			return response
	return _wrapped_view
