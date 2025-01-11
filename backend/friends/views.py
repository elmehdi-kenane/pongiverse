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
from myapp.decorators import authentication_required
from mainApp.common import user_channels
from django.db.models import Q

@authentication_required
@api_view(['GET'])
def get_friend_list(request, **kwargs):
    try:
        user_id = kwargs.get("user_id")
        user = customuser.objects.filter(id=user_id).first()
    except customuser.DoesNotExist:
        return Response({"error": "user not found"}, status=400)
    friend_objs = Friendship.objects.filter(user=user, block_status=Friendship.BLOCK_NONE)
    friends_ser = friendSerializer(friend_objs, many=True)
    return Response(friends_ser.data)

@authentication_required
@api_view(['GET'])
def get_blocked_list(request, **kwargs):
    try:
        user_id = kwargs.get("user_id")
        user = customuser.objects.filter(id=user_id).first()
    except customuser.DoesNotExist:
        return Response({"error": "user not found"}, status=400)
    blocked_objs = Friendship.objects.filter(user=user, block_status=Friendship.BLOCKER)
    blocked_list_ser = friendSerializer(blocked_objs, many=True)
    return Response(blocked_list_ser.data)

@authentication_required
@api_view(['GET'])
def get_friend_suggestions(request, **kwargs):
    try:
        user_id = kwargs.get("user_id")
        user = customuser.objects.filter(id=user_id).first()
    except customuser.DoesNotExist:
        return Response({"error": "user not found"}, status=400)
    user_objs = customuser.objects.exclude(username=user.username)
    user_ser_list = customuserSerializer(user_objs, many=True)

    friend_objs = Friendship.objects.filter(user=user)
    friends_ser = friendSerializer(friend_objs, many=True)

    sent_requests_objs = FriendRequest.objects.filter(from_user=user, status="sent")
    sent_reqs_ser = friendRequestSerializer(sent_requests_objs, many=True)

    received_requests_objs = FriendRequest.objects.filter(from_user=user, status="received")
    received_reqs_ser = friendRequestSerializer(received_requests_objs, many=True)

    exclude_ids = set()
    exclude_ids.update([friend_obj['second_username'] for friend_obj in friends_ser.data])
    exclude_ids.update([req['second_username'] for req in sent_reqs_ser.data])
    exclude_ids.update([req['second_username'] for req in received_reqs_ser.data])

    suggestion_list = [user for user in user_ser_list.data if user['second_username'] not in exclude_ids]
    return Response(suggestion_list)

@authentication_required
@api_view(['GET'])
def get_sent_requests(request, **kwargs):
    try:
        user_id = kwargs.get("user_id")
        user = customuser.objects.filter(id=user_id).first()
    except customuser.DoesNotExist:
        return Response({"error": "user not found"}, status=400)
    sent_requests_objs = FriendRequest.objects.filter(from_user=user, status="sent")
    request_list_ser = friendRequestSerializer(sent_requests_objs, many=True)
    # ##printrequest_list_ser.data)
    return Response(request_list_ser.data)

@authentication_required
@api_view(['GET'])
def get_received_requests(request, **kwargs):
    try:
        user_id = kwargs.get("user_id")
        user = customuser.objects.filter(id=user_id).first()
    except customuser.DoesNotExist:
        return Response({"error": "user not found"}, status=400)
    received_requests_objs = FriendRequest.objects.filter(from_user=user, status="received")
    request_list_ser = friendRequestSerializer(received_requests_objs, many=True)
    return Response(request_list_ser.data)

