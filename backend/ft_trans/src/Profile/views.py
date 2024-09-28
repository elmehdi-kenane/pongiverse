from django.shortcuts import render
from rest_framework.response import Response
from myapp.models import customuser
from mainApp.models import UserMatchStatics, Match, MatchStatistics
from friends.models import Friendship, FriendRequest
from rest_framework.decorators import api_view

from django.http import HttpResponse
from rest_framework import status
from django.core.files.base import ContentFile
import base64
from django.contrib.auth import authenticate
from friends.models import Friendship
from myapp.models import customuser

from django.db.models import Q
from datetime import datetime, date, timedelta
from myapp.views import get_tokens_for_user
from django.core.files import File
from .models import UserTFQ
import pyotp
import qrcode
import os

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
        user_states = UserMatchStatics.objects.filter(player=user).first()
        if user_states is not None:
            # print("---------------", f"http://localhost:8000/auth{user.avatar.url}", "-----------------")
            user_data = {'pic': f"http://localhost:8000/auth{user.avatar.url}",
                        'bg': f"http://localhost:8000/auth{user.background_pic.url}",
                        'bio': user.bio,
                        'email' : user.email,
                        'level': user_states.level,
                        'xp': user_states.total_xp,
                        'country': user.country,
                        'tfq': user.is_tfq,
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
                'pic': f"http://localhost:8000/auth{user.avatar.url}"
            })
    return Response(data={"allUserData": user_data}, status=status.HTTP_200_OK)

#**--------------------- GetUsers Data Ranking ---------------------** 

# @api_view(["GET"])
# def get_user_image(request, username):
#     user = customuser.objects.filter(username=username).first()
#     if user is not None:
#         with open(user.avatar.path, 'rb') as image_file:
#              if image_file:
#                 return HttpResponse(image_file.read(), content_type='image/jpeg')
#              else:
#                  return Response("not found")

@api_view(["GET"])
def get_users_data(request, username):
    # user = customuser.objects.filter(username=username).first()
    users_data = UserMatchStatics.objects.all()
    res_data = []
    if users_data is not None:
        for user in users_data:
            res_data.append({
                'username': user.player.username,
                'pic': f"http://localhost:8000/auth{user.player.avatar.url}",
                'wins': user.wins,
                'lost': user.losts,
                'level': user.level,
                'xp': user.total_xp,
                'goals': user.goals,
                # 'id': user.player.id,
            })
        return Response(data={"usersData": res_data}, status=status.HTTP_200_OK)    
    return Response(data={'error': 'Error Getting UsersData!'}, status=status.HTTP_400_BAD_REQUEST)
        

#**--------------------- GetUsers Games Lost - Wins {Dashboard}---------------------**#
   
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
    return Response(data={'error': 'Error Getting userGames!'}, status=status.HTTP_400_BAD_REQUEST)

#**--------------------- GetUsers Games Lost - Wins {Profile/Diagram}---------------------**#
   
@api_view(["GET"])
def get_user_diagram(request, username):
    user = customuser.objects.filter(username=username).first()
    if user is not None:
        user_games = UserMatchStatics.objects.filter(player=user).first()
        if user_games is not None:
            total_matches = user_games.wins + user_games.losts
            if total_matches > 0:
                accuracy = f"{(user_games.wins / user_games.losts):.2f}" if user_games.losts > 0 else 0
                res_data = [
                    {'subject': "Matches", 'value': total_matches},
                    {'subject': "Wins", 'value': user_games.wins},
                    {'subject': "Accuracy", 'value': accuracy},
                    {'subject': "Goals Acc", 'value': f"{(user_games.goals / total_matches):.2f}"},
                    {'subject': "Losts", 'value': user_games.losts},
                ]
            else:
                res_data = [
                    {'subject': "Matches", 'value': 0},
                    {'subject': "Wins", 'value': 0},
                    {'subject': "Accuracy", 'value': 0},
                    {'subject': "Goals Acc", 'value': 0},
                    {'subject': "Losts", 'value': 0},
                ]
            return Response(data={"userGames": res_data}, status=status.HTTP_200_OK)
    return Response(data={'error': 'Error Getting userGames!'}, status=status.HTTP_400_BAD_REQUEST)

#**--------------------- GetUser Statistics {Profile-Dashboard} ---------------------**#

