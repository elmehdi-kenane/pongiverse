# from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from myapp.models import customuser
from friends.models import Friendship
from .models import GameCustomisation
from .models import TournamentMembers, Tournament, TournamentInvitation, Round, TournamentUserInfo, DisplayOpponent
import random
from django.db.models import Q
from myapp.serializers import MyModelSerializer
from rest_framework_simplejwt.tokens import RefreshToken, TokenError, AccessToken
# from rest_framework.exceptions import AuthenticationFailed
# from .serializers import UserSerializer
# from .models import User
# import jwt, datetime

# @api_view(['POST'])
# def signup(request):
#     serializer = UserSerializer(data=request.data)
#     #print(serializer)
#     serializer.is_valid(raise_exception=True)
#     serializer.save()
#     return Response(serializer.data)

# @api_view(['POST'])
# def signin(request):
#     email = request.data['email']
#     password = request.data['password']
#     user = User.objects.filter(email=email).first()
#     if user is None:
#         raise AuthenticationFailed('User not found!')
#     if not user.check_password(password):
#         raise AuthenticationFailed('Incorrect password')
#     token = request.COOKIES.get('jwt')
#     #print(token)
#     if token:
#         response = Response()
#         response.data = {
#             'name': user.name
#         }
#         return response
#     else:
#         payload = {
#             'id': user.id,
#             'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=120),
#             'iat': datetime.datetime.utcnow()
#         }
#         token = jwt.encode(payload, 'secret', algorithm='HS256')
#         response = Response()
#         response.set_cookie(key='jwt', value=token, httponly=True)
#         response.data = {
#             'name': user.name
#         }
#         return response

# @api_view(['GET'])
# def get(request):
#     token = request.COOKIES.get('jwt')
#     if not token:
#         raise AuthenticationFailed('Unauthenticated')
#     try:
#         payload = jwt.decode(token, 'secret', algorithms=['HS256'])
#     except jwt.ExpiredSignatureError:
#         raise AuthenticationFailed('Unauthenticated')
#     user = User.objects.filter(id=payload['id']).first()
#     serializer = UserSerializer(user)
#     return Response(serializer.data)

# @api_view(['POST'])
# def logout(request):
#     response = Response()
#     response.delete_cookie('jwt')
#     response.data = {
#         'message': 'success'
#     }
#     return response

from django.http import HttpResponse
import base64
import os
from .models import GameNotifications
from mimetypes import guess_type

@api_view(['POST'])
def online_friends(request):
	username = request.data['user']
	# #print(f'user is {username}')
	user = customuser.objects.get(username=username)
	allFriends = []
	#print(f"is_online {user.is_online}, is_playing {user.is_playing}, username {user.username}")
	for user_id in Friendship.objects.filter(user=user):
		#print(f"is_online {user_id.friend.is_online}, is_playing {user_id.friend.is_playing}, username {user_id.friend.username}")
		if user_id.friend.is_online and not user_id.friend.is_playing: ####################  and user_id.friend.is_playing
			image_path = user_id.friend.avatar.path
			allFriends.append({'id': user_id.friend.id, 'name': user_id.friend.username, 'level': 2, 'image': image_path})
	return Response({'message': allFriends})

@api_view(['POST'])
def notifs_friends(request):
	username = request.data['user']
	# #print(f'user is {username}')
	target = customuser.objects.get(username=username)
	allNotifs = []
	for gameNotif in GameNotifications.objects.filter(target=target):
		# #print(f'ROOM_ID WHEN FETCHING IS : {gameNotif.room_id}')
		allNotifs.append({'user': gameNotif.user.username, 'avatar': gameNotif.user.avatar.path, 'roomID': gameNotif.active_match.room_id, 'mode': gameNotif.mode})
	return Response({'message': allNotifs})


@api_view(['POST'])
def serve_image(request):
	if (request.data).get('image'):
		with open(request.data['image'], 'rb') as image_file:
			if image_file:
				return HttpResponse(image_file.read(), content_type='image/jpeg')
			else:
				return Response("not found")

@api_view(['POST'])
def get_user(request):
	data = request.data
	username = data.get('uname')
	user = customuser.objects.filter(username=username).first()
	if user is not None:
		response = Response()
		response.data = {'id' : user.id, 'name' : user.username, 'level' : 2, 'image' : user.avatar.path}
		return response

