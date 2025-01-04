import time
from django.db import connection
from prometheus_client import Histogram, Counter, Gauge
import uuid
from asgiref.sync import iscoroutinefunction
from channels.middleware import BaseMiddleware
import json
from asgiref.sync import sync_to_async
from chat.models import Room

REQUEST_LATENCY = Histogram('http_request_latency_seconds', 'HTTP request latency', ['method', 'endpoint'])

DATABASE_QUERY_TIME = Histogram('database_query_time_seconds', 'Time spent on database queries', ['view_name', 'method'])

USER_REGISTRATIONS = Counter('user_registrations', 'total of user registrations')

TOURNAMENT_COUNTER = Counter('tournament_counter', 'total of game tournaments')

GAME_COUNTER = Counter('game_counter', 'total of games' , ['number_of_players', 'game_mode'])

DIRECT_MESSAGE_COUNTER = Counter('direct_message_counter', 'total of direct messages')

ROOM_MESSAGE_COUNTER = Counter('room_message_counter', 'total of direct messages', ['room_name'])

ACTIVE_USERS = Gauge('active_users', 'Current number of active users')

ROOM_COUNTER = Gauge('room_counter', 'chat room counter')

class WebSocketMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        shared_data = {}
        async def custom_receive():
            event = await receive()
            if 'text' in event:
                parsed_text = json.loads(event['text'])
                shared_data['received_data'] = parsed_text
                if parsed_text['type'] == "createTournament":
                    TOURNAMENT_COUNTER.inc()
                if parsed_text['type'] == "directMessage":
                    DIRECT_MESSAGE_COUNTER.inc()
                if parsed_text['type'] == "message":
                    ROOM_MESSAGE_COUNTER.labels(room_name=parsed_text['data']['name']).inc()
                if parsed_text['type'] == "acceptInvitation":
                    GAME_COUNTER.labels(number_of_players="1v1", game_mode="friends").inc()
                if parsed_text['type'] == "createRoom":
                    GAME_COUNTER.labels(number_of_players="1v1", game_mode="room").inc()
            return event

        async def custom_send(message):
            text = message.get('text')
            if (text != None):
                parsed_text = json.loads(text)
                if ('received_data' in shared_data):
                    if (parsed_text['type'] == 'setupGame' and parsed_text['message']['playerNo'] == 4):
                        GAME_COUNTER.labels(number_of_players="2v2", game_mode="friends").inc()
                    if (shared_data['received_data']['type'] == 'checkingRoomCodeMp' and (parsed_text['type'] == 'playerInfos' and parsed_text['message']['playerNo'] == 4)):
                        GAME_COUNTER.labels(number_of_players="2v2", game_mode="room").inc()
                    if (shared_data['received_data']['type'] == 'joinMp' and (parsed_text['type'] == 'playerNo' and parsed_text['message']['playerNo'] == 4)):
                        GAME_COUNTER.labels(number_of_players="2v2", game_mode="quick").inc()
                    if (shared_data['received_data']['type'] == 'join' and (parsed_text['type'] == 'playerNo' and parsed_text['message']['playerNo'] == 2)):
                        GAME_COUNTER.labels(number_of_players="1v1", game_mode="quick").inc()
            await send(message)
        await super().__call__(scope, custom_receive, custom_send)

def room_counter_middleware(get_response):

    def middleware(request):
        if hasattr(request, 'data'):
            room = Room.objects.get(id=request.data.get("roomId"))
        else:
            room = None
        response = get_response(request)
        view_name = request.resolver_match.view_name if request.resolver_match else 'unknown'
        if (view_name == "create-chat-room" and response.status_code == 200):
            ROOM_COUNTER.inc()
        if (view_name == "delete-chat-room" and response.status_code == 200):
            ROOM_COUNTER.dec()
        if room != None:
            if (view_name == "leave-chat-room" and response.status_code == 200 and room.members_count == 1):
                ROOM_COUNTER.dec()
            
        return response
    
    return middleware

def latency_middleware(get_response):
    
    def middleware(request):
        start_time = time.time()
        response = get_response(request)
        latency = time.time() - start_time
        REQUEST_LATENCY.labels(method=request.method, endpoint=request.path).observe(latency)
        return response
    
    return middleware

def database_query_time_middleware(get_response):

    def middleware(request):
        response = get_response(request)
        query_time = sum(float(query['time']) for query in connection.queries) if connection.queries else 0.0

        view_name = request.resolver_match.view_name if request.resolver_match else 'unknown'
        method = request.method
        DATABASE_QUERY_TIME.labels(view_name=view_name, method=request.method).observe(query_time)
        return response
    
    return middleware

def user_registrations_counter_middleware(get_response):

    def middleware(request):
        response = get_response(request)
        view_name = request.resolver_match.view_name if request.resolver_match else 'unknown'
        if view_name == "signup" or view_name == "my-model":
            USER_REGISTRATIONS.inc()
        return response
    
    return middleware

user_activity = {}

def online_user_middleware(get_response):
    def middleware(request):
        response = get_response(request)
        view_name = request.resolver_match.view_name if request.resolver_match else 'unknown'
        if view_name == "login" and response.status_code == 200:
            ACTIVE_USERS.inc()
        if view_name == "logout" and response.status_code == 200:
            ACTIVE_USERS.dec()
        return response

    return middleware