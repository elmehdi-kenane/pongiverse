from django.shortcuts import render
from myapp.models import customuser
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
# Create your views here.
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import FriendRequest
from .models import Friendship
from .serializers import friendRequestSerializer
from .serializers import friendSerializer
from .serializers import customuserSerializer

@api_view(['GET'])
def get_friend_list(request, username):
    user = customuser.objects.filter(username=username).first()
    friend_objs = Friendship.objects.filter(user=user, isBlocked=False)
    friends_ser = friendSerializer(friend_objs, many=True)
    return Response(friends_ser.data)

@api_view(['GET'])
def get_blocked_list(request, username):
    user = customuser.objects.filter(username=username).first()
    blocked_objs = Friendship.objects.filter(user=user, isBlocked=True)
    blocked_list_ser = friendSerializer(blocked_objs, many=True)
    return Response(blocked_list_ser.data)


@api_view(['GET'])
def get_friend_suggestions(request, username):
    user = customuser.objects.filter(username=username).first()
    
    user_objs = customuser.objects.exclude(username=user.username)
    user_ser_list = customuserSerializer(user_objs, many=True)
    #print("user_ser_list.data")
    #print(user_ser_list.data)
    
    friend_objs = Friendship.objects.filter(user=user)
    friends_ser = friendSerializer(friend_objs, many=True)
    #print("friends_ser.data")
    #print(friends_ser.data)

    sent_requests_objs = FriendRequest.objects.filter(from_user=user, status="sent")
    sent_reqs_ser = friendRequestSerializer(sent_requests_objs, many=True)
    #print("sent_reqs_ser.data")
    #print(sent_reqs_ser.data)

    received_requests_objs = FriendRequest.objects.filter(to_user=user, status="recieved")
    received_reqs_ser = friendRequestSerializer(received_requests_objs, many=True)
    #print("received_reqs_ser.data")
    #print(received_reqs_ser.data)

    exclude_ids = set()
    exclude_ids.update([friend['second_username'] for friend in friends_ser.data])
    exclude_ids.update([req['second_username'] for req in sent_reqs_ser.data])
    exclude_ids.update([req['second_username'] for req in received_reqs_ser.data])

    suggestion_list = [user for user in user_ser_list.data if user['username'] not in exclude_ids]
    #print("suggestion_list")
    #print(suggestion_list)
    return Response(suggestion_list)

@api_view(['GET'])
def get_sent_requests(request, username):
    user = customuser.objects.get(username=username)
    sent_requests_objs = FriendRequest.objects.filter(from_user=user, status="sent")
    request_list_ser = friendRequestSerializer(sent_requests_objs, many=True)
    # #print(request_list_ser.data)
    return Response(request_list_ser.data)

@api_view(['GET'])
def get_recieved_requests(request, username):
    user = customuser.objects.get(username=username)
    recieved_requests_objs = FriendRequest.objects.filter(from_user=user, status="recieved")
    request_list_ser = friendRequestSerializer(recieved_requests_objs, many=True)
    return Response(request_list_ser.data)

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
    channel_layer = get_channel_layer()
    FriendReqObj = FriendRequest.objects.get(from_user=to_user, to_user=from_user)
    request_ser = friendRequestSerializer(FriendReqObj)
    to_user_id = to_user.id
    async_to_sync(channel_layer.group_send)(
        f"friends_group{to_user_id}",
        {
            'type': 'recieve_friend_request',
            'message': {
                'second_username': from_username,
                'send_at': request_ser.data['send_at'],
                'avatar': request_ser.data['avatar']
            }
        }
    )
    FriendReqObj = FriendRequest.objects.get(from_user=from_user, to_user=to_user)
    request_ser = friendRequestSerializer(FriendReqObj)
    from_user_id = from_user.id
    async_to_sync(channel_layer.group_send)(
        f"friends_group{from_user_id}",
        {
            'type': 'send_friend_request',
            'message': {
                'second_username': to_username,
                'avatar': request_ser.data['avatar'],
                'send_at': request_ser.data['send_at']
            }
        }
    )
    #print(f"++++++++++++++ Friend request sent ++++++++++++++")
    return Response({"success": "Friend request added successfully."})

@api_view(['POST'])
def cancel_friend_request(request):
    from_username = request.data['from_username']
    to_username = request.data['to_username']
    from_user = customuser.objects.get(username=from_username)
    to_user = customuser.objects.get(username=to_username)
    try:
        friend_request = FriendRequest.objects.get(from_user=from_user, to_user=to_user, status="sent")
        sent_request_ser = friendRequestSerializer(friend_request)
        #print(sent_request_ser.data)
        friend_request.delete()
        friend_request = FriendRequest.objects.get(from_user=to_user, to_user=from_user, status="recieved")
        recieved_request_ser = friendRequestSerializer(friend_request)
        #print(recieved_request_ser.data)
        friend_request.delete()
    except FriendRequest.DoesNotExist:
        return Response({"error": "Friend request doesn't exist."})
    from_user_id = from_user.id
    to_user_id = to_user.id
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"friends_group{from_user_id}",
        {
            'type': 'cancel_friend_request',
            'message': {
                'second_username': to_username,
                'send_at': sent_request_ser.data['send_at'],
                'avatar': sent_request_ser.data['avatar']
            }
        }
    )
    async_to_sync(channel_layer.group_send)(
        f"friends_group{to_user_id}",
        {
            'type': 'remove_friend_request',
            'message': {
                'second_username': from_username,
                'send_at': recieved_request_ser.data['send_at'],
                'avatar': recieved_request_ser.data['avatar']
            }
        }
    )
    return Response({"success": "Friend request deleted successfully."})