@api_view(['GET'])
def create_tournament(request):
	response = Response()
	while True:
		random_number = random.randint(1000000000, 10000000000)
		tournament = Tournament.objects.filter(tournament_id=random_number).first()
		if tournament is None:
			break
	response.data = {'tournament_id' : random_number}
	return response

	if (request.data).get('image'):
		with open(request.data['image'], 'rb') as image_file:
			return HttpResponse(image_file.read(), content_type='image/jpeg')

@api_view(['POST'])
def user_image(request):
	username = (request.data).get('user')
	if not username:
		#print("no user is here")
		return Response({'message': 'no username is here'})
	user = customuser.objects.filter(username=username).first()
	if user:
		image_path = user.avatar.path
		if image_path:
			with open(image_path, 'rb') as image_file:
				return HttpResponse(image_file.read(), content_type='image/jpeg')
	else:
		return Response({'message': 'user not exit in the database'})

@api_view(['POST'])
def tournament_members(request):
	username = request.data.get('user')
	user = customuser.objects.filter(username=username).first()
	if not user:
		return Response({'error': 'User not found'}, status=404)
	tournament_members = TournamentMembers.objects.select_related('tournament').filter(user=user, tournament__is_started=False)
	if not tournament_members.exists():
		return Response({'error': 'No active tournaments found for the user'}, status=404)
	tournament_member = tournament_members.first()
	tournament_id = tournament_member.tournament.tournament_id
	my_tournament = Tournament.objects.filter(tournament_id=tournament_id).first()
	if not my_tournament:
		return Response({'error': 'Tournament not found'}, status=404)
	allMembers = []
	for member in TournamentMembers.objects.filter(tournament=my_tournament):
		image_path = member.user.avatar.path
		allMembers.append({
			'id': member.user.id,
			'name': member.user.username,
			'level': 2,  # Assuming level is static for now
			'image': image_path,
			'is_online' : member.user.is_online
		})
	response = Response()
	tournamentMember = TournamentMembers.objects.filter(user=user, tournament=my_tournament).first()
	if not tournamentMember.is_owner:
		response.data = {'tournament_id': tournament_id, 'allMembers': allMembers, 'is_owner' : 'no'}
	else:
		response.data = {'tournament_id': tournament_id, 'allMembers': allMembers, 'is_owner' : 'yes'}
	return response


@api_view(['POST'])
def started_tournament_members(request):
	username = request.data.get('user')
	user = customuser.objects.filter(username=username).first()
	if not user:
		return Response({'error': 'User not found'}, status=404)
	tournament_members = TournamentMembers.objects.select_related('tournament').filter(user=user, tournament__is_started=True, tournament__is_finished=False)
	if not tournament_members.exists():
		return Response({'error': 'No active tournaments found for the user'}, status=404)
	tournament_member = tournament_members.first()
	tournament_id = tournament_member.tournament.tournament_id
	my_tournament = Tournament.objects.filter(tournament_id=tournament_id).first()
	if not my_tournament:
		return Response({'error': 'Tournament not found'}, status=404)
	allMembers = []
	for member in TournamentMembers.objects.filter(tournament=my_tournament):
		image_path = member.user.avatar.path
		allMembers.append({
			'id': member.user.id,
			'name': member.user.username,
			'level': 2,  # Assuming level is static for now
			'image': image_path,
			'is_online' : member.user.is_online
		})
	response = Response()
	tournamentMember = TournamentMembers.objects.filter(user=user, tournament=my_tournament).first()
	if not tournamentMember.is_owner:
		response.data = {'tournament_id': tournament_id, 'allMembers': allMembers, 'is_owner' : 'no'}
	else:
		response.data = {'tournament_id': tournament_id, 'allMembers': allMembers, 'is_owner' : 'yes'}
	return response



@api_view(['POST'])
def get_tournament_member(request):
	username = request.data.get('user')
	user = customuser.objects.filter(username=username).first()
	if user is not None:
		response = Response()
		response.data = {'id' : user.id, 'name' : user.username, 'level' : 2, 'image' : user.avatar.path, 'is_online' : user.is_online}
		return response

