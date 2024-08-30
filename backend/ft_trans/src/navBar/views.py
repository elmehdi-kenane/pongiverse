from django.shortcuts import render
from django.db.models import Value, BooleanField, CharField
from rest_framework.decorators import api_view
from rest_framework.response import Response
from myapp.models import customuser
from friends.models import Friendship
from chat.models import Room
from friends.models import FriendRequest
from .serializers import customUserSerializer
from .serializers import roomSerializer

@api_view(['GET'])
def search_view(request):
    # This is the default value that will be returned if the key searchTerm is not found in the dictionary-like object.
    # The empty string ('') is commonly used as a default to ensure that the code doesn't break if the key is missing.
    search_term = request.query_params.get('searchTerm', '')
    username = request.query_params.get('username', '')
    user = customuser.objects.filter(username=username).first()


    users_objs = customuser.objects.filter(username__icontains=search_term).annotate(is_friend=Value(False, output_field=BooleanField()), result_type=Value("", output_field=CharField()))
    rooms_objs = Room.objects.filter(name__icontains=search_term).annotate(is_joined=Value(False, output_field=BooleanField()), result_type=Value("", output_field=CharField()))
    search_result = []
    for user_obj in users_objs:
        result_type = "user"
        user_ser = customUserSerializer(user_obj)
        # [user_ser.data['username'] == username] means the current-user so doesn't make sense to show add friend to itself
        if (FriendRequest.objects.filter(from_user=user, to_user=user_obj).exists() or Friendship.objects.filter(user=user, friend=user_obj).exists() or user_ser.data['username'] == username):
            search_result.append({
            'username': user_ser.data['username'],
            'avatar': user_ser.data['avatar'],
            'is_friend': True,
            'result_type': result_type
        })
        else:
            search_result.append({
            'username': user_ser.data['username'],
            'avatar': user_ser.data['avatar'],
            'is_friend': False,
            'result_type': result_type
        })

    for room_obj in rooms_objs:
        result_type = "room"
        room_ser = roomSerializer(room_obj)
        if (room_obj.members.filter(id=user.id).exists()):
            search_result.append({
            'username': room_ser.data['name'],
            'avatar': room_ser.data['icon'],
            'is_joined': True,
            'result_type': result_type
            })
        else:
            search_result.append({
            'username': room_ser.data['name'],
            'avatar': room_ser.data['icon'],
            'is_joined': False,
            'result_type': result_type
            })

    # sorted_merged_list = sorted(search_result, key=lambda item: item.username)
    search_result.sort(key=lambda item: item['username'])

    # Use a generic serializer or create a custom serializer that can handle objects from both models.
    # lists_ser = customUserSerializer(sorted_merged_list, many=True)

    # users_ser = customUserSerializer(users_objs, many=True)
    return Response(search_result)