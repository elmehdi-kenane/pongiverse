from django.shortcuts import render
from rest_framework.response import Response
from myapp.models import customuser
from rest_framework.decorators import api_view
from chat.models import Friends

# Create your views here.
@api_view (['GET'])
def list_users(request, username):
    # all_users = customuser.objects.exclude(username=username)
    # # Extract usernames from the queryset
    # users_list = list(all_users.values_list('username'))
    users_list = [user.username for user in customuser.objects.exclude(username=username)]
    print(users_list)
    # response = Response()
    # response = {'data': all_users}
    return Response(users_list)

@api_view(['POST'])
def add_users(request, username):
    print(request.data)
    user_to_add = request.data['user']
    sender = username
    user_add_row = customuser.objects.get(username=user_to_add)
    user_sender_row = customuser.objects.get(username=sender)
    Friends.objects.create(user=user_sender_row , friend=user_add_row)
    return Response({'message':'sucess'})