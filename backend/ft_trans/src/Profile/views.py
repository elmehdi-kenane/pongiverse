from django.shortcuts import render
from rest_framework.response import Response
from myapp.models import customuser
from rest_framework.decorators import api_view
from rest_framework import status
from chat.models import Friends
from myapp.models import customuser
# import requests

from myapp.serializers import MyModelSerializer
from django.core.files.base import ContentFile
import base64
from django.contrib.auth import authenticate


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


#**--------------------- UserData ---------------------** 

@api_view(['POST'])
def getUserData(request):
    username = request.data.get('user')
    user = customuser.objects.filter(username=username).first()
    if user is not None:
        user_data = {'pic': user.avatar.path,
                     'bg': user.background_pic.path,
                     'bio': user.bio,
                     'email' : user.email,
                     'level': user.level,
                     'password' : user.password,
                     'country': user.country,
                     }
        success_response = Response(data={"userData": user_data}, status=status.HTTP_200_OK)
        return success_response
    else:
        err_response = Response(data={"error": "Error Getting UserData"}, status=status.HTTP_400_BAD_REQUEST)
        return err_response

#**------------------ UserPic - UserBg ------------------** 

def save_base64_image(base64_image): # Save the Base64 Image as a file
    # Extract the content type and the base64 data from the image string
    format, imgstr = base64_image.split(';base64,')     
    # Decode the base64 data
    img_data = base64.b64decode(imgstr)
    # Create a ContentFile object from the decoded image data
    img_file = ContentFile(img_data, name='Picture.png')
    return img_file

@api_view(['POST'])
def update_user_pic(request):
    username= request.data.get('user')
    image_url = request.data.get('image')
    image_file = save_base64_image(image_url)
    # print('image url --------------:' , image_file, '-----------------------')
    user = customuser.objects.filter(username=username).first()
    if user is not None:    
        user.avatar = image_file
        user.save()
        success_res = Response(data={"case": "userPic saved successfully"}, status=status.HTTP_200_OK)
        return success_res
    else:
        error_response = Response(data={"error": "Failed to save userPic"}, status=status.HTTP_400_BAD_REQUEST)
        return error_response


@api_view(['POST'])
def update_user_bg(request):
    username= request.data.get('user')
    image_url = request.data.get('image')
    image_file = save_base64_image(image_url)
    user = customuser.objects.filter(username=username).first()
    if user is not None:    
        user.background_pic = image_file
        user.save()
        success_res = Response(data={"case": "userBg saved successfully"}, status=status.HTTP_200_OK)
        return success_res
    else:
        error_response = Response(data={"error": "Failed to save userBg"}, status=status.HTTP_400_BAD_REQUEST)
        return error_response

#**--------------------- UserName ---------------------** 

def check_used_username(new_username):
    check = customuser.objects.filter(username=new_username).first()
    if check is None:
        return new_username
    else:
        return None

@api_view(['POST'])
def update_username(request):
    username = request.data.get('user')
    new_username = check_used_username(request.data.get('new_username'))
    if new_username is not None:
        user = customuser.objects.filter(username=username).first()
        if user is not None:
            user.username = new_username
            user.save()
            success_response = Response(data={"case": "username saved successfully"}, status=status.HTTP_200_OK)
            return success_response
        else:
            error_response = Response(data={"error": "Failed to save username"}, status=status.HTTP_400_BAD_REQUEST)
            return error_response
    else:
        error_response = Response(data={"error": "Username already exist"}, status=status.HTTP_400_BAD_REQUEST)
        return error_response
        
#**--------------------- UserBio ---------------------** 

@api_view(['POST'])
def update_user_bio(request):
    username = request.data.get('user')
    user_bio = request.data.get('bio')
    user = customuser.objects.filter(username=username).first()
    if user is not None:
        user.bio = user_bio
        user.save()
        success_res = Response(data={'case': 'userBio Saved Successfully'}, status=status.HTTP_200_OK)
        return success_res
    else:
        err_res = Response(data={'error': 'Failed to save userBio'}, status=status.HTTP_400_BAD_REQUEST)
        return err_res
        
#**--------------------- UserCountry ---------------------** 

@api_view(['POST'])
def update_user_country(request):
    username = request.data.get('user')
    user_country = request.data.get('country')
    user = customuser.objects.filter(username=username).first()
    if user is not None:
        user.country = user_country
        user.save()
        success_res = Response(data={'case': 'userCountry Saved Successfully'}, status=status.HTTP_200_OK)
        return success_res
    else:
        err_res = Response(data={'error': 'Failed to save userCountry'}, status=status.HTTP_400_BAD_REQUEST)
        return err_res
        
#**--------------------- UserPassword ---------------------** 

@api_view(["POST"])
def update_user_password(request):
    username = request.data.get('user')
    user_old_pwd = request.data.get('old_pwd')
    user_new_pwd = request.data.get('new_pwd')
    user = authenticate(username=username, password=user_old_pwd)
    if user is not None:
        user.password = user_new_pwd
        user.save()
        success_res = Response(data={'case':'userPwd Updated Successfully'}, status=status.HTTP_200_OK)
        return success_res
    else:
        err_res = Response(data={'error': 'wrong-pwd'}, status=status.HTTP_401_UNAUTHORIZED)
        return err_res