@authentication_required
@api_view(['POST'])
def add_friend_request(request, **kwargs):
    try:
        user_id = kwargs.get("user_id")
        from_user = customuser.objects.filter(id=user_id).first()
    except customuser.DoesNotExist:
        return Response({"error": "user not found"}, status=400)
    to_username = request.data.get('to_username')
    to_user = customuser.objects.filter(username=to_username).first()

    if to_user:
        if from_user == to_user:
            return Response(data={"error": "You can't send friend request to yourself!"}, status=status.HTTP_400_BAD_REQUEST)
        if Friendship.objects.filter(Q(block_status='blocked') | Q(block_status='blocker'), user=from_user, friend=to_user).exists():
            return Response(data={"error": "The user is blocked!"}, status=status.HTTP_400_BAD_REQUEST)

        if Friendship.objects.filter(user=from_user, friend=to_user).exists():
            return Response(data={"error": "Friendship already exist"}, status=status.HTTP_400_BAD_REQUEST)
        
        elif not FriendRequest.objects.filter(from_user=from_user, to_user=to_user).exists() and not FriendRequest.objects.filter(from_user=to_user, to_user=from_user).exists():
            FriendRequest.objects.create(from_user=from_user, to_user=to_user, status="sent")
            FriendRequest.objects.create(from_user=to_user, to_user=from_user, status="received")
        else:
            return Response({"Error": "Friend request already exist."}, status=status.HTTP_400_BAD_REQUEST)

        channel_layer = get_channel_layer()
        FriendReqObj = FriendRequest.objects.get(from_user=to_user, to_user=from_user)
        request_ser = friendRequestSerializer(FriendReqObj)
        to_user_id = to_user.id
        async_to_sync(channel_layer.group_send)(
            f"friends_group{to_user_id}",
            {
                'type': 'receive_friend_request',
                'message': {
                    'second_username': from_user.username,
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
        ##printf"++++++++++++++ Friend request sent ++++++++++++++")
        return Response({"success": "Friend request added successfully."})
    
    return Response(data={'error': 'Error sending friend request!'}, status=status.HTTP_400_BAD_REQUEST)

@authentication_required
@api_view(['POST'])
def cancel_friend_request(request, **kwargs):
    try:
        user_id = kwargs.get("user_id")
        from_user = customuser.objects.filter(id=user_id).first()
    except customuser.DoesNotExist:
        return Response({"error": "user not found"}, status=400)
    to_username = request.data.get('to_username')
    to_user = customuser.objects.filter(username=to_username).first()

    if to_user:
        if from_user == to_user:
            return Response({"Error": "You can't cancel yourself."}, status=status.HTTP_400_BAD_REQUEST)
        if Friendship.objects.filter(Q(block_status='blocked') | Q(block_status='blocker'), user=from_user, friend=to_user).exists():
            return Response(data={"error": "You can't cancel a blocked user!"}, status=status.HTTP_400_BAD_REQUEST)
        if Friendship.objects.filter(user=from_user, friend=to_user).exists():
            return Response(data={"error": "Friendship already exist"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            friend_request = FriendRequest.objects.get(from_user=from_user, to_user=to_user)
            sent_request_ser = friendRequestSerializer(friend_request)
            friend_request.delete()
            friend_request = FriendRequest.objects.get(from_user=to_user, to_user=from_user)
            received_request_ser = friendRequestSerializer(friend_request)
            friend_request.delete()
        except FriendRequest.DoesNotExist:
            return Response({"Error": "Friend request does not exist."}, status=status.HTTP_400_BAD_REQUEST)
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
                    'avatar': sent_request_ser.data['avatar'],
                    'level': sent_request_ser.data['level']
                }
            }
        )
        async_to_sync(channel_layer.group_send)(
            f"friends_group{to_user_id}",
            {
                'type': 'cancel_friend_request',
                'message': {
                    'second_username': from_user.username,
                    'send_at': received_request_ser.data['send_at'],
                    'avatar': received_request_ser.data['avatar'],
                    'level': received_request_ser.data['level']
                }
            }
        )
        return Response({"success": "Friend request deleted successfully."})
    return Response(data={'error': 'Error canceling friend request!'}, status=status.HTTP_400_BAD_REQUEST)

@authentication_required
@api_view(['POST'])
def confirm_friend_request(request, **kwargs):
    try:
        user_id = kwargs.get("user_id")
        from_user = customuser.objects.filter(id=user_id).first()
    except customuser.DoesNotExist:
        return Response({"error": "user not found"}, status=400)
    to_username = request.data.get('to_username')
    to_user = customuser.objects.filter(username=to_username).first()
    if to_user:
        if from_user == to_user:
            return Response({"Error": "You can't confirm yourself."}, status=status.HTTP_400_BAD_REQUEST)
        if Friendship.objects.filter(Q(block_status='blocked') | Q(block_status='blocker'), user=from_user, friend=to_user).exists():
            return Response(data={"error": "You can't confirm a blocked user!"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            friend_request = FriendRequest.objects.get(from_user=from_user, to_user=to_user, status="received")
            request_accepted_ser = friendRequestSerializer(friend_request)
            friend_request.delete()
            friend_request = FriendRequest.objects.get(from_user=to_user, to_user=from_user, status="sent")
            confirm_request_ser = friendRequestSerializer(friend_request)
            friend_request.delete() 
        except FriendRequest.DoesNotExist:
            return Response({"error": "Friend request doesn't exist."}, status=status.HTTP_400_BAD_REQUEST)
        # To be checked --------------------
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
                    'friend_id': to_user_id,
                    'second_username': to_username,
                    'send_at': request_accepted_ser.data['send_at'],
                    'avatar': request_accepted_ser.data['avatar'],
                    'is_online': request_accepted_ser.data['is_online']
                }
            }
        )
        async_to_sync(channel_layer.group_send)(
            f"friends_group{to_user_id}",
            {
                'type': 'friend_request_accepted',
                'message': {
                    'friend_id': from_user_id,
                    'second_username': from_user.username,
                    'send_at': confirm_request_ser.data['send_at'],
                    'avatar': confirm_request_ser.data['avatar'],
                    'is_online': confirm_request_ser.data['is_online']
                }
            }
        )
        return Response({"success": "Friendship created successfully."})
    return Response(data={'error': 'Error confirming friend request!'}, status=status.HTTP_400_BAD_REQUEST)

@authentication_required
@api_view(['POST'])
def remove_friendship(request, **kwargs):
    try:
        user_id = kwargs.get("user_id")
        from_user = customuser.objects.filter(id=user_id).first()
    except customuser.DoesNotExist:
        return Response({"error": "user not found"}, status=400)
    to_username = request.data.get('to_username')
    to_user = customuser.objects.filter(username=to_username).first()
    if to_user:
        if from_user == to_user:
            return Response({"Error": "You can't remove yourself."}, status=status.HTTP_400_BAD_REQUEST)
        if Friendship.objects.filter(Q(block_status='blocked') | Q(block_status='blocker'), user=from_user, friend=to_user).exists():
            return Response(data={"error": "You can't remove a blocked user!"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            friendship_obj = Friendship.objects.get(user=from_user, friend=to_user)
            friendship_obj_from_ser = friendSerializer(friendship_obj)
            friendship_obj.delete()
            friendship_obj = Friendship.objects.get(user=to_user, friend=from_user)
            friendship_obj_to_ser = friendSerializer(friendship_obj)
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
                    'second_username': to_username,
                    'avatar': friendship_obj_from_ser.data['avatar'],
                    'level': friendship_obj_from_ser.data['level']
                }
            }
        )
        async_to_sync(channel_layer.group_send)(
            f"friends_group{to_user_id}",
            {
                'type': 'remove_friendship',
                'message': {
                    'second_username': from_user.username,
                    'avatar': friendship_obj_to_ser.data['avatar'],
                    'level': friendship_obj_to_ser.data['level']
                }
            }
        )
        to_user_channel_name = user_channels.get(to_user_id).channel_name  if to_user_id in user_channels else None
        if to_user_channel_name:
            async_to_sync(channel_layer.send)(
                to_user_channel_name,
                {
                    'type': 'remove_friendship',
                    'message': {
                        'second_username': from_user.username,
                    }
                }
            )
        return Response({"success": "Friendship removed successfully."})
    return Response(data={'error': 'Error removing friend request!'}, status=status.HTTP_400_BAD_REQUEST)

