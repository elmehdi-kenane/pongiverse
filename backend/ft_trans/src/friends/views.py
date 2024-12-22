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
from chat.common import user_channels
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
    
    friend_objs = Friendship.objects.filter(user=user)
    friends_ser = friendSerializer(friend_objs, many=True)

    blocked_by_objs = Friendship.objects.filter(friend=user, isBlocked=True)
    blocked_by_ser = friendSerializer(blocked_by_objs, many=True)

    sent_requests_objs = FriendRequest.objects.filter(from_user=user, status="sent")
    sent_reqs_ser = friendRequestSerializer(sent_requests_objs, many=True)

    received_requests_objs = FriendRequest.objects.filter(from_user=user, status="recieved")
    received_reqs_ser = friendRequestSerializer(received_requests_objs, many=True)

    exclude_ids = set()
    exclude_ids.update([friend_obj['friend_username'] for friend_obj in friends_ser.data])
    exclude_ids.update([blocked_obj['username'] for blocked_obj in blocked_by_ser.data])
    exclude_ids.update([req['username'] for req in sent_reqs_ser.data])
    exclude_ids.update([req['username'] for req in received_reqs_ser.data])

    suggestion_list = [user for user in user_ser_list.data if user['username'] not in exclude_ids]
    return Response(suggestion_list)

@api_view(['GET'])
def get_sent_requests(request, username):
    user = customuser.objects.get(username=username)
    sent_requests_objs = FriendRequest.objects.filter(from_user=user, status="sent")
    request_list_ser = friendRequestSerializer(sent_requests_objs, many=True)
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
                'username': from_username,
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
                'username': to_username,
                'avatar': request_ser.data['avatar'],
                'send_at': request_ser.data['send_at']
            }
        }
    )
    return Response({"success": "Friend request added successfully."})

@api_view(['POST'])
def cancel_friend_request(request):
    from_username = request.data['from_username']
    to_username = request.data['to_username']
    event_type = request.data['eventType']
    from_user = customuser.objects.get(username=from_username)
    to_user = customuser.objects.get(username=to_username)
    try:
        friend_request = FriendRequest.objects.get(from_user=from_user, to_user=to_user)
        sent_request_ser = friendRequestSerializer(friend_request)
        friend_request.delete()
        friend_request = FriendRequest.objects.get(from_user=to_user, to_user=from_user)
        recieved_request_ser = friendRequestSerializer(friend_request)
        friend_request.delete()
    except FriendRequest.DoesNotExist:
        return Response({"error": "Friend request doesn't exist."})
    from_user_id = from_user.id
    to_user_id = to_user.id
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"friends_group{from_user_id}",
        {
            'type': 'cancel_friend_request' if event_type == 'cancel' else 'remove_friend_request',
            'message': {
                'username': to_username,
                'send_at': sent_request_ser.data['send_at'],
                'avatar': sent_request_ser.data['avatar']
            }
        }
    )
    async_to_sync(channel_layer.group_send)(
        f"friends_group{to_user_id}",
        {
            'type': 'cancel_friend_request' if event_type == 'remove' else 'remove_friend_request',
            'message': {
                'username': from_username,
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
        friend_request = FriendRequest.objects.get(from_user=from_user, to_user=to_user, status="recieved")
        request_accepted_ser = friendRequestSerializer(friend_request)
        friend_request.delete()
        friend_request = FriendRequest.objects.get(from_user=to_user, to_user=from_user, status="sent")
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
            'type': 'confirm_friend_request',
            'message': {
                'friend_username': to_username,
                'send_at': request_accepted_ser.data['send_at'],
                'avatar': request_accepted_ser.data['avatar']
            }
        }
    )
    async_to_sync(channel_layer.group_send)(
        f"friends_group{to_user_id}",
        {
            'type': 'friend_request_accepted',
            'message': {
                'friend_username': from_username,
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
        friend_ser_from = friendSerializer(friendship_obj)
        friendship_obj.delete()
        friendship_obj = Friendship.objects.get(user=to_user, friend=from_user)
        friend_ser_to = friendSerializer(friendship_obj)
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
            'message': {
                'username': to_username,
                'avatar': friend_ser_from.data['avatar'],
            }
        }
    )
    async_to_sync(channel_layer.group_send)(
        f"friends_group{to_user_id}",
        {
            'type': 'remove_friendship',
            'message': {
                'username': from_username,
                'avatar': friend_ser_to.data['avatar'],
            }
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
    # async_to_sync(channel_layer.group_send)(
    #     f"friends_group{from_user_id}",
    #     {
    #         'type': 'block_friend',
    #         'message': {
    #             'friend_username': to_username,
    #             'avatar': friend_ser_from.data['avatar']
    #         }
    #     }
    # )
    
    # abdellah added this
    user_channel_names = user_channels.get(to_user.id)
    print("USER CHANNELS: ", user_channel_names)
    if user_channel_names is not None:
        for channel_name in user_channel_names:
            async_to_sync(channel_layer.send)(
                channel_name,
                {
                    'type': 'you_are_blocked',
                    'message': {
                        'id': from_user.id,
                    }
                }
            )
    #end of abdellah's addition

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
    from_user_ser = customuserSerializer(from_user)
    to_user = customuser.objects.get(username=to_username)
    try:
        friendship_obj = Friendship.objects.get(user=from_user, friend=to_user)
        friend_ser_from = friendSerializer(friendship_obj)
        friendship_obj.delete()
        friendship_obj = Friendship.objects.get(user=to_user, friend=from_user)
        if (friendship_obj.isBlocked == False):
            friendship_obj.delete()
        friend_ser_to = friendSerializer(friendship_obj)
    except Friendship.DoesNotExist:
        friendship_obj = None
    from_user_id = from_user.id
    to_user_id = to_user.id
    channel_layer = get_channel_layer()
    if (friendship_obj is not None and friendship_obj.isBlocked is True):
        print("friendship_obj is not None and friendship_obj.isBlocked is True")
        async_to_sync(channel_layer.group_send)(
            f"friends_group{from_user_id}",
            {
                'type': 'unblocker',
                'message': {
                    'friend_username': to_username,
                    'avatar': friend_ser_from.data['avatar'],
                }
            }
        )
    else:
        print("else")
        async_to_sync(channel_layer.group_send)(
            f"friends_group{from_user_id}",
            {
                'type': 'unblocker_move_to_suggestions',
                'message': {
                    'username': to_username,
                    'avatar': friend_ser_from.data['avatar'],
                }
            }
        )
        async_to_sync(channel_layer.group_send)(
            f"friends_group{to_user_id}",
            {
                'type': 'unblocked',
                'message': {
                    'username': from_username,
                    'avatar': from_user_ser.data['avatar'],
                }
            }
        )
    return Response({"success": "friend unblocked successfully."})