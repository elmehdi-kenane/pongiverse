from django.shortcuts import render
from rest_framework.response import Response
from myapp.models import customuser
from mainApp.models import UserMatchStatics
from rest_framework.decorators import api_view

from django.http import HttpResponse
from rest_framework import status
from django.core.files.base import ContentFile
import base64
from django.contrib.auth import authenticate
from friends.models import Friendship
from myapp.models import customuser

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

    # friends = Friendship.objects.filter(user=username)
    # user_add_row = customuser.objects.get(username=user_to_add)
    # user_sender_row = customuser.objects.get(username=sender)
    # Friendship.objects.create(user=user_sender_row , friend=user_add_row)
    # Friendship.objects.create(user=user_add_row , friend=user_sender_row)
    # return Response({'message':'sucess'})

@api_view(['GET'])
def friends_with_directs(request, username):
    user = customuser.objects.get(username=username)
    friends = Friendship.objects.filter(user=user)
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

@api_view(['GET'])
def getUserData(request, username):
    user = customuser.objects.filter(username=username).first()
    if user is not None:
        user_level = UserMatchStatics.objects.filter(player=user).first()
        if user_level is not None:
            user_data = {'pic': user.avatar.path,
                        'bg': user.background_pic.path,
                        'bio': user.bio,
                        'email' : user.email,
                        'level': user_level.level,
                        'xp': user_level.total_xp,
                        'country': user.country,
                        }
        else:
            user_data = {'pic': user.avatar.path,
                        'bg': user.background_pic.path,
                        'bio': user.bio,
                        'email' : user.email,
                        'level': 0,
                        'xp': 0,
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
        success_res = Response(data={"case": "Picture updated successfully"}, status=status.HTTP_200_OK)
        return success_res
    else:
        error_response = Response(data={"error": "Failed to update picture"}, status=status.HTTP_400_BAD_REQUEST)
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
        success_res = Response(data={"case": "Walppaper updated successfully"}, status=status.HTTP_200_OK)
        return success_res
    else:
        error_response = Response(data={"error": "Failed to update walppaper"}, status=status.HTTP_400_BAD_REQUEST)
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
            success_response = Response(data={"case": "NickName updated successfully"}, status=status.HTTP_200_OK)
            return success_response
        else:
            error_response = Response(data={"error": "Failed to save NickName"}, status=status.HTTP_400_BAD_REQUEST)
            return error_response
    else:
        error_response = Response(data={"error": "NickName already exist"}, status=status.HTTP_400_BAD_REQUEST)
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
        success_res = Response(data={'case': 'Bio updated successfully'}, status=status.HTTP_200_OK)
        return success_res
    else:
        err_res = Response(data={'error': 'Failed to update bio'}, status=status.HTTP_400_BAD_REQUEST)
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
        success_res = Response(data={'case': 'New Country updated successfully'}, status=status.HTTP_200_OK)
        return success_res
    else:
        err_res = Response(data={'error': 'Failed to update new country'}, status=status.HTTP_400_BAD_REQUEST)
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
        user.set_password(user_new_pwd)
        user.save()
        success_res = Response(data={'case':'New password updated successfully'}, status=status.HTTP_200_OK)
        return success_res
    else:
        err_res = Response(data={'error': 'Wrong current password!'}, status=status.HTTP_401_UNAUTHORIZED)
        return err_res

#**--------------------- GetFriends User ---------------------** 

@api_view(["GET"])
def get_user_friends(request, userId):
    users = customuser.objects.all()
    user_data = []
    for user in users:
        if userId != user.username:
            user_data.append({
                'username': user.username,
                'pic': user.avatar.path,
            })
    return Response(data={"allUserData": user_data}, status=status.HTTP_200_OK)

#**--------------------- GetUsers Data Ranking ---------------------** 

@api_view(["GET"])
def get_user_image(request, username):
    user = customuser.objects.filter(username=username).first()
    if user is not None:
        with open(user.avatar.path, 'rb') as image_file:
             if image_file:
                return HttpResponse(image_file.read(), content_type='image/jpeg')
             else:
                 return Response("not found")

@api_view(["GET"])
def get_users_data(request, username):
    # user = customuser.objects.filter(username=username).first()
    users_data = UserMatchStatics.objects.all()
    res_data = []
    if users_data is not None:
        for user in users_data:
            res_data.append({
                'username': user.player.username,
                'wins': user.wins,
                'lost': user.losts,
                'level': user.level,
                'xp': user.total_xp,
                'goals': user.goals,
                'id': user.player.id,
            })
        response = Response(data={"usersData": res_data}, status=status.HTTP_200_OK)
        return response
    else:
        err_res = Response(data={'error': 'Error Getting UsersData!'}, status=status.HTTP_400_BAD_REQUEST)
        return err_res

#**--------------------- GetUsers Games Lost - Wins ---------------------**#
   
@api_view(["GET"])
def get_user_games_wl(request, username):
    user = customuser.objects.filter(username=username).first()
    if user is not None:
        user_games = UserMatchStatics.objects.filter(player=user).first()
        if user_games is not None:
            res_data = {
                'wins': user_games.wins,
                'losts': user_games.losts,
                'goals': user_games.goals,
            }
            return Response(data={"userGames": res_data}, status=status.HTTP_200_OK)
        else:
            return Response(data={'error': 'Error Getting userGames!'}, status=status.HTTP_400_BAD_REQUEST)
    else:
       return Response(data={'error': 'Error Getting userGames!'}, status=status.HTTP_400_BAD_REQUEST)
