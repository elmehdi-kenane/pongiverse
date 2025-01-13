from django.shortcuts import render
from rest_framework.response import Response
from myapp.models import customuser
from mainApp.models import UserMatchStatics, Match, MatchStatistics, Tournament, TournamentMembers, Round, TournamentUserInfo, ActiveMatch, PlayerState
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
from .models import UserTFQ, UserReports
import pyotp
import qrcode
import os
import secrets
from myapp.decorators import authentication_required
from mainApp.common import tournaments, rooms

#**-------------------------------------------------- Settings --------------------------------------------------** 
#**--------------------- UserData ---------------------** 
@authentication_required
@api_view(['GET'])
def getUserData(request, **kwargs):
	try:
		user_id = kwargs.get("user_id")
		user = customuser.objects.filter(id=user_id).first()
		if user is not None:
			user_states = UserMatchStatics.objects.filter(player=user).first()
			if user_states is not None:
				user_data = {'pic': f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{user.avatar.url}",
							'bg': f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{user.background_pic.url}",
							'id': user.id,
							'bio': user.bio,
							'email' : user.email,
							'online' : user.is_online,
							'level': user_states.level,
							'xp': user_states.total_xp,
							'country': user.country,
							'tfq': user.is_tfq,
							}
			return Response(data={"userData": user_data}, status=status.HTTP_200_OK)
		else:
			return Response(data={"error": "Error Getting UserData"}, status=status.HTTP_400_BAD_REQUEST)
	except:
		return Response(data={"error": "Error getting data from backend"}, status=status.HTTP_400_BAD_REQUEST)

#**------------------ UserPic - UserBg ------------------** 

def save_base64_image(base64_image):
    # Split the string into the header and the base64 data
    imgstr = base64_image.split(';base64,')
    
    if len(imgstr) != 2:
        raise ValueError("Invalid base64 image string")
    # Extract only the base64 part (the second part of the split)
    img_data = base64.b64decode(imgstr[1])  # Use imgstr[1] instead of imgstr
    # Create a ContentFile object from the decoded image data
    img_file = ContentFile(img_data, name='Picture.png')
    return img_file

