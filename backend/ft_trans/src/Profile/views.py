from django.shortcuts import render
from rest_framework.response import Response
from myapp.models import customuser
from rest_framework.decorators import api_view
from friends.models import Friendship
from myapp.models import customuser
from chat.models import Directs
from django.db.models import Q


# Create your views here.
@api_view (['GET'])
def list_users(request, username):
    users_list = [user.username for user in customuser.objects.exclude(username=username)]
    print(users_list)
    return Response(users_list)

@api_view(['POST'])
def add_users(request, username):
    print(username , "add " ,request.data['user'])
    user_to_add = request.data['user']
    sender = username
    user_add_row = customuser.objects.get(username=user_to_add)
    user_sender_row = customuser.objects.get(username=sender)
    isFriends = Friendship.objects.filter(user=user_sender_row, friend=user_add_row).exists() or \
        Friendship.objects.filter(user=user_add_row, friend=user_sender_row).exists()
    if(isFriends):
        print("already friends")
        return Response({'message':'already firends'})
    Friendship.objects.create(user=user_sender_row , friend=user_add_row)
    Friendship.objects.create(user=user_add_row , friend=user_sender_row)
    return Response({'message':'sucess'})

@api_view(['GET'])
def show_friends(request, username):
    user = customuser.objects.get(username=username)
    friends = [user_id.user.username for user_id in Friendship.objects.filter(user=user)]
    print(friends)
    return Response({"friends": friends})

def get_direct_last_message(username, friend):
    user = customuser.objects.get(username=username)
    friend = customuser.objects.get(username=friend)
    last_message = Directs.objects.filter(
        Q(sender=user, reciver=friend) | Q(sender=friend, reciver=user)
    ).order_by('-timestamp').first()
    if(last_message == None):
        return ""
    return last_message.message

@api_view(['GET'])
def friends_with_directs(request, username):
    user = customuser.objects.get(username=username)
    friends = Friendship.objects.filter(user=user)
    data = []
    for friend in friends:
        last_message = get_direct_last_message(username, friend.friend.username)
        friend_data = {
            'id' : friend.friend.id,
            'name' : friend.friend.username,
            'is_online' : friend.friend.is_online,
            'is_playing' : friend.friend.is_playing,
            'image' :friend.friend.avatar.path,
            'lastMessage' : last_message,
        }
        data.append(friend_data)
    return Response(data)

@api_view(['POST'])
def get_user_info(request):
    username = request.data.get('user')
    response = Response()
    user = customuser.objects.filter(username=username).first()
    if user is not None:
        response.data = {'username': user.username, 'level':2, 'avatar': user.avatar.path}
        return response