@api_view(['POST'])
def confirm_friend_request(request):
    from_username = request.data['from_username']
    to_username = request.data['to_username']
    from_user = customuser.objects.get(username=from_username)
    to_user = customuser.objects.get(username=to_username)
    try:
        friend_request = FriendRequest.objects.get(from_user=from_user, to_user=to_user, status="sent")
        request_accepted_ser = friendRequestSerializer(friend_request)
        friend_request.delete()
        friend_request = FriendRequest.objects.get(from_user=to_user, to_user=from_user, status="recieved")
        confirm_request_ser = friendRequestSerializer(friend_request)
        friend_request.delete() 
    except FriendRequest.DoesNotExist:
        return Response({"error": "Friend request doesn't exist."})
    try:
        Friendship.objects.get(user=from_user, friend=to_user)
        Friendship.objects.get(user=to_user, friend=from_user)
        return Response({"Error": "Friend request already exist."})
    except Friendship.DoesNotExist:
        Friendship.objects.create(user=from_user, friend=to_user)
        Friendship.objects.create(user=to_user, friend=from_user)
    from_user_id = from_user.id
    to_user_id = to_user.id
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"friends_group{from_user_id}",
        {
            'type': 'friend_request_accepted',
            'message': {
                'second_username': to_username,
                'send_at': request_accepted_ser.data['send_at'],
                'avatar': request_accepted_ser.data['avatar']
            }
        }
    )
    async_to_sync(channel_layer.group_send)(
        f"friends_group{to_user_id}",
        {
            'type': 'confirm_friend_request',
            'message': {
                'second_username': from_username,
                'send_at': confirm_request_ser.data['send_at'],
                'avatar': confirm_request_ser.data['avatar']
            }
        }
    )
    return Response({"success": "Friendship created successfully."})

@api_view(['POST'])
def remove_friendship(request):
    from_username = request.data['from_username']
    to_username = request.data['to_username']
    from_user = customuser.objects.get(username=from_username)
    to_user = customuser.objects.get(username=to_username)
    try:
        friendship_obj = Friendship.objects.get(user=from_user, friend=to_user)
        friendship_obj.delete()
        friendship_obj = Friendship.objects.get(user=to_user, friend=from_user)
        friendship_obj.delete()
    except Friendship.DoesNotExist:
        return Response({"error": "Friend relation doesn't exist."})
    from_user_id = from_user.id
    to_user_id = to_user.id
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"friends_group{from_user_id}",
        {
            'type': 'remove_friendship',
            'message': to_username
        }
    )
    async_to_sync(channel_layer.group_send)(
        f"friends_group{to_user_id}",
        {
            'type': 'remove_friendship',
            'message': from_username
        }
    )
    return Response({"success": "Friendship removed successfully."})

@api_view(['POST'])
def block_friend(request):
    from_username = request.data['from_username']
    to_username = request.data['to_username']
    from_user = customuser.objects.get(username=from_username)
    to_user = customuser.objects.get(username=to_username)
    try:
        friendship_obj = Friendship.objects.get(user=from_user, friend=to_user)
        friend_ser_from = friendSerializer(friendship_obj)
        friendship_obj.isBlocked = True
        friendship_obj.save()
        # friendship_obj = Friendship.objects.get(user=to_user, friend=from_user)
        # friendship_obj.isBlocked = True
        # friend_ser_to = friendSerializer(friendship_obj)
        # friendship_obj.save()
    except Friendship.DoesNotExist:
        return Response({"error": "Friend relation doesn't exist."})
    from_user_id = from_user.id
    # to_user_id = to_user.id
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"friends_group{from_user_id}",
        {
            'type': 'block_friend',
            'message': {
                'second_username': to_username,
                'avatar': friend_ser_from.data['avatar']
            }
        }
    )
    # async_to_sync(channel_layer.group_send)(
    #     f"friends_group{to_user_id}",
    #     {
    #         'type': 'block_friend',
    #         'message': {
    #             'second_username': from_username,
    #             'avatar': friend_ser_to.data['avatar']
    #         }
    #     }
    # )
    return Response({"success": "friend blocked successfully."})

@api_view(['POST'])
def unblock_friend(request):
    from_username = request.data['from_username']
    to_username = request.data['to_username']
    from_user = customuser.objects.get(username=from_username)
    to_user = customuser.objects.get(username=to_username)
    try:
        friendship_obj = Friendship.objects.get(user=from_user, friend=to_user)
        friendship_obj.isBlocked = False
        friendship_obj.save()
        friend_ser_from = friendSerializer(friendship_obj)
        friendship_obj = Friendship.objects.get(user=to_user, friend=from_user)
        friendship_obj.isBlocked = False
        friendship_obj.save()
        friend_ser_to = friendSerializer(friendship_obj)
    except Friendship.DoesNotExist:
        return Response({"error": "Friend relation doesn't exist."})
    from_user_id = from_user.id
    to_user_id = to_user.id
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"friends_group{from_user_id}",
        {
            'type': 'unblock_friend',
            'message': {
                'second_username': to_username,
                'avatar': friend_ser_from.data['avatar']
            }
        }
    )
    async_to_sync(channel_layer.group_send)(
        f"friends_group{to_user_id}",
        {
            'type': 'unblock_friend',
            'message': {
                'second_username': from_username,
                'avatar': friend_ser_to.data['avatar']
            }
        }
    )
    return Response({"success": "friend unblocked successfully."})