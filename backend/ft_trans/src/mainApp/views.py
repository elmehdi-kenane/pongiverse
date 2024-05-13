# from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from myapp.models import customuser
from chat.models import Friends
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

import base64
import os

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

from django.http import HttpResponse

@api_view(['POST'])
def serve_image(request):
    # print(f"THE IMAGE PATH IS : {request.data['image']}")
    # response = Response()
    if (request.data).get('image'):
        with open(request.data['image'], 'rb') as image_file:
            return HttpResponse(image_file.read(), content_type='image/jpeg')