@api_view(["GET"])
def get_user_statistics(request, username, date_range):
    user = customuser.objects.filter(username=username).first()
    if user is not None:
        res_data = []
        date = date_range - 1
        while date >= 0:
            day_bfr = (datetime.now().date() - timedelta(days=date)).isoformat()
            day_afr = (datetime.now().date() - timedelta(days=date-1)).isoformat()

            user_matches = Match.objects.filter(
                Q(team1_player1=user) | Q(team1_player2=user) | Q(team2_player1=user) | Q(team2_player2=user),
                date_ended__gte=day_bfr,
                date_ended__lte=day_afr
            ).all()

            wins, losts = 0, 0
            for user_match in user_matches:
                if user_match.team1_player1 == user or user_match.team1_player2 == user:
                    wins += int(user_match.team1_status == "winner")
                    losts += int(user_match.team1_status != "winner")
                elif user_match.team2_player1 == user or user_match.team2_player2 == user:
                    wins += int(user_match.team2_status == "winner")
                    losts += int(user_match.team2_status != "winner")

            day_int = int(datetime.strptime(day_bfr, "%Y-%m-%d").day)
            res_data.append({
                'day': f"{day_int:02}",
                'wins': wins,
                'losts': losts,
            })
            date -= 1
        return Response(data={"userStcs": res_data}, status=status.HTTP_200_OK)
    return Response(data={'error': 'Error Getting userGames!'}, status=status.HTTP_400_BAD_REQUEST)

#**--------------------- GetUser SingleMatches {Dashboard} ---------------------**#

@api_view(["GET"])
def get_single_matches(request, username, page):
    user = customuser.objects.filter(username=username).first()
    res_data = []
    if user is not None:
        page_size = 3
        offset = (page - 1) * page_size
        user_matches = Match.objects.filter(
            Q(team1_player1=user) | Q(team2_player1=user),
            mode="1vs1"
        ).order_by('-date_ended')[offset:offset+page_size]

        # Check if there is still matches or not -------
        total_matches_count = Match.objects.filter(
            Q(team1_player1=user) | Q(team2_player1=user),
            mode="1vs1"
        ).count()
        has_more_matches = (offset + page_size) < total_matches_count

        for user_match in user_matches:
            res_data.append({
                "pic1": f"http://localhost:8000/auth{user_match.team1_player1.avatar.url}",
                "score" : f"{user_match.team1_score} - {user_match.team2_score}",
                "pic2": f"http://localhost:8000/auth{user_match.team2_player1.avatar.url}",
                "id": user_match.room_id,
            })
        return Response(data={"userMatches": res_data, "hasMoreMatches": has_more_matches}, status=status.HTTP_200_OK)
    return Response(data={'error': 'Error Getting SingleGames!'}, status=status.HTTP_400_BAD_REQUEST)

#**------- GetUser SingleMatch Details -------**#

@api_view(["GET"])
def get_single_match_dtl(request, match_id):
    match = Match.objects.filter(room_id=match_id).first()
    match_stq = MatchStatistics.objects.filter(match=match).first()

    if match and match_stq:
        res_data = {
            "date": match.date_ended,
            "pic1": f"http://localhost:8000/auth{match.team1_player1.avatar.url}",
            "pic2": f"http://localhost:8000/auth{match.team2_player1.avatar.url}",
            "user1": match.team1_player1.username,
            "user2": match.team2_player1.username,
            "score1": match.team1_score,
            "score2": match.team2_score,
            "goals1": match_stq.team1_player1_score,
            "goals2": match_stq.team2_player1_score,
            "hit1": match_stq.team1_player1_hit,
            "hit2": match_stq.team2_player1_hit,
            "exp1": match_stq.team1_player1_rating,
            "exp2": match_stq.team2_player1_rating,
            "acc1": f"{(match_stq.team1_player1_score * 100 / match_stq.team1_player1_hit):.0f}" if match_stq.team1_player1_hit else 0,
            "acc2": f"{(match_stq.team2_player1_score * 100 / match_stq.team2_player1_hit):.0f}" if match_stq.team2_player1_hit else 0,
        }
        return Response(data={"data": res_data}, status=status.HTTP_200_OK)

    return Response(data={'error': 'Error Getting userGames!'}, status=status.HTTP_400_BAD_REQUEST)


#**--------------------- GetUser MultiplayerMatches {Dashboard} ---------------------**#

