from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .serializers import UserSerializer
from .models import User
import jwt, datetime

@api_view(['POST'])
def signup(request):
    serializer = UserSerializer(data=request.data)
    print(serializer)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)

@api_view(['POST'])
def signin(request):
    email = request.data['email']
    password = request.data['password']
    user = User.objects.filter(email=email).first()
    if user is None:
        raise AuthenticationFailed('User not found!')
    if not user.check_password(password):
        raise AuthenticationFailed('Incorrect password')
    token = request.COOKIES.get('jwt')
    print(token)
    if token:
        response = Response()
        response.data = {
            'name': user.name
        }
        return response
    else:
        payload = {
            'id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=120),
            'iat': datetime.datetime.utcnow()
        }
        token = jwt.encode(payload, 'secret', algorithm='HS256')
        response = Response()
        response.set_cookie(key='jwt', value=token, httponly=True)
        response.data = {
            'name': user.name
        }
        return response

@api_view(['GET'])
def get(request):
    token = request.COOKIES.get('jwt')
    if not token:
        raise AuthenticationFailed('Unauthenticated')
    try:
        payload = jwt.decode(token, 'secret', algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Unauthenticated')
    user = User.objects.filter(id=payload['id']).first()
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['POST'])
def logout(request):
    response = Response()
    response.delete_cookie('jwt')
    response.data = {
        'message': 'success'
    }
    return response