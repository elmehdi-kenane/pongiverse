from django.shortcuts import render
from rest_framework.response import Response
from myapp.models import customuser
from rest_framework.decorators import api_view
from chat.models import Friends
from myapp.models import customuser
# import requests

from myapp.serializers import MyModelSerializer
from django.core.files.base import ContentFile
import base64

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
    isFriends = Friends.objects.filter(user=user_sender_row, friend=user_add_row).exists() or \
        Friends.objects.filter(user=user_add_row, friend=user_sender_row).exists()
    if(isFriends):
        print("already friends")
        return Response({'message':'already firends'})
    Friends.objects.create(user=user_sender_row , friend=user_add_row)
    Friends.objects.create(user=user_add_row , friend=user_sender_row)
    return Response({'message':'sucess'})

@api_view(['GET'])
def show_friends(request, username):
    user = customuser.objects.get(username=username)
    friends = [user_id.user.username for user_id in Friends.objects.filter(user=user)]
    print(friends)
    return Response({"friends": friends})

    # friends = Friends.objects.filter(user=username)
    # user_add_row = customuser.objects.get(username=user_to_add)
    # user_sender_row = customuser.objects.get(username=sender)
    # Friends.objects.create(user=user_sender_row , friend=user_add_row)
    # Friends.objects.create(user=user_add_row , friend=user_sender_row)
    # return Response({'message':'sucess'})

@api_view(['GET'])
def friends_with_directs(request, username):
    user = customuser.objects.get(username=username)
    friends = Friends.objects.filter(user=user)
    data = []
    for friend in friends:
        print("my friend name: ",friend.friend.username)
        friend_data = {
            'id' : friend.friend.id,
            'name' : friend.friend.username,
            'is_online' : friend.friend.is_online,
            'is_playing' : friend.friend.is_playing,
            'image' :friend.friend.avatar.path,
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


def save_base64_image(base64_image):
    # Extract the content type and the base64 data from the image string
    format, imgstr = base64_image.split(';base64,')     
    # Decode the base64 data
    img_data = base64.b64decode(imgstr)
    # Create a ContentFile object from the decoded image data
    img_file = ContentFile(img_data, name='PicName.png')
    
    return img_file


@api_view(['POST'])
def update_user_pic(request):
    username= request.data.get('user')
    image_url = request.data.get('image')
    image_file = save_base64_image(image_url)
    print('image url --------------:' , image_file, '-----------------------')
    user = customuser.objects.filter(username=username).first()
    if user is not None:    
        user.avatar = image_file
        user.save()
        response = Response()
        response.data = {"case" : "Image Saved succesfully"}
        return response



        # dic= {
        #     'avatar': image_file
        # }
        # serializer = MyModelSerializer(data=dic)
        # if serializer.is_valid():