@api_view(["GET"])
def get_multiplayer_matches(request, username, page):
    user = customuser.objects.filter(username=username).first()
    res_data = []
    if user is not None:
        page_size = 3
        offset = (page - 1) * page_size
        user_matches = Match.objects.filter(
            Q(team1_player1=user) | Q(team1_player2=user) | Q(team2_player1=user) | Q(team2_player2=user),
            mode="1vs1"
        ).order_by('-date_ended')[offset:offset+page_size]

        # Check if there is still matches or not -------
        total_matches_count = Match.objects.filter(
            Q(team1_player1=user) | Q(team1_player2=user) | Q(team2_player1=user) | Q(team2_player2=user),
            mode="1vs1"
        ).count()
        has_more_matches = (offset + page_size) < total_matches_count

        for user_match in user_matches:
            res_data.append({
                "p1Pic1": f"http://localhost:8000/auth{user_match.team1_player1.avatar.url}",
                "p1Pic2": f"http://localhost:8000/auth{user_match.team1_player1.avatar.url}",
                "score" : f"{user_match.team1_score} - {user_match.team2_score}",
                "p2Pic1": f"http://localhost:8000/auth{user_match.team2_player1.avatar.url}",
                "p2Pic2": f"http://localhost:8000/auth{user_match.team2_player1.avatar.url}",
                "id": user_match.room_id,
            })
        return Response(data={"userMatches": res_data, "hasMoreMatches": has_more_matches}, status=status.HTTP_200_OK)
    return Response(data={'error': 'Error Getting MultiplayerGames!'}, status=status.HTTP_400_BAD_REQUEST)

#**------- GetUser MultiplayerMatch Details -------**#

@api_view(["GET"])
def get_multy_match_dtl(request, match_id):
    match = Match.objects.filter(room_id=match_id).first()
    match_stq = MatchStatistics.objects.filter(match=match).first()

    if match and match_stq:
        res_data = {
            "date": match.date_ended,
            "pic1": f"http://localhost:8000/auth{match.team1_player1.avatar.url}",
            "pic2": f"http://localhost:8000/auth{match.team1_player1.avatar.url}",
            "pic3": f"http://localhost:8000/auth{match.team2_player1.avatar.url}",
            "pic4": f"http://localhost:8000/auth{match.team2_player1.avatar.url}",
            "user1": match.team1_player1.username,
            "user2": match.team1_player1.username,
            "user3": match.team2_player1.username,
            "user4": match.team2_player1.username,
            "score1": match.team1_score,
            "score2": match.team2_score,
            "goals1": match_stq.team1_player1_score,
            "goals2": match_stq.team1_player1_score,
            "goals3": match_stq.team2_player1_score,
            "goals4": match_stq.team2_player1_score,
            "hit1": match_stq.team1_player1_hit,
            "hit2": match_stq.team1_player1_hit,
            "hit3": match_stq.team2_player1_hit,
            "hit4": match_stq.team2_player1_hit,
            "exp1": match_stq.team1_player1_rating,
            "exp2": match_stq.team1_player1_rating,
            "exp3": match_stq.team2_player1_rating,
            "exp4": match_stq.team2_player1_rating,
            "acc1": f"{(match_stq.team1_player1_score * 100 / match_stq.team1_player1_hit):.0f}" if match_stq.team1_player1_hit else 0,
            "acc2": f"{(match_stq.team1_player1_score * 100 / match_stq.team1_player1_hit):.0f}" if match_stq.team1_player1_hit else 0,
            "acc3": f"{(match_stq.team2_player1_score * 100 / match_stq.team2_player1_hit):.0f}" if match_stq.team2_player1_hit else 0,
            "acc4": f"{(match_stq.team2_player1_score * 100 / match_stq.team2_player1_hit):.0f}" if match_stq.team2_player1_hit else 0,
        }
        return Response(data={"data": res_data}, status=status.HTTP_200_OK)
    return Response(data={'error': 'Error Getting MultiplayerGames!'}, status=status.HTTP_400_BAD_REQUEST)

#**------- Enable User TFQ -------**#

def checkPath():
    path = 'uploads/qr_codes/'
    if not os.path.exists(path):
        os.makedirs(path)

