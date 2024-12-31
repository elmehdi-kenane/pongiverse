import time
from django.db import connection
from prometheus_client import Histogram, Counter, Gauge
import uuid

REQUEST_LATENCY = Histogram('http_request_latency_seconds', 'HTTP request latency', ['method', 'endpoint'])

DATABASE_QUERY_TIME = Histogram('database_query_time_seconds', 'Time spent on database queries', ['view_name', 'method'])

USER_REGISTRATIONS = Counter('user_registrations', 'total of user registrations')

ACTIVE_USERS = Gauge('active_users', 'Current number of active users')

ROOM_COUNTER = Gauge('room_counter', 'chat room counter')

def chat_middleware(get_response):
    
    def middleware(request):
        start_time = time.time()
        response = get_response(request)
        view_name = request.resolver_match.view_name if request.resolver_match else 'unknown'
        print("view_name", view_name)
        if (view_name == "create-chat-room"):
            print("response", response)
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
        # print("========= 1 =========")
        # if connection.queries:
        #     for query in connection.queries:
        #         print(query)
        # print("========= 2 =========")
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
        print(f"========== Request ID: {request_id} START ==========")
        print("request", request)
        view_name = request.resolver_match.view_name if request.resolver_match else 'unknown'
        print("view_name", view_name)
        user = request.user
        print("user", user)
        if user.is_authenticated:
            user_activity[user.id] = time.time()
        cleanup_inactive_users()
        response = get_response(request)
        print(f"========== Request ID: {request_id} END ==========")
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