@api_view(['POST'])
def get_notifications(request):
	username = request.data.get('user')
	receiver = customuser.objects.filter(username=username).first()
	Notifications = []
	invitations = TournamentInvitation.objects.filter(receiver=receiver)
	if invitations is not None:
		for notification in invitations:
			Notifications.append({
				'sender': notification.sender.username,
				'tournament_id': notification.tournament.tournament_id
			})
	response = Response()
	response.data = {'notifications': Notifications}
	return response

@api_view(['POST'])
def get_tournament_data(request):
	tournament_id = request.data.get('id')
	if tournament_id == '' :
		tournament_id = 0
	response = Response()
	my_tournament = Tournament.objects.filter(tournament_id=tournament_id).first()
	if my_tournament is not None:
		if not my_tournament.is_started:
			tournament_size = TournamentMembers.objects.filter(tournament=my_tournament).count()
			response.data = {'case' : 'exist', 'id' : my_tournament.tournament_id, 'size' : tournament_size}
		else:
			response.data = {'case' : 'does not exist'}
	else:
		response.data = {'case' : 'does not exist'}
	return response

@api_view(['GET'])
def get_tournament_suggestions(request):
	avaibleTournaments = []
	tournaments =Tournament.objects.filter(is_started=False)
	for tournament in tournaments:
		tournamentmember = TournamentMembers.objects.filter(tournament=tournament, is_owner = True).first()
		tournament_size = TournamentMembers.objects.filter(tournament=tournament).count()
		avaibleTournaments.append({
			'tournament_id' : tournament.tournament_id,
			'owner' : tournamentmember.user.username,
			'size' : tournament_size
		})
	response = Response()
	response.data = {'tournaments' : avaibleTournaments}
	return response

@api_view(['POST'])
def is_joining_tournament(request):
	username = request.data.get('user')
	response = Response()
	user = customuser.objects.filter(username=username).first()
	for member in TournamentMembers.objects.filter(user=user):
		if member.tournament.is_started == False:
			response.data = {'Case' : 'yes'}
			return response
	response.data = {'Case' : 'no'}
	return response

@api_view(['POST'])
def is_started_and_not_finshed(request):
	username = request.data.get('user')
	response = Response()
	user = customuser.objects.filter(username=username).first()
	for member in TournamentMembers.objects.filter(user=user):
		if member.tournament.is_started == True and member.tournament.is_finished == False and member.is_eliminated == False:
			response.data = {'Case' : 'yes'}
			return response
	response.data = {'Case' : 'no'}
	return response

@api_view(['POST'])
def get_tournament_size(request):
	response = Response()
	tournament_id = request.data.get('tournament_id')
	tournament = Tournament.objects.filter(tournament_id=tournament_id).first()
	if tournament.is_started == True:
		response.data = {'Case' : 'Tournament_started'}
	elif TournamentMembers.objects.filter(tournament=tournament).count() == 16:
		response.data = {'Case' : 'Tournament_is_full'}
	else:
		response.data = {'Case' : 'size_is_valide'}
	return response
def customize_game(request):
	paddle_color = request.data['paddle']
	ball_color = request.data['ball']
	board_color = request.data['board']
	ball_effect = request.data['effect']
	username = request.data['username']
	#print(f"THE SELF OBJECT IS : {request.COOKIES.get('token')}")
	user = customuser.objects.filter(username=username).first()
	if user:
		#print(request.data)
		game_customize = GameCustomisation.objects.filter(user=user).first()
		if game_customize:
			game_customize.paddle_color = paddle_color
			game_customize.ball_color = ball_color
			game_customize.board_color = board_color
			game_customize.ball_effect = ball_effect
			game_customize.save()
			return Response({'message': 'updated successfully'})
		GameCustomisation.objects.create(
			user=user,
			paddle_color=paddle_color,
			ball_color=ball_color,
			board_color=board_color,
			ball_effect=ball_effect
		)
		return Response({'message': 'updated successfully'})
		# return Response({'message': 'row not created yet'})
	else:
		return Response({'message': 'user not exit in the database'})

@api_view(['GET'])
def get_customize_game(request):
	try:
		#print(f"THE SELF OBJECT IS : {request.COOKIES.get('token')}")
		token = request.COOKIES.get('token')
		decoded_token = AccessToken(token)
		data = decoded_token.payload
		#print(data)
		if data.get('user_id'):
			user = customuser.objects.filter(id=data['user_id']).first()
			if user is not None:
				game_customize = GameCustomisation.objects.filter(user=user).first()
				if game_customize:
					return Response({'data' : [game_customize.paddle_color, game_customize.ball_color, game_customize.board_color, game_customize.ball_effect]})
				return Response({'data' : ['blue', 'red', '#8a7dac00']})
		return Response({'data' : None})
	except TokenError as e:
		return Response({'data' : None})

