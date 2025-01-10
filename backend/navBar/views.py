from django.shortcuts import render
from django.db.models import Value, BooleanField, CharField
from rest_framework.decorators import api_view
from rest_framework.response import Response
from myapp.models import customuser
from chat.models import Room, Membership
from friends.models import Friendship
from .models import Notification
from friends.models import FriendRequest
from .serializers import customUserSerializer
from .serializers import room_serializer
from .serializers import NotificationSerializer
from myapp.decorators import authentication_required
from django.db.models import Q
import os

@authentication_required
@api_view(['GET'])
def search_view(request, **kwargs):
    # This is the default value that will be returned if the key searchTerm is not found in the dictionary-like object.
    # The empty string ('') is commonly used as a default to ensure that the code doesn't break if the key is missing.
    search_term = request.query_params.get('searchTerm', '')
    username = request.query_params.get('username', '')
    user = customuser.objects.filter(username=username).first()
    if not user:
        return Response({"error": "User not found"}, status=404)

    users_objs = customuser.objects.filter(username__icontains=search_term).annotate(is_friend=Value(False, output_field=BooleanField()), result_type=Value("", output_field=CharField()))
    search_result = []
    for user_obj in users_objs:
        result_type = "user"
        user_ser = customUserSerializer(user_obj)
        if (Friendship.objects.filter(Q(block_status=Friendship.BLOCKED) | Q(block_status=Friendship.BLOCKER), user=user, friend=user_obj).exists()):
            #print"blocked friend")
            continue
        # [user_ser.data['username'] == username] means the current-user so doesn't make sense to show add friend to itself
        elif (FriendRequest.objects.filter(from_user=user, to_user=user_obj).exists()
        or Friendship.objects.filter(user=user, friend=user_obj).exists()
        or user_ser.data['username'] == username):
            #printuser_ser.data['username'], " is friend or friend-request")
            search_result.append({
            'id': user_ser.data['id'],
            'username': user_ser.data['username'],
            'avatar': user_ser.data['avatar'],
            'is_friend': True,
            'result_type': result_type
        })
        else:
            search_result.append({
            'id': user_ser.data['id'],
            'username': user_ser.data['username'],
            'avatar': user_ser.data['avatar'],
            'is_friend': False,
            'result_type': result_type
        })

    rooms_objs = Room.objects.filter(name__icontains=search_term, visiblity='public')
    for room_obj in rooms_objs:
        result_type = "room"
        room_ser = room_serializer(room_obj)
        #printroom_ser.data)
        if (Membership.objects.filter(room_id=room_obj.id, user_id=user.id).exists()):
            search_result.append({
                'id': room_ser.data['id'],
                'username': room_ser.data['name'],
                'avatar': room_ser.data['icon'],
                'members_count': room_ser.data['members_count'],
                'is_joined': True,
                'result_type': result_type
            })
        else:
            search_result.append({
                'id': room_ser.data['id'],
                'username': room_ser.data['name'],
                'avatar': room_ser.data['icon'],
                'members_count': room_ser.data['members_count'],
                'is_joined': False,
                'result_type': result_type
            })
    #print"search_result", search_result)
    return Response(search_result)

@authentication_required
@api_view(['POST'])
def add_notification(request, **kwargs):
    user = customuser.objects.get(username=request.data['username'])
    if not user:
        return Response({"error": "User not found"}, status=404)
    print(request.data['avatar'])
    Notification.objects.create(user=user, notification_text=request.data['notification_text'], is_read=False, url_redirection=request.data['url_redirection'], avatar=request.data['avatar'] or f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth/media/uploads_default/defaultNotificationIcon.png")
    return Response("success :)")

@authentication_required
@api_view(['POST'])
def clear_all_notifications(request, **kwargs):
    user = customuser.objects.get(username=request.data['username'])
    if not user:
        return Response({"error": "User not found"}, status=404)
    notification_objs = Notification.objects.filter(user=user)
    notification_objs.delete()
    return Response("success :)")

@authentication_required
@api_view(['GET'])
def get_notifications(request, username, **kwargs):
    user = customuser.objects.filter(username=username).first()
    if not user:
        return Response({"error": "User not found"}, status=404)
    objs = Notification.objects.filter(user=user).order_by('-send_at') # the dash (-) in front tells Django to order the results in descending order, meaning the most recent notifications (those with the latest send_at timestamp) will appear first.
    notifications_ser = NotificationSerializer(objs, many=True)
    return Response(notifications_ser.data)

@authentication_required
@api_view(['POST'])
def mark_notifications_as_read(request, username, **kwargs):
    user = customuser.objects.filter(username=username).first()
    if not user:
        return Response({"error": "User not found"}, status=404)
    objs = Notification.objects.filter(user=user, is_read=False)
    objs.update(is_read=True)
    return Response({"message": "All notifications have been marked as read."})