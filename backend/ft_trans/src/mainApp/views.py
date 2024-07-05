# from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from myapp.models import customuser
from chat.models import Friends
from .models import Tournament
import random
from myapp.serializers import MyModelSerializer
# from rest_framework.exceptions import AuthenticationFailed
# from .serializers import UserSerializer
# from .models import User
# import jwt, datetime

# @api_view(['POST'])
# def signup(request):
#     serializer = UserSerializer(data=request.data)
#     print(serializer)
#     serializer.is_valid(raise_exception=True)
#     serializer.save()
#     return Response(serializer.data)

# @api_view(['POST'])
# def signin(request):
#     email = request.data['email']
#     password = request.data['password']
#     user = User.objects.filter(email=email).first()
#     if user is None:
#         raise AuthenticationFailed('User not found!')
#     if not user.check_password(password):
#         raise AuthenticationFailed('Incorrect password')
#     token = request.COOKIES.get('jwt')
#     print(token)
#     if token:
#         response = Response()
#         response.data = {
#             'name': user.name
#         }
#         return response
#     else:
#         payload = {
#             'id': user.id,
#             'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=120),
#             'iat': datetime.datetime.utcnow()
#         }
#         token = jwt.encode(payload, 'secret', algorithm='HS256')
#         response = Response()
#         response.set_cookie(key='jwt', value=token, httponly=True)
#         response.data = {
#             'name': user.name
#         }
#         return response

# @api_view(['GET'])
# def get(request):
#     token = request.COOKIES.get('jwt')
#     if not token:
#         raise AuthenticationFailed('Unauthenticated')
#     try:
#         payload = jwt.decode(token, 'secret', algorithms=['HS256'])
#     except jwt.ExpiredSignatureError:
#         raise AuthenticationFailed('Unauthenticated')
#     user = User.objects.filter(id=payload['id']).first()
#     serializer = UserSerializer(user)
#     return Response(serializer.data)

# @api_view(['POST'])
# def logout(request):
#     response = Response()
#     response.delete_cookie('jwt')
#     response.data = {
#         'message': 'success'
#     }
#     return response

from django.http import HttpResponse
import base64
import os
from .models import GameNotifications
from mimetypes import guess_type

@api_view(['POST'])
def online_friends(request):
	username = request.data['user']
	print(f'user is {username}')
	user = customuser.objects.get(username=username)
	allFriends = []
	for user_id in Friends.objects.filter(user=user):
		if user_id.friend.is_online and not user_id.friend.is_playing: ####################  and user_id.friend.is_playing
			image_path = user_id.friend.avatar.path
			# with open(image_path, 'rb') as image_file:
				# encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
			allFriends.append({'id': user_id.friend.id, 'name': user_id.friend.username, 'level': 2, 'image': image_path})
		# print(f'friends are {friends}')
	return Response({'message': allFriends})

@api_view(['POST'])
def notifs_friends(request):
	username = request.data['user']
	print(f'user is {username}')
	target = customuser.objects.get(username=username)
	allNotifs = []
	for gameNotif in GameNotifications.objects.filter(target=target):
		# print(f'ROOM_ID WHEN FETCHING IS : {gameNotif.room_id}')
		allNotifs.append({'user': gameNotif.user.username, 'avatar': gameNotif.user.avatar.path, 'roomID': gameNotif.active_match.room_id})
	return Response({'message': allNotifs})


@api_view(['POST'])
def serve_image(request):
	if (request.data).get('image'):
		print("the image url: ", request.data['image'])
		with open(request.data['image'], 'rb') as image_file:
			content_type = guess_type(request.data['image'])
			return HttpResponse(image_file.read(), content_type=content_type)

@api_view(['POST'])
def get_user(request):
	data = request.data
	username = data.get('uname')
	user = customuser.objects.filter(username=username).first()
	if user is not None:
		response = Response()
		response.data = {'id' : user.id, 'name' : user.username, 'level' : 2, 'image' : user.avatar.path}
		return response

@api_view(['GET'])
def create_tournament(request):
	response = Response()
	while True:
		random_number = random.randint(1000000000, 10000000000)
		tournament = Tournament.objects.filter(tournament_id=random_number).first()
		if tournament is None:
			break
	response.data = {'tournament_id' : random_number}
	return response

	if (request.data).get('image'):
		with open(request.data['image'], 'rb') as image_file:
			return HttpResponse(image_file.read(), content_type='image/jpeg')

@api_view(['POST'])
def user_image(request):
	username = (request.data).get('user')
	if not username:
		print("no user is here")
		return Response({'message': 'no username is here'})
	user = customuser.objects.filter(username=username).first()
	if user:
		image_path = user.avatar.path
		if image_path:
			with open(image_path, 'rb') as image_file:
				return HttpResponse(image_file.read(), content_type='image/jpeg')
	else:
		return Response({'message': 'user not exit in the database'})