@api_view(['POST'])
def set_is_inside(request):
	response = Response()
	is_inside = request.data.get('is_inside')
	#print(f"----- get to is inside {is_inside}---------------")
	username = request.data.get('user')
	user = customuser.objects.filter(username=username).first()
	for member in TournamentMembers.objects.filter(user=user):
		if member.tournament.is_started == False or (member.tournament.is_started == True and member.tournament.is_finished == False and member.is_eliminated == False):
			member.is_inside = is_inside
			member.save()
			response.data = {'Case' : 'yes'}
			return response
	response.data = {'Case' : 'no'}
	return response

@api_view(['POST'])
def get_game_members_round(request):
	username = request.data.get('user')
	user = customuser.objects.filter(username=username).first()
	response = Response()
	for member in TournamentMembers.objects.filter(user=user):
		if member.tournament.is_started == True and member.tournament.is_finished == False and member.is_eliminated == False:
			roundsixteen = Round.objects.filter(tournament=member.tournament, type="ROUND 16").first()
			roundquarterfinal = Round.objects.filter(tournament=member.tournament, type="QUARTERFINAL").first()
			roundsemierfinal = Round.objects.filter(tournament=member.tournament, type="SEMIFINAL").first()
			winner = Round.objects.filter(tournament=member.tournament, type="WINNER").first()
			sixteenmembers = []
			quartermembers = []
			semimembers = []
			winnerdict = {}
			if roundsixteen is not None:
				for sixteenmember in TournamentUserInfo.objects.filter(round=roundsixteen):
					sixteenmembers.append({
						'id' : sixteenmember.user.id,
						'name' : sixteenmember.user.username,
						'level': 2,  # Assuming level is static for now
						'image': sixteenmember.user.avatar.path,
						'position': sixteenmember.position
					})
			if roundquarterfinal is not None:
				for quartermember in TournamentUserInfo.objects.filter(round=roundquarterfinal):
					if quartermember.user is not None:
						quartermembers.append({
							'id' : quartermember.user.id,
							'name' : quartermember.user.username,
							'level': 2,  # Assuming level is static for now
							'image': quartermember.user.avatar.path,
							'position': quartermember.position
						})
					else:
						quartermembers.append({
							'id' : -1,
							'name' : '',
							'level': 2,  # Assuming level is static for now
							'image': '',
							'position': quartermember.position
						})
			if roundsemierfinal is not None:
				for semimember in TournamentUserInfo.objects.filter(round=roundsemierfinal):
					if semimember.user is not None:
						semimembers.append({
							'id' : semimember.user.id,
							'name' : semimember.user.username,
							'level': 2,  # Assuming level is static for now
							'image': semimember.user.avatar.path,
							'position': semimember.position
						})
					else :
						semimembers.append({
							'id' : -1,
							'name' : '',
							'level': 2,  # Assuming level is static for now
							'image': '',
							'position': semimember.position
						})

			winnermember = TournamentUserInfo.objects.filter(round=winner).first()
			if winnermember is not None:
				if winnermember.user is not None:
					winnerdict.update({'id': winnermember.user.id, 'name' : winnermember.user.username, 'level' : 2, 'image' : winnermember.user.avatar.path, 'position' : winnermember.position})
				else:
					winnerdict.update({'id': -1, 'name' : '', 'level' : 2, 'image' : '', 'position' : winnermember.position})
	response.data = {'roundsixteen' : sixteenmembers, 'roundquarter' : quartermembers, 'roundsemi' : semimembers, 'winner' : winnerdict}
	return response

@api_view(['POST'])
def get_opponent(request):
	#print("YESHSHSHSH")
	response = Response()
	username = request.data.get('user')
	user = customuser.objects.filter(username=username).first()
	opponent = DisplayOpponent.objects.filter(Q(user1=user) | Q(user2=user)).first()
	if opponent is not None:
		response.data = {'Case' : 'exist', 'user1' : opponent.user1.username, 'user2' : opponent.user2.username, 'time' : opponent.created_at}
	else:
		response.data = {'Case' : 'does not exist'}
	return response