@authentication_required
@api_view(['POST'])
def update_user_pic(request, **kwargs):
	# username= request.data.get('user')
	image_url = request.data.get('image')
	user_id = kwargs.get("user_id")
	
	try:
		image_file = save_base64_image(image_url)	
	except ValueError as e:
		return Response(data={"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
	
	user = customuser.objects.filter(id=user_id).first()
	if user is not None:    
		user.avatar = image_file
		user.save()
		return Response(data={"case": "Picture updated successfully"}, status=status.HTTP_200_OK)
	else:
		return Response(data={"error": "Failed to update picture"}, status=status.HTTP_400_BAD_REQUEST)

@authentication_required
@api_view(['POST'])
def update_user_bg(request, **kwargs):
	image_url = request.data.get('image')
	user_id = kwargs.get("user_id")

	try:
		image_file = save_base64_image(image_url)
	except ValueError as e:
		return Response(data={"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

	# If the code reaches this point, the image was processed successfully
	user = customuser.objects.filter(id=user_id).first()
	if user is not None:
		user.background_pic = image_file
		user.save()
		return Response(data={"case": "Wallpaper updated successfully"}, status=status.HTTP_200_OK)
	else:
		return Response(data={"error": "Failed to update Wallpaper"}, status=status.HTTP_404_NOT_FOUND)
		
#**--------------------- UserBio ---------------------** 
@authentication_required
@api_view(['POST'])
def update_user_bio(request, **kwargs):
	user_bio = request.data.get('bio')
	if len(user_bio) > 30:
		return Response(data={'error': 'Bio is too long'}, status=status.HTTP_400_BAD_REQUEST)
	user_id = kwargs.get("user_id")
	user = customuser.objects.filter(id=user_id).first()
	if user is not None:
		user.bio = user_bio
		user.save()
		success_res = Response(data={'case': 'Bio updated successfully'}, status=status.HTTP_200_OK)
		return success_res
	else:
		err_res = Response(data={'error': 'Failed to update bio'}, status=status.HTTP_400_BAD_REQUEST)
		return err_res
		
#**--------------------- UserCountry ---------------------** 
@authentication_required
@api_view(['POST'])
def update_user_country(request, **kwargs):
	user_id = kwargs.get("user_id")
	user = customuser.objects.filter(id=user_id).first()
	user_country = request.data.get('country')
	if user is not None:
		user.country = user_country
		user.save()
		success_res = Response(data={'case': 'New Country updated successfully'}, status=status.HTTP_200_OK)
		return success_res
	else:
		err_res = Response(data={'error': 'Failed to update new country'}, status=status.HTTP_400_BAD_REQUEST)
		return err_res
		
#**--------------------- UserPassword ---------------------** 
@authentication_required
@api_view(["POST"])
def update_user_password(request, **kwargs):
	user_old_pwd = request.data.get('old_pwd')
	user_new_pwd = request.data.get('new_pwd')
	if len(user_new_pwd) < 8:
		return Response(data={"error": "New Passwords Needs To Be At Least 8 Characters Long!"}, status=status.HTTP_400_BAD_REQUEST)
	user_id = kwargs.get("user_id")
	user = customuser.objects.filter(id=user_id).first()
	user = authenticate(username=user.username, password=user_old_pwd)
	if user is not None:
		# user.password = user_new_pwd
		user.set_password(user_new_pwd)
		user.save()
		return Response(data={'case':'New password updated successfully'}, status=status.HTTP_200_OK)
	else:
		return Response(data={'error': 'Wrong current password!'}, status=status.HTTP_400_BAD_REQUEST)

#**--------------------- Two-Factor Authenticator---------------------**#
#**------- Enable User TFQ -------**#

def checkExistQrCode(user):
	user_tfq = UserTFQ.objects.filter(user=user).first()
	if user_tfq:
		file_path = user_tfq.qr_code.path
		if os.path.isfile(file_path):
			os.remove(file_path)
		user_tfq.delete()

def checkPath():
	path = 'uploads/qr_codes/'
	if not os.path.exists(path):
		os.makedirs(path)

@authentication_required
@api_view(["POST"])
def enable_user_tfq(request, **kwargs):
	user_id = kwargs.get("user_id")
	user = customuser.objects.filter(id=user_id).first()
	if user:
		checkExistQrCode(user)
		user_tfq = UserTFQ.objects.filter(user=user).first()
		checkPath()
		key = pyotp.random_base32()
		user_tfq = UserTFQ.objects.create(
			user = user,
			key = key,
		)
		uri = pyotp.totp.TOTP(user_tfq.key).provisioning_uri(name=user.username, issuer_name="Transcendence")
		qr_path = f"uploads/qr_codes/{user.username}_Q.png"
		qrcode.make(uri).save(qr_path)
		random_string = secrets.token_hex(2)
		with open(qr_path, 'rb') as qr_file:
			user_tfq.qr_code.save(f"{user.username}_{random_string}.png", File(qr_file), save=True)
		if os.path.isfile(qr_path):
			os.remove(qr_path)
		res = {
			"key": user_tfq.key,
			"username": user.username,
			"img": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{user_tfq.qr_code.url}"
		}
		return Response(data={"data": res}, status=status.HTTP_200_OK)
	return Response(data={'error': 'Error Generating QrCode'}, status=status.HTTP_400_BAD_REQUEST)

#**------- Validate User TFQ -------**#
@authentication_required
@api_view(["POST"])
def validate_user_tfq(request, **kwargs):
	otp = request.data.get('otp')
	user_id = kwargs.get("user_id")
	user = customuser.objects.filter(id=user_id).first()
	if user:
		user_tfq = UserTFQ.objects.filter(user=user).first()
		if user_tfq:
			key = user_tfq.key
			totp = pyotp.TOTP(key)
			if totp.verify(otp) == True:
				user.is_tfq = True
				user.save()
				qr_path = user_tfq.qr_code.path
				if os.path.isfile(qr_path):
					os.remove(qr_path)
				return Response(data={"data": "Congratulation you enabled Two-Factor Authenticator"}, status=status.HTTP_200_OK)
			return Response(data={'error': 'Wrong otp'}, status=status.HTTP_400_BAD_REQUEST)
	return Response(data={'error': 'Error Validating UserTFQ'}, status=status.HTTP_400_BAD_REQUEST)

#**------- Disable User TFQ -------**#
@authentication_required
@api_view(["POST"])
def disable_user_tfq(request, **kwargs):
	otp = request.data.get('otp')
	user_id = kwargs.get("user_id")
	user = customuser.objects.filter(id=user_id).first()
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

@api_view(["POST"])
def check_user_tfq(request):
	username = request.data.get('user')
	otp = request.data.get('otp')
	user = customuser.objects.filter(username=username).first()
	if user is not None:
		user_tfq = UserTFQ.objects.filter(user=user).first()
		if user_tfq is not None:
			key = user_tfq.key
			totp = pyotp.TOTP(key)
			if totp.verify(otp) == True:
				response = Response()
				data = get_tokens_for_user(user)
				response.set_cookie('access_token', data['access'], httponly=True)
				response.set_cookie('refresh_token', data['refresh'], httponly=True)
				response.data = {"Case" : "Login successfully"}
				return response
			return Response(data={'Case': 'Wrong otp'}, status=status.HTTP_400_BAD_REQUEST)


#**-------------------------------------------------- Profile --------------------------------------------------** 
#**--------------------- Get user data for profile ---------------------**
@authentication_required
@api_view(['GET'])
def getUserDataProfile(request, user_profile, **kwargs):
    try:
        user = customuser.objects.filter(username=user_profile).first()
        user_id = kwargs.get("user_id")
        main_user = customuser.objects.filter(id=user_id).first()
        if user and main_user:
            if Friendship.objects.filter(Q(block_status='blocked') | Q(block_status='blocker'), user=user, friend=main_user).exists():
                return Response(data={"error": "There is a blocked behaviour!"}, status=status.HTTP_400_BAD_REQUEST)
            user_states = UserMatchStatics.objects.filter(player=user).first()
            if user_states is not None:
                user_data = {'pic': f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{user.avatar.url}",
                            'bg': f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{user.background_pic.url}",
                            'id': user.id,
                            'bio': user.bio,
                            'email' : user.email,
                            'online' : user.is_online,
                            'level': user_states.level,
                            'xp': user_states.total_xp,
                            'country': user.country,
                            'tfq': user.is_tfq,
                            }
            return Response(data={"userData": user_data}, status=status.HTTP_200_OK)
        else:
            return Response(data={"error": "Error Getting UserData"}, status=status.HTTP_400_BAD_REQUEST)
    except:
        return Response(data={"error": "Error getting data from backend"}, status=status.HTTP_400_BAD_REQUEST)
	
#**--------------------- GetFriends User ---------------------** 
@authentication_required
@api_view(["GET"])
def get_user_friends(request, user_profile, **kwargs):
	user = customuser.objects.filter(username=user_profile).first()
	user_id = kwargs.get("user_id")
	main_user = customuser.objects.filter(id=user_id).first()
	if Friendship.objects.filter(Q(block_status='blocked') | Q(block_status='blocker'), user=user, friend=main_user).exists():
		return Response(data={"error": "There is a blocked friendship!"}, status=status.HTTP_400_BAD_REQUEST)
	if user and main_user:
		friendships = Friendship.objects.filter(user=user, block_status='none').all()
		friends = []
		if friendships:
			for friendship in friendships:
				if not Friendship.objects.filter(Q(block_status='blocked') | Q(block_status='blocker'), user=main_user, friend=friendship.friend).exists():
					friends.append({
						'userId': friendship.friend.id,
						'username': friendship.friend.username,
						'userIsOnline': friendship.friend.is_online,
						'userIsFriend': Friendship.objects.filter(user=main_user, friend=friendship.friend).exists(),
						'pic': f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{friendship.friend.avatar.url}"
					})
		return Response(data={"data": friends}, status=status.HTTP_200_OK)
	return Response(data={'error': 'Error getting user friends!'}, status=status.HTTP_400_BAD_REQUEST)

#**--------------------- Check User Friendship ---------------------** 
@authentication_required
@api_view(["GET"])
def check_friendship(request, user_profile, **kwargs):
	user_id = kwargs.get("user_id")
	user = customuser.objects.filter(id=user_id).first()
	user2 = customuser.objects.filter(username=user_profile).first()

	if not user or not user2:
		return Response(data={'error': 'users not found'}, status=status.HTTP_404_NOT_FOUND)

	if Friendship.objects.filter(Q(block_status='blocked') | Q(block_status='blocker'), user=user, friend=user2).exists():
		return Response(data={"data": "blocked"}, status=status.HTTP_200_OK)

	if Friendship.objects.filter(user=user, friend=user2).exists():
		return Response(data={"data": "true"}, status=status.HTTP_200_OK)

	if FriendRequest.objects.filter(from_user=user, to_user=user2, status='sent').exists():
		return Response(data={"data": "pending"}, status=status.HTTP_200_OK)

	if FriendRequest.objects.filter(from_user=user, to_user=user2, status='received').exists():
		return Response(data={"data": "accept"}, status=status.HTTP_200_OK)

	return Response(data={"data": "false"}, status=status.HTTP_200_OK)

#**--------------------- GetUsers Games Lost - Wins {Diagram}---------------------**#
@authentication_required
@api_view(["GET"])
def get_user_diagram(request, user_profile, **kwargs):
	user_id = kwargs.get("user_id")
	main_user = customuser.objects.filter(id=user_id).first()
	user = customuser.objects.filter(username=user_profile).first()
	if Friendship.objects.filter(Q(block_status='blocked') | Q(block_status='blocker'), user=user, friend=main_user).exists():
		return Response(data={"error": "There is a blocked friendship!"}, status=status.HTTP_400_BAD_REQUEST)
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

#**--------------------- Report User - {ProfileInfo}---------------------**#
@authentication_required
@api_view(["POST"])
def report_user(request, **kwargs):
	reportedUsername = request.data.get("reportedUsername")
	report_message = request.data.get("reportMessage")
	user_id = kwargs.get("user_id")
	reporter = customuser.objects.filter(id=user_id).first()
	reported = customuser.objects.filter(username=reportedUsername).first()
	if reporter == reported:
		return Response(data={'error': 'You cannot report yourself!'}, status=status.HTTP_400_BAD_REQUEST)
	if Friendship.objects.filter(Q(block_status='blocked') | Q(block_status='blocker'), user=reporter, friend=reported).exists():
		return Response(data={"error": "There is a blocked friendship!"}, status=status.HTTP_400_BAD_REQUEST)
	if reporter and reported and report_message:
		report_obj = UserReports.objects.create(
			reporter = reporter,
			reported = reported,
			report_message = report_message,
		)
		if report_obj:
			return Response(data={'case': "Report submitted successfully"}, status=status.HTTP_201_CREATED)
	return Response(data={'error': "Report not submitted!"}, status=status.HTTP_400_BAD_REQUEST)

#**--------------------- GetUsers Games Lost - Wins {Profile/Match History}---------------------**#
@authentication_required
@api_view(["GET"])
def get_user_games(request, user_profile, page, **kwargs):
	user = customuser.objects.filter(username=user_profile).first()
	user_id = kwargs.get("user_id")
	main_user = customuser.objects.filter(id=user_id).first()
	if Friendship.objects.filter(Q(block_status='blocked') | Q(block_status='blocker'), user=user, friend=main_user).exists():
		return Response(data={"error": "There is a blocked friendship!"}, status=status.HTTP_400_BAD_REQUEST)
	res_data = []
	if user and page > 0:
		page_size = 5
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

		for match in user_matches:
			match_stq = MatchStatistics.objects.filter(match=match).first()
			if match_stq:
				date_time = match.date_ended
				date = date_time.strftime('%Y-%m-%d')
				time = date_time.strftime('%H:%M')
				res_data.append({
					"date": date,
					"time": time,
					"user1": match.team1_player1.username,
					"user2": match.team2_player1.username,
					"pic1": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{match.team1_player1.avatar.url}",
					"pic2": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{match.team2_player1.avatar.url}",
					"score" : f"{match.team1_score} - {match.team2_score}",
					"hit1": match_stq.team1_player1_hit,
					"hit2": match_stq.team2_player1_hit,
					"exp1": match_stq.team1_player1_rating,
					"exp2": match_stq.team2_player1_rating,
					"acc1": f"{(match_stq.team1_player1_score * 100 / match_stq.team1_player1_hit):.0f}" if match_stq.team1_player1_hit else 0,
					"acc2": f"{(match_stq.team2_player1_score * 100 / match_stq.team2_player1_hit):.0f}" if match_stq.team2_player1_hit else 0,
				})

		return Response(data={"data": res_data, "hasMoreMatches": has_more_matches}, status=status.HTTP_200_OK)
	return Response(data={'error': 'Error Getting UserGames!'}, status=status.HTTP_400_BAD_REQUEST)

#**--------------------- GetUser Statistics {Profile} ---------------------**#
@authentication_required
@api_view(["GET"])
def get_user_statistics_profile(request, user_profile, **kwargs):
	user = customuser.objects.filter(username=user_profile).first()
	user_id = kwargs.get("user_id")
	main_user = customuser.objects.filter(id=user_id).first()
	if Friendship.objects.filter(Q(block_status='blocked') | Q(block_status='blocker'), user=user, friend=main_user).exists():
		return Response(data={"error": "There is a blocked friendship!"}, status=status.HTTP_400_BAD_REQUEST)
	if user is not None:
		res_data = []
		date = 15
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

#**-------------------------------------------------- Dashboard --------------------------------------------------** 
#**--------------------- GetUsers Data Ranking ---------------------** 

@authentication_required
@api_view(["GET"])
def get_users_rank(request, **kwargs):
	users_data = UserMatchStatics.objects.all()
	res_data = []
	if users_data is not None:
		for user in users_data:
			res_data.append({
				'username': user.player.username,
				'pic': f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{user.player.avatar.url}",
				'wins': user.wins,
				'lost': user.losts,
				'level': user.level,
				'xp': user.total_xp,
				'goals': user.goals,
				# 'id': user.player.id,
			})
		return Response(data={"data": res_data}, status=status.HTTP_200_OK)    
	return Response(data={'error': 'Error Getting UsersData!'}, status=status.HTTP_400_BAD_REQUEST)
		

#**--------------------- GetUsers Games Lost - Wins {Dashboard}---------------------**#
@authentication_required
@api_view(["GET"])
def get_user_games_wl(request, **kwargs):
	user_id = kwargs.get("user_id")
	user = customuser.objects.filter(id=user_id).first()
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

#**--------------------- GetUser Statistics {Dashboard} ---------------------**#
@authentication_required
@api_view(["GET"])
def get_user_statistics_dashboard(request, **kwargs):
	user_id = kwargs.get("user_id")
	user = customuser.objects.filter(id=user_id).first()
	if user is not None:
		res_data = []
		date = 31
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
@authentication_required
@api_view(["GET"])
def get_single_matches(request, page, **kwargs):
	user_id = kwargs.get("user_id")
	user = customuser.objects.filter(id=user_id).first()
	res_data = []
	if user and page>0:
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
				"pic1": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{user_match.team1_player1.avatar.url}",
				"score" : f"{user_match.team1_score} - {user_match.team2_score}",
				"pic2": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{user_match.team2_player1.avatar.url}",
				"id": user_match.room_id,
			})
		return Response(data={"userMatches": res_data, "hasMoreMatches": has_more_matches}, status=status.HTTP_200_OK)
	return Response(data={'error': 'User not found!!'}, status=status.HTTP_404_NOT_FOUND)

#**------- GetUser SingleMatch Details -------**#
@authentication_required
@api_view(["GET"])
def get_single_match_dtl(request, match_id, **kwargs):
	match = Match.objects.filter(room_id=match_id).first()
	if match:
		match_stq = MatchStatistics.objects.filter(match=match).first()
		if match_stq:
			res_data = {
				"date": match.date_ended,
				"pic1": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{match.team1_player1.avatar.url}",
				"pic2": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{match.team2_player1.avatar.url}",
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
@authentication_required
@api_view(["GET"])
def get_multiplayer_matches(request, page, **kwargs):
	user_id = kwargs.get("user_id")
	user = customuser.objects.filter(id=user_id).first()
	res_data = []
	if user and page>0:
		page_size = 3
		offset = (page - 1) * page_size
		user_matches = Match.objects.filter(
			Q(team1_player1=user) | Q(team1_player2=user) | Q(team2_player1=user) | Q(team2_player2=user),
			mode="2vs2"
		).order_by('-date_ended')[offset:offset+page_size]

		# Check if there is still matches or not -------
		total_matches_count = Match.objects.filter(
			Q(team1_player1=user) | Q(team1_player2=user) | Q(team2_player1=user) | Q(team2_player2=user),
			mode="2vs2"
		).count()
		has_more_matches = (offset + page_size) < total_matches_count

		for user_match in user_matches:
			res_data.append({
				"p1Pic1": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{user_match.team1_player1.avatar.url}",
				"p1Pic2": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{user_match.team1_player2.avatar.url}",
				"score" : f"{user_match.team1_score} - {user_match.team2_score}",
				"p2Pic1": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{user_match.team2_player1.avatar.url}",
				"p2Pic2": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{user_match.team2_player2.avatar.url}",
				"id": user_match.room_id,
			})
		return Response(data={"userMatches": res_data, "hasMoreMatches": has_more_matches}, status=status.HTTP_200_OK)
	return Response(data={'error': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)

#**------- GetUser MultiplayerMatch Details -------**#
@authentication_required
@api_view(["GET"])
def get_multy_match_dtl(request, match_id, **kwargs):
	match = Match.objects.filter(room_id=match_id).first()
	if match:
		match_stq = MatchStatistics.objects.filter(match=match).first()
		if match_stq:
			res_data = {
				"date": match.date_ended,
				"pic1": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{match.team1_player1.avatar.url}",
				"pic2": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{match.team1_player2.avatar.url}",
				"pic3": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{match.team2_player1.avatar.url}",
				"pic4": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{match.team2_player2.avatar.url}",
				"user1": match.team1_player1.username,
				"user2": match.team1_player2.username,
				"user3": match.team2_player1.username,
				"user4": match.team2_player2.username,
				"score1": match.team1_score,
				"score2": match.team2_score,
				"goals1": match_stq.team1_player1_score,
				"goals2": match_stq.team1_player2_score,
				"goals3": match_stq.team2_player1_score,
				"goals4": match_stq.team2_player2_score,
				"hit1": match_stq.team1_player1_hit,
				"hit2": match_stq.team1_player2_hit,
				"hit3": match_stq.team2_player1_hit,
				"hit4": match_stq.team2_player2_hit,
				"exp1": match_stq.team1_player1_rating,
				"exp2": match_stq.team1_player2_rating,
				"exp3": match_stq.team2_player1_rating,
				"exp4": match_stq.team2_player2_rating,
				"acc1": f"{(match_stq.team1_player1_score * 100 / match_stq.team1_player1_hit):.0f}" if match_stq.team1_player1_hit else 0,
				"acc2": f"{(match_stq.team1_player2_score * 100 / match_stq.team1_player2_hit):.0f}" if match_stq.team1_player2_hit else 0,
				"acc3": f"{(match_stq.team2_player1_score * 100 / match_stq.team2_player1_hit):.0f}" if match_stq.team2_player1_hit else 0,
				"acc4": f"{(match_stq.team2_player2_score * 100 / match_stq.team2_player2_hit):.0f}" if match_stq.team2_player2_hit else 0,
			}
			return Response(data={"data": res_data}, status=status.HTTP_200_OK)
	return Response(data={'error': 'Error Getting MultiplayerGames!'}, status=status.HTTP_400_BAD_REQUEST)

#**--------------------- GetUser TournamentMatches {Dashboard} ---------------------**#
@authentication_required
@api_view(["GET"])
def get_tourn_matches(request, page, items, **kwargs):
	user_id = kwargs.get("user_id")
	user = customuser.objects.filter(id=user_id).first()
	type = "QUARTERFINAL"
	res_data = []
	if user and page>0 and (items==3 or items==6):
		offset = (page - 1) * items
		all_tournament_memebers = TournamentMembers.objects.filter(user=user).order_by('-id').all()[offset:offset+items]

		total_matches_count =TournamentMembers.objects.filter(user=user).count()
		has_more_matches = (offset + items) < total_matches_count

		for tournament_memebers in all_tournament_memebers:
			if tournament_memebers:
				tournament = tournament_memebers.tournament
				if tournament.is_finished:
					rounds = Round.objects.filter(tournament=tournament).all() #Get all the rounds
					for round in rounds:
						all_users = TournamentUserInfo.objects.filter(round=round).all() #Get all users inside each round
						for user_round in all_users:
							if user_round.user is not None:
								if user.username == user_round.user.username:
									type = round.type
					res_data.append({
						"type" : type,
						"tourId" : tournament.tournament_id,
						"pic": f"{os.getenv('PROTOCOL')}://{os.getenv('IP_ADDRESS')}:{os.getenv('PORT')}/auth{user.avatar.url}",
					})
		return Response(data={"data": res_data, "hasMoreMatches": has_more_matches}, status=status.HTTP_200_OK)
	return Response(data={'error': 'Error getting tournament matches!'}, status=status.HTTP_404_NOT_FOUND)
	
