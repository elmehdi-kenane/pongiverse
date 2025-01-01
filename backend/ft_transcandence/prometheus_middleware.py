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

DIRECT_MESSAGE_COUNTER = Counter('direct_message_counter', 'total of direct messages')

ROOM_MESSAGE_COUNTER = Counter('room_message_counter', 'total of direct messages', ['room_name'])

ACTIVE_USERS = Gauge('active_users', 'Current number of active users')

ROOM_COUNTER = Gauge('room_counter', 'chat room counter')


class ChatMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        #printf"ChatMiddleware called with scope: {scope}")
        
        async def custom_receive():
            event = await receive()
            #printf"Received WebSocket event: {event}")
            return event
        
        async def custom_send(message):
            text = message.get('text')
            if (text != None):
                parsed_text = json.loads(text)
                if parsed_text['type'] == "newDirect":
                    DIRECT_MESSAGE_COUNTER.inc()
                if parsed_text['type'] == "newMessage":
                    room = await sync_to_async(Room.objects.get)(id=parsed_text['data']['roomId'])
                    ROOM_MESSAGE_COUNTER.labels(room_name=room.name).inc()
            await send(message)
        await super().__call__(scope, custom_receive, custom_send)

def room_counter_middleware(get_response):

    def middleware(request):
        start_time = time.time()
        response = get_response(request)
        view_name = request.resolver_match.view_name if request.resolver_match else 'unknown'
        if (view_name == "create-chat-room" and response.status_code == 200):
            ROOM_COUNTER.inc()
        if (view_name == "delete-chat-room" and response.status_code == 200):
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
        # #print"========= 1 =========")
        # if connection.queries:
        #     for query in connection.queries:
        #         #printquery)
        # #print"========= 2 =========")
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

def active_user_middleware(get_response):
    def middleware(request):
        request_id = str(uuid.uuid4())[:8]
        #printf"========== Request ID: {request_id} START ==========")
        #print"request", request)
        view_name = request.resolver_match.view_name if request.resolver_match else 'unknown'
        #print"view_name", view_name)
        user = request.user
        #print"user", user)
        if user.is_authenticated:
            user_activity[user.id] = time.time()
        cleanup_inactive_users()
        response = get_response(request)
        #printf"========== Request ID: {request_id} END ==========")
        return response
    
    return middleware

def cleanup_inactive_users(timeout=300):
    current_time = time.time()
    active_count = 0
    for user_id, last_active in list(user_activity.items()):
        if current_time - last_active < timeout:
            active_count += 1
        else:
            del user_activity[user_id]
    ACTIVE_USERS.set(active_count)