@api_view(["GET"])
def enable_user_tfq(request, username):
    user = customuser.objects.filter(username=username).first()
    if user is not None:
        # user_tfq = UserTFQ.objects.filter(user=user).all()
        # user_tfq.delete()
        user_tfq = UserTFQ.objects.filter(user=user).first()
        if user_tfq:
            return Response(data={'error': 'User already has Two-Factor Authenticator'}, status=status.HTTP_400_BAD_REQUEST)
        checkPath()
        key = pyotp.random_base32()
        user_tfq = UserTFQ.objects.create(
            user = user,
            key = key,
        )
        urc = pyotp.totp.TOTP(user_tfq.key).provisioning_uri(name=user.username, issuer_name="Transcendence")
        qr_path = f"uploads/qr_codes/{user.username}_Q.png"
        qrcode.make(urc).save(qr_path)
        with open(qr_path, 'rb') as qr_file:
            user_tfq.qr_code.save(f"{user.username}_QR.png", File(qr_file), save=True)
        if os.path.isfile(qr_path):
            os.remove(qr_path)
        res = {
            "key": user_tfq.key,
            "img": f"http://localhost:8000/auth{user_tfq.qr_code.url}"
        }
        return Response(data={"data": res}, status=status.HTTP_200_OK)
    return Response(data={'error': 'Error Generating QrCode'}, status=status.HTTP_400_BAD_REQUEST)

#**------- Validate User TFQ -------**#

@api_view(["GET"])
def validate_user_tfq(requset, username, otp):
    user = customuser.objects.filter(username=username).first()
    if user:
        user_tfq = UserTFQ.objects.filter(user=user).first()
        if user_tfq:
            key = user_tfq.key
            totp = pyotp.TOTP(key)
            if totp.verify(otp) == True:
                user.is_tfq = True
                user.save()
                qr_path = f"uploads/qr_codes/{user.username}_QR.png"
                if os.path.isfile(qr_path):
                    os.remove(qr_path)
                return Response(data={"data": "Congratulation you enabled Two-Factor Authenticator"}, status=status.HTTP_200_OK)
            return Response(data={'error': 'Wrong otp'}, status=status.HTTP_400_BAD_REQUEST)

#**------- Disable User TFQ -------**#

@api_view(["GET"])
def disable_user_tfq(request, username, otp):
    user = customuser.objects.filter(username=username).first()
    if user is not None:
        user_tfq = UserTFQ.objects.filter(user=user).first()
        if user_tfq:
            key = user_tfq.key
            totp = pyotp.TOTP(key)
            if totp.verify(otp) == True:
                user_tfq.delete()
                user.is_tfq = False
                user.save()
                return Response(data={"data": "Two-Factor Authenticator has been disabled"}, status=status.HTTP_200_OK)
    return Response(data={'error': 'Error disabling user TFQ'}, status=status.HTTP_400_BAD_REQUEST)




#**------- Check OTP for SignIN -------**#

@api_view(["GET"])
def check_user_tfq(requset, username, otp):
    user = customuser.objects.filter(username=username).first()
    if user is not None:
        user_tfq = UserTFQ.objects.filter(user=user).first()
        if user_tfq is not None:
            key = user_tfq.key
            totp = pyotp.TOTP(key)
            if totp.verify(otp) == True:
                response = Response()
                data = get_tokens_for_user(user)
                response.set_cookie('token', data['access'], httponly=True)
                response.status_code = status.HTTP_200_OK
                return response
            return Response(data={'Case': 'Wrong otp'}, status=status.HTTP_400_BAD_REQUEST)
        

#**------- Check OTP for SignIN -------**#

@api_view(["GET"])
def check_friendship(request, username, username2):
    user = customuser.objects.filter(username=username).first()
    user2 = customuser.objects.filter(username=username2).first()
    if user and user2:
        is_friends = Friendship.objects.filter(user=user, friend=user2).first()
        if is_friends:
            return Response(data={"data": "true"}, status=status.HTTP_200_OK)
        else:
            is_sent_request = FriendRequest.objects.filter(from_user=user, to_user=user2, status='sent').first()
            if is_sent_request:
                return Response(data={"data": "pending"}, status=status.HTTP_200_OK)
            else:
                is_recv_request = FriendRequest.objects.filter(from_user=user, to_user=user2, status='recieved').first()
                if is_recv_request:
                    # print("------REcieved-------")
                    return Response(data={"data": "accept"}, status=status.HTTP_200_OK)
        return Response(data={"data": "false"}, status=status.HTTP_200_OK)
    return Response(data={'error': 'Error checking user friend'}, status=status.HTTP_400_BAD_REQUEST)