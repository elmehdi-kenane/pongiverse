from django.shortcuts import render
from myapp.models import customuser
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import FriendRequest
from .models import Friendship
from .serializers import friendRequestSerializer
from .serializers import getFriendListSerializer
from myapp.serializers import MyModelSerializer

# @api_view(['GET'])
# def friend_requests(request):
#     friend_requests = FriendRequest.objects.all()
#     serializer = friendRequestSerializer(friend_requests, many=True)
#     return Response(serializer.data)

@api_view(['GET'])
def get_friend_list(request, username):
    user = customuser.objects.filter(username=username).first()
    friend_objs = Friendship.objects.filter(user=user, isBlocked=False)
    serializer = getFriendListSerializer(friend_objs, many=True)
    friend_id_list = list(set([d['friend'] for d in serializer.data]))
    friend_usernames = []
    for friend_id in friend_id_list:
        friend = customuser.objects.get(id=friend_id)
        friend_usernames.append(friend.username)
    return Response(friend_usernames)

@api_view(['GET'])
def get_blocked_list(request, username):
    user = customuser.objects.get(username=username)
    blocked_objs = Friendship.objects.filter(user=user, isBlocked=True)
    blocked_list_ser = getFriendListSerializer(blocked_objs, many=True)
    blocked_list = list(set(d['friend'] for d in blocked_list_ser.data))
    blocked_usernames = []
    for blocked_id in blocked_list:
        blocked = customuser.objects.get(id=blocked_id)
        print("blocked.username")
        print(blocked.username)
        print("blocked.username")
        blocked_usernames.append(blocked.username)
    return Response(blocked_usernames)


@api_view(['GET'])
def get_friend_suggestions(request, username):
    user_ser_list = MyModelSerializer(customuser.objects.all(), many=True)
    user_list = list(set([d['username'] for d in user_ser_list.data if d['username'] != username]))
    return Response(user_list)

@api_view(['GET'])
def get_sent_requests(request, username):
    user = customuser.objects.get(username=username)
    sent_requests_objs = FriendRequest.objects.filter(from_user=user, status="sent")
    request_list_ser = friendRequestSerializer(sent_requests_objs, many=True)
    sent_request_list = list(set(d['to_user'] for d in request_list_ser.data))
    sent_request_usernames = []
    for sent_request_id in sent_request_list:
        sent_request = customuser.objects.get(id=sent_request_id)
        sent_request_usernames.append(sent_request.username)
    return Response(sent_request_usernames)

@api_view(['GET'])
def get_recieved_requests(request, username):
    user = customuser.objects.get(username=username)
    recieved_requests_objs = FriendRequest.objects.filter(from_user=user, status="recieved")
    request_list_ser = friendRequestSerializer(recieved_requests_objs, many=True)
    recieved_request_list = list(set(d['to_user'] for d in request_list_ser.data))
    recieved_request_usernames = []
    for recieved_request_id in recieved_request_list:
        recieved_request = customuser.objects.get(id=recieved_request_id)
        recieved_request_usernames.append(recieved_request.username)
    return Response(recieved_request_usernames)

@api_view(['POST'])
def add_friend_request(request):
    from_username = request.data['from_username']
    to_username = request.data['to_username']
    from_user = customuser.objects.get(username=from_username)
    to_user = customuser.objects.get(username=to_username)
    try:
        FriendRequest.objects.get(from_user=from_user, to_user=to_user)
        FriendRequest.objects.get(from_user=to_user, to_user=from_user)
        return Response({"Error": "Friend request already exist."})
    except FriendRequest.DoesNotExist:
        FriendRequest.objects.create(from_user=from_user, to_user=to_user, status="sent")
        FriendRequest.objects.create(from_user=to_user, to_user=from_user, status="recieved")
    return Response({"success": "Friend request added successfully."})

@api_view(['POST'])
def cancel_friend_request(request):
    from_username = request.data['from_username']
    to_username = request.data['to_username']
    from_user = customuser.objects.get(username=from_username)
    to_user = customuser.objects.get(username=to_username)
    try:
        friend_request = FriendRequest.objects.get(from_user=from_user, to_user=to_user, status="sent")
        friend_request.delete()
        friend_request = FriendRequest.objects.get(from_user=to_user, to_user=from_user, status="recieved")
        friend_request.delete()
    except FriendRequest.DoesNotExist:
        return Response({"error": "Friend request doesn't exist."})
    return Response({"success": "Friend request deleted successfully."})

@api_view(['POST'])
def confirm_friend_request(request):
    from_username = request.data['from_username']
    to_username = request.data['to_username']
    from_user = customuser.objects.get(username=from_username)
    to_user = customuser.objects.get(username=to_username)
    try:
        friend_request = FriendRequest.objects.get(from_user=from_user, to_user=to_user, status="sent")
        friend_request.delete()
        friend_request = FriendRequest.objects.get(from_user=to_user, to_user=from_user, status="recieved")
        friend_request.delete()
    except FriendRequest.DoesNotExist:
        return Response({"error": "Friend request doesn't exist."})
    try:
        Friendship.objects.get(user=from_user, friend=to_user)
        Friendship.objects.get(user=to_user, friend=from_user)
        return Response({"Error": "Friend request already exist."})
    except Friendship.DoesNotExist:
        # do I really need to have two objects
        Friendship.objects.create(user=from_user, friend=to_user)
        Friendship.objects.create(user=to_user, friend=from_user)
    return Response({"success": "Friendship created successfully."})