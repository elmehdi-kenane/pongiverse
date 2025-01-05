# from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from myapp.models import customuser
from friends.models import Friendship
from .models import GameCustomisation
from .models import TournamentMembers, Tournament, Round, TournamentUserInfo, DisplayOpponent, TournamentWarnNotifications
import random
from django.db.models import Q
from myapp.serializers import MyModelSerializer
from rest_framework_simplejwt.tokens import RefreshToken, TokenError, AccessToken
from .common import tournament_rooms, tournaments, rooms
from myapp.decorators import authentication_required
from .models import UserMatchStatics
# from rest_framework.exceptions import AuthenticationFailed
# from .serializers import UserSerializer
# from .models import User
# import jwt, datetime

# @api_view(['POST'])
# def signup(request):
#     serializer = UserSerializer(data=request.data)
#     ##printserializer)
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
#     ##printtoken)
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

@authentication_required
@api_view(['POST'])
def online_friends(request):
	ip_address = os.getenv("IP_ADDRESS")
	username = request.data['user']
	# ##printf'user is {username}')
	user = customuser.objects.get(username=username)
	allFriends = []
	for user_id in Friendship.objects.filter(user=user):
		if user_id.friend.is_online and not user_id.friend.is_playing: ####################  and user_id.friend.is_playing
			allFriends.append({'id': user_id.friend.id, 'name': user_id.friend.username, 'level': 2, 'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user_id.friend.avatar.url}"})
		# print(f'friends are {friends}')
	return Response({'message': allFriends})

@authentication_required
@api_view(['POST'])
def serve_image(request):
	if (request.data).get('image'):
		with open(request.data['image'], 'rb') as image_file:
			return HttpResponse(image_file.read(), content_type='image/jpeg')

@authentication_required
@api_view(['POST'])
def get_user(request):
	data = request.data
	ip_address = os.getenv("IP_ADDRESS")
	username = data.get('uname')
	user = customuser.objects.filter(username=username).first()
	if user is not None:
		response = Response()
		response.data = {'id' : user.id, 'name' : user.username, 'level' : 2, 'image' : f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user.avatar.url}" }
		return response

@authentication_required
@api_view(['POST'])
def user_image(request):
	ip_address = os.getenv("IP_ADDRESS")
	username = (request.data).get('user')
	if not username:
		return Response({'message': 'no username is here'})
	user = customuser.objects.filter(username=username).first()
	if user:
		return Response({'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user.avatar.url}"})
	else:
		return Response({'message': 'user not exit in the database'})

def is_user_in_any_tournament(username):
	for tournament_id, tournament_data in tournaments.items():
		if tournament_data['is_started'] == False or  (tournament_data['is_started'] == True and tournament_data['is_finished'] == False):
			for member in tournament_data['members']:
				if member['username'] == username and member['is_eliminated'] == False:
					return True, tournament_id, [m['username'] for m in tournament_data['members']]
	return False, 0, []

def get_users_data(usernames):
	allMembers = []
	ip_address = os.getenv("IP_ADDRESS")
	for username in usernames:
		user = customuser.objects.filter(username=username).first()
		if user:
			user_states = UserMatchStatics.objects.filter(player=user).first()
			if user_states:
				image_path = user.avatar.url
				background_image_path = user.background_pic.url
				allMembers.append({
					'id': user.id,
					'name': user.username,
					'level': user_states.level,
					'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{image_path}",
					'background_image' : f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{background_image_path}",
					'is_online' : user.is_online
				})
	return allMembers

def is_user_owner_in_tournament(user_to_check, tournament_id):
	if tournament_id in tournaments:
		for member in tournaments[tournament_id]['members']:
			if member['username'] == user_to_check:
				return member['is_owner']
	return False

@authentication_required
@api_view(['POST'])
def tournament_members(request):
	username = request.data.get('user')
	user_exists, tournament_id, members_usernames = is_user_in_any_tournament(username)
	response = Response()
	is_owner = is_user_owner_in_tournament(username, tournament_id)
	if is_owner == False:
		response.data = {'tournament_id': tournament_id, 'allMembers': get_users_data(members_usernames), 'is_owner' : 'no'}
	else:
		response.data = {'tournament_id': tournament_id, 'allMembers': get_users_data(members_usernames), 'is_owner' : 'yes'}
	return response

@authentication_required
@api_view(['POST'])
def started_tournament_members(request):
	username = request.data.get('user')
	user = customuser.objects.filter(username=username).first()
	ip_address = os.getenv("IP_ADDRESS")
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
		allMembers.append({
			'id': member.user.id,
			'name': member.user.username,
			'level': 2,  # Assuming level is static for now
			'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{member.user.avatar.url}",
			'is_online' : member.user.is_online
		})
	response = Response()
	tournamentMember = TournamentMembers.objects.filter(user=user, tournament=my_tournament).first()
	if not tournamentMember.is_owner:
		response.data = {'tournament_id': tournament_id, 'allMembers': allMembers, 'is_owner' : 'no'}
	else:
		response.data = {'tournament_id': tournament_id, 'allMembers': allMembers, 'is_owner' : 'yes'}
	return response


@authentication_required
@api_view(['POST'])
def get_tournament_member(request):
	username = request.data.get('user')
	ip_address = os.getenv("IP_ADDRESS")
	user = customuser.objects.filter(username=username).first()
	if user is not None:
		user_states = UserMatchStatics.objects.filter(player=user).first()
		response = Response()
		response.data = {'id' : user.id, 'name' : user.username, 'level' : user_states.level, 'image' : f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user.avatar.url}", 'background_image' : f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user.background_pic.url}", 'is_online' : user.is_online}
		return response

@authentication_required
@api_view(['POST'])
def notifs_friends(request):
	username = request.data['user']
	# #printf'user is {username}')
	target = customuser.objects.get(username=username)
	allNotifs = []
	ip_address = os.getenv("IP_ADDRESS")
	for gameNotif in GameNotifications.objects.filter(target=target):
		usermatchstats = UserMatchStatics.objects.filter(player=gameNotif.user).first()
		if gameNotif.active_match is not None:
			allNotifs.append({'tournament_id' : '', 'user': gameNotif.user.username, 'level' : usermatchstats.level , 'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{gameNotif.user.avatar.url}", 'roomID': gameNotif.active_match.room_id, 'mode': gameNotif.mode})
		elif gameNotif.tournament_id != 0:
			allNotifs.append({'tournament_id' : gameNotif.tournament_id, 'user': gameNotif.user.username, 'level' : usermatchstats.level, 'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{gameNotif.user.avatar.url}", 'roomID': '', 'mode': gameNotif.mode})

	return Response({'message': allNotifs})


@authentication_required
@api_view(['POST'])
def get_tournament_data(request):
	tournament_id = request.data.get('id')
	if tournament_id == '' :
		tournament_id = 0
	response = Response()
	tournament_id_integer = int(tournament_id)
	if tournament_id_integer in tournaments:
		if tournaments[tournament_id_integer]['is_started'] == False:
			tournament_size = len(tournaments[tournament_id_integer]['members'])
			response.data = {'case' : 'exist', 'id' : tournament_id_integer, 'size' : tournament_size}
		else:
			response.data = {'case' : 'does not exist'}
	else:
		response.data = {'case' : 'does not exist'}
	return response

@authentication_required
@api_view(['GET'])
def get_tournament_suggestions(request):
	available_tournaments = []
	for tournament_id, tournament_data in tournaments.items():
		owner = next((member['username'] for member in tournament_data['members'] if member['is_owner']), None)
		tournament_size = len(tournament_data['members'])
		if tournament_size < 8:
			available_tournaments.append({
				'tournament_id': tournament_id,
				'owner': owner,
				'size': tournament_size
			})
	response = Response()
	response.data = {'tournaments': available_tournaments}
	return response

def is_user_in_joining_tournament(username):
	for tournament_id, tournament_data in tournaments.items():
		if tournament_data['is_started'] == False or  (tournament_data['is_started'] == True and tournament_data['is_finished'] == False):
			for member in tournament_data['members']:
				if member['username'] == username and member['is_eliminated'] == False:
					return True
	return False

@authentication_required
@api_view(['POST'])
def is_joining_tournament(request):
	username = request.data.get('user')
	response = Response()
	if is_user_in_joining_tournament(username) == True:
		response.data = {'Case' : 'yes'}
		return response
	response.data = {'Case' : 'no'}
	return response

def get_tournament_id(username):
	for tournament_id, tournament_data in tournaments.items():
		if tournament_data['is_started'] == False or  (tournament_data['is_started'] == True and tournament_data['is_finished'] == False):
			for member in tournament_data['members']:
				if member['username'] == username and member['is_eliminated'] == False:
					return tournament_id
	return 0

def check_is_eliminated(username, tournament_id):
	if tournament_id in tournaments:
		for member in tournaments[tournament_id]['members']:
			if member['username'] == username:
				return member['is_eliminated']
	return False

@authentication_required
@api_view(['POST'])
def is_started_and_not_finshed(request):
	username = request.data.get('user')
	response = Response()
	tournament_id = get_tournament_id(username)
	if tournament_id != 0:
		is_eliminated = check_is_eliminated(username, tournament_id)
		if tournaments[tournament_id]['is_started'] == True and tournaments[tournament_id]['is_finished'] == False and is_eliminated == False:
			response.data = {'Case' : 'yes'}
			return response
	response.data = {'Case' : 'no'}
	return response


@authentication_required
@api_view(['POST'])
def get_tournament_size(request):
	response = Response()
	tournament_id = request.data.get('tournament_id')
	print("**********************TOURNAMENT ID: ", tournament_id)
	print("**********************Tournament: ", tournaments)
	user = request.data.get('user')
	target = customuser.objects.filter(username=user).first()
	tournament_invitation = GameNotifications.objects.filter(tournament_id=tournament_id, target=target).first()
	if tournament_invitation:
		tournament_invitation.delete()
	if tournament_id not in tournaments:
		response.data = {'Case' : 'Tournament_does_not_exist'}
		return response
	else :
		if is_user_in_joining_tournament(user) == True:
			response.data = {'Case' : 'User_is_in_tournament'}
			return response
		if tournaments[tournament_id]['is_started'] == True:
			response.data = {'Case' : 'Tournament_started'}
		elif len(tournaments[tournament_id]['members']) == 8:
			response.data = {'Case' : 'Tournament_is_full'}
		else:
			response.data = {'Case' : 'size_is_valide'}
		return response



@authentication_required
@api_view(['POST'])
def customize_game(request):
	paddle_color = request.data['paddle']
	ball_color = request.data['ball']
	board_color = request.data['board']
	ball_effect = request.data['effect']
	username = request.data['username']
	user = customuser.objects.filter(username=username).first()
	if user:
		##printrequest.data)
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

@authentication_required
@api_view(['GET'])
def get_customize_game(request):
	try:
		token = request.COOKIES.get('access_token')
		decoded_token = AccessToken(token)
		data = decoded_token.payload
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

@authentication_required
@api_view(['POST'])
def set_is_inside(request):
	response = Response()
	is_inside = request.data.get('is_inside')
	username = request.data.get('user')
	for tournament_id, tournament_data in tournaments.items():
		for member in tournament_data['members']:
			if member['username'] == username:
				if not tournament_data['is_started'] or (tournament_data['is_started'] and not tournament_data['is_finished'] and not member['is_eliminated']):
					member['is_inside'] = is_inside
					response.data = {'Case': 'yes'}
					return response

	response.data = {'Case': 'no'}
	return response

@authentication_required
@api_view(['POST'])
def get_game_members_round(request):
	username = request.data.get('user')  # Get the username from the request
	ip_address = os.getenv("IP_ADDRESS")
	response = Response()

	quartermembers = []
	semimembers = []
	finalmembers = []
	winnerdict = {}
	for tournament_id, tournament_data in tournaments.items():
		for member in tournament_data['members']:
			if member['username'] == username:
				# Check if the tournament is ongoing and the user is not eliminated
				if tournament_data['is_started'] and not tournament_data['is_finished'] and not member['is_eliminated']:
					
					# Handle Quarterfinal members
					if 'QUARTERFINAL' in tournament_data['rounds']:
						for quartermember in tournament_data['rounds']['QUARTERFINAL']:
							if quartermember['username'] != 'anounymous':
								user = customuser.objects.filter(username=quartermember['username']).first()
								user_states = UserMatchStatics.objects.filter(player=user).first()
								quartermembers.append({
									'id' : user.id,
									'name' : quartermember['username'],
									'level': user_states.level,
									'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user.avatar.url}",
									'position': quartermember['position'],
								})
							else:
								quartermembers.append({
									'id' : -1,
									'name' : '',
									'level': -1,
									'image': '',
									'position': quartermember['position']
								})
					if 'SEMIFINAL' in tournament_data['rounds']:
						for semimember in tournament_data['rounds']['SEMIFINAL']:
							if semimember['username'] != 'anounymous':
								user = customuser.objects.filter(username=semimember['username']).first()
								user_states = UserMatchStatics.objects.filter(player=user).first()
								semimembers.append({
									'id' : user.id,
									'name' : semimember['username'],
									'level': user_states.level,
									'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user.avatar.url}",
									'position': semimember['position']
								})
							else:
								semimembers.append({
									'id' : -1,
									'name' : '',
									'level': -1,
									'image': '',
									'position': semimember['position']
								})
					# Handle Final members
					if 'FINAL' in tournament_data['rounds']:
						for finalmember in tournament_data['rounds']['FINAL']:
							if finalmember['username'] != 'anounymous':
								user = customuser.objects.filter(username=finalmember['username']).first()
								user_states = UserMatchStatics.objects.filter(player=user).first()
								finalmembers.append({
									'id' : user.id,
									'name' : finalmember['username'],
									'level': user_states.level,
									'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user.avatar.url}",
									'position': finalmember['position']
								})
							else:
								finalmembers.append({
									'id' : -1,
									'name' : '',
									'level': -1,
									'image': '',
									'position': finalmember['position']
								})
					if 'WINNER' in tournament_data['rounds']:
						for winner in tournament_data['rounds']['WINNER']:
							if winner['username'] != 'anounymous':
								user = customuser.objects.filter(username=winner['username']).first()
								user_states = UserMatchStatics.objects.filter(player=user).first()
								winnerdict.update({
									'id' : user.id,
									'name': winner['username'],
									'level' : user_states.level,
									'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{user.avatar.url}",
									'position': winner['position']
								})
							else:
								winnerdict.update({
									'id' : -1,
									'name': '',
									'level': -1,
									'image': '',
									'position': winner['position']
								})
				break

	# Return the response
	response.data = {
		'roundquarter': quartermembers,
		'roundsemi': semimembers,
		'roundfinal': finalmembers,
		'winner': winnerdict
	}
	return response


@authentication_required
@api_view(['POST'])
def get_opponent(request):
	response = Response()
	username = request.data.get('user')
	opponent = DisplayOpponent.objects.filter(Q(user1=username) | Q(user2=username)).first()
	if opponent is not None:
		response.data = {'Case' : 'exist', 'user1' : opponent.user1, 'user2' : opponent.user2, 'time' : opponent.created_at}
	else:
		response.data = {'Case' : 'does not exist'}
	return response

@authentication_required
@api_view(['POST'])
def get_number_of_members_in_a_round(request):
	response = Response()
	round_type = request.data.get('round_type')
	tournament_id = request.data.get('tournament_id')
	tournament = Tournament.objects.filter(tournament_id=tournament_id).first()
	round = Round.objects.filter(tournament=tournament, type=round_type).first()
	if round is not None:
		number_of_members = TournamentUserInfo.objects.filter(round=round).count()
		response.data = {'Case': 'Tournament round found', 'number_of_members' : number_of_members}
		return response
	response.data = {'Case': 'Tournament round not found'}
	return response

@authentication_required
@api_view(['POST'])
def get_tournament_warning(request):
	username = request.data.get('user')
	response = Response()
	tournament_id = get_tournament_id(username)
	if tournament_id != 0:
		warning = TournamentWarnNotifications.objects.filter(tournament_id=tournament_id).first()
		if warning:
			response.data = {'Case' : 'yes', 'time': warning.created_at}
			return response
	response.data = {'Case' : 'no'}
	return response

def get_right_room(tournament_id, tournament_rooms, username):
	room = {}
	t_rooms = tournament_rooms.get(str(tournament_id))
	if t_rooms:
		for room_id, the_room in t_rooms.items():
			if any(player['user'] == username for player in the_room.get('players', [])):
				return the_room
	return room
 

@authentication_required
@api_view(['POST'])
def player_situation(request):
	username = request.data.get('user')
	flag = 0
	response = Response()
	for tournament_id, tournament_data in tournaments.items():
		is_started = tournament_data['is_started']
		is_finished = tournament_data['is_finished']
		for member in tournament_data['members']:
			if member['username'] == username:
				is_eliminated = member['is_eliminated']
				if not is_started or (is_started and not is_finished and not is_eliminated):
					flag = 1337
					room = get_right_room(tournament_id, tournament_rooms, username)
					if room:
						case = "joining a room"
					else:
						case = "joining a tournament but not in a room"
					break
	if flag == 0:
		case = 'not joining a tournament'
	response.data = {'Case': case}
	#printf"\n\n Case is {case} \n\n")
	return response

@authentication_required
@api_view(['POST'])
def get_tournament_members_rounds(request):
	tournament_id = request.data.get('tournament_id')
	ip_address = os.getenv("IP_ADDRESS")
	tournament = Tournament.objects.filter(tournament_id=tournament_id).first()
	response = Response()
	quartermembers = []
	semimembers = []
	finalmembers = []
	winnerdict = {}
	roundquarterfinal = Round.objects.filter(tournament=tournament, type="QUARTERFINAL").first()
	roundsemierfinal = Round.objects.filter(tournament=tournament, type="SEMIFINAL").first()
	roundfinal = Round.objects.filter(tournament=tournament, type="FINAL").first()
	winner = Round.objects.filter(tournament=tournament, type="WINNER").first()
	if roundquarterfinal is not None:
		for quartermember in TournamentUserInfo.objects.filter(round=roundquarterfinal):
			if quartermember.user is not None:
				user_states = UserMatchStatics.objects.filter(player=quartermember.user).first()
				quartermembers.append({
					'id' : quartermember.user.id,
					'name' : quartermember.user.username,
					'level': user_states.level,
					'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{quartermember.user.avatar.url}",
					'position': quartermember.position
				})
			else:
				quartermembers.append({
					'id' : -1,
					'name' : '',
					'level': -1,
					'image': '',
					'position': quartermember.position
				})
	if roundsemierfinal is not None:
		for semimember in TournamentUserInfo.objects.filter(round=roundsemierfinal):
			if semimember.user is not None:
				user_states = UserMatchStatics.objects.filter(player=semimember.user).first()
				semimembers.append({
					'id' : semimember.user.id,
					'name' : semimember.user.username,
					'level': user_states.level,
					'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{semimember.user.avatar.url}",
					'position': semimember.position
				})
			else :
				semimembers.append({
					'id' : -1,
					'name' : '',
					'level': -1,  # Assuming level is static for now
					'image': '',
					'position': semimember.position
				})
	if roundfinal is not None:
		for finalmember in TournamentUserInfo.objects.filter(round=roundfinal):
			if finalmember.user is not None:
				user_states = UserMatchStatics.objects.filter(player=finalmember.user).first()
				finalmembers.append({
					'id' : finalmember.user.id,
					'name' : finalmember.user.username,
					'level': user_states.level,
					'image': f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{finalmember.user.avatar.url}",
					'position': finalmember.position
				})
			else:
				finalmembers.append({
					'id' : -1,
					'name' : '',
					'level': -1,
					'image': '',
					'position': finalmember.position
				})

	winnermember = TournamentUserInfo.objects.filter(round=winner).first()
	if winnermember is not None:
		if winnermember.user is not None:
			winnerdict.update({'id': winnermember.user.id, 'name' : winnermember.user.username, 'level' : 2, 'image' : f"{os.getenv('PROTOCOL')}://{ip_address}:{os.getenv('PORT')}/auth{winnermember.user.avatar.url}", 'position' : winnermember.position})
		else:
			winnerdict.update({'id': -1, 'name' : '', 'level' : -1, 'image' : '', 'position' : winnermember.position})
	response.data = {'roundquarter' : quartermembers, 'roundsemi' : semimembers, 'roundfinal' : finalmembers , 'winner' : winnerdict}
	return response

def is_user_joining_tournament(username):
	for tournament_id, tournament_data in tournaments.items():
		for member in tournament_data['members']:
			if member['username'] == username and member['is_eliminated'] == False and (tournament_data['is_started'] == False or  (tournament_data['is_started'] == True and tournament_data['is_finished'] == False)):
				return 'tournament'
	userRoom = { key: value for key, value in rooms.items()
		if (
			((len(value.get('players')) == 2 and
			(value['players'][0].get('user') == username or
			value['players'][1].get('user') == username)) or
			(len(value.get('players')) == 4 and
			((value['players'][0].get('user') == username and value['players'][0]['inside'] == True) or
			(value['players'][1].get('user') == username and value['players'][1]['inside'] == True) or
			(value['players'][2].get('user') == username and value['players'][2]['inside'] == True) or
			(value['players'][3].get('user') == username and value['players'][3]['inside'] == True))))
		)
	}
	if userRoom:
		value = list(userRoom.values())[0]
		return value['mode']
	return None

@authentication_required
@api_view(['POST'])
def check_is_in_game(request):
	response = Response()
	username = request.data.get('user')
	if username:
		is_joining = is_user_joining_tournament(username)
		if is_joining:
			response.data = {'mode': is_joining}
		else:
			response.data = {'error': 'Not valid'}
	else:
		response.data = {'error': 'Not valid'}
	return response