@authentication_required
@api_view(['POST'])
def block_friend(request, **kwargs):
    try:
        user_id = kwargs.get("user_id")
        from_user = customuser.objects.filter(id=user_id).first()
    except customuser.DoesNotExist:
        return Response({"error": "user not found"}, status=400)
    to_username = request.data.get('to_username')
    to_user = customuser.objects.filter(username=to_username).first()
    if to_user:
        if from_user == to_user:
            return Response({"Error": "You can't block yourself."}, status=status.HTTP_400_BAD_REQUEST)
        if Friendship.objects.filter(Q(block_status='blocked') | Q(block_status='blocker'), user=from_user, friend=to_user).exists():
            return Response(data={"error": "You can't block a blocked user!"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            friendship_obj = Friendship.objects.get(user=from_user, friend=to_user)
            friend_ser_from = friendSerializer(friendship_obj)
            friendship_obj.block_status = Friendship.BLOCKER
            friendship_obj.save()
            friendship_obj = Friendship.objects.get(user=to_user, friend=from_user)
            friendship_obj.block_status = Friendship.BLOCKED
            friend_ser_to = friendSerializer(friendship_obj)
            friendship_obj.save()
        except Friendship.DoesNotExist:
            return Response({"error": "Friend relation doesn't exist."})
        from_user_id = from_user.id
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"friends_group{from_user_id}",
            {
                'type': 'blocker_friend',
                'message': {
                    'second_username': to_username,
                    'avatar': friend_ser_from.data['avatar']
                }
            }
        )
        to_user_id = to_user.id
        async_to_sync(channel_layer.group_send)(
            f"friends_group{to_user_id}",
            {
                'type': 'blocked_friend',
                'message': {
                    'second_username': from_user.username,
                    'avatar': friend_ser_to.data['avatar']
                }
            }
        )
        blocked_channel_name = user_channels.get(to_user.id).channel_name if to_user.id in user_channels else None
        if blocked_channel_name:
            async_to_sync(channel_layer.send)(
                blocked_channel_name,
                {
                    'type': 'blocked_friend',
                    'message': {
                        'second_username': from_user.username
                    }
                }
            )
        return Response({"success": "friend blocked successfully."})
    return Response(data={'error': 'Error blocking friend!'}, status=status.HTTP_400_BAD_REQUEST)

@authentication_required
@api_view(['POST'])
def unblock_friend(request, **kwargs):
    try:
        user_id = kwargs.get("user_id")
        from_user = customuser.objects.filter(id=user_id).first()
    except customuser.DoesNotExist:
        return Response({"error": "user not found"}, status=400)
    to_username = request.data.get('to_username')
    to_user = customuser.objects.filter(username=to_username).first()
    if to_user:
        if from_user == to_user:
            return Response({"Error": "You can't unblock yourself."}, status=status.HTTP_400_BAD_REQUEST)
        if not Friendship.objects.filter(Q(block_status='blocked') | Q(block_status='blocker'), user=from_user, friend=to_user).exists():
            return Response(data={"error": "You can't unblock a non-blocked user!"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not Friendship.objects.filter(block_status='blocker', user=from_user, friend=to_user).exists():
            return Response(data={"error": "You are not authorised to unblock yourself from the blocker!"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            friendship_obj = Friendship.objects.get(user=from_user, friend=to_user)
            friend_ser_from = friendSerializer(friendship_obj)
            friendship_obj.delete()
            friendship_obj = Friendship.objects.get(user=to_user, friend=from_user)
            friend_ser_to = friendSerializer(friendship_obj)
            friendship_obj.delete()
        except Friendship.DoesNotExist:
            return Response({"success": "Friendship obj does not exist."})
        from_user_id = from_user.id
        to_user_id = to_user.id
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
                f"friends_group{from_user_id}",
                {
                    'type': 'unblock_friend',
                    'message': {
                        'second_username': to_username,
                        'avatar': friend_ser_from.data['avatar'],
                        'level': friend_ser_from.data['level'],
                    }
                }
            )
        async_to_sync(channel_layer.group_send)(
                f"friends_group{to_user_id}",
                {
                    'type': 'unblock_friend',
                    'message': {
                        'second_username': from_user.username,
                        'avatar': friend_ser_to.data['avatar'],
                        'level': friend_ser_to.data['level'],
                    }
                }
        )
        return Response({"success": "friend unblocked successfully."})
    return Response(data={'error': 'Error unblocking friend!'}, status=status.HTTP_400_BAD_REQUEST)
