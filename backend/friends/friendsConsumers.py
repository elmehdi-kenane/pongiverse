import json
from myapp.models import customuser
from .models import FriendRequest
from .serializers import friendRequestSerializer
from asgiref.sync import sync_to_async

# async def add_friend_request(self, data):
#     from_username = data['from_username']
#     to_username = data['to_username']
#     from_user = await sync_to_async(customuser.objects.get)(username=from_username)
#     to_user = await sync_to_async(customuser.objects.get)(username=to_username)
#     try:
#         await sync_to_async(FriendRequest.objects.get)(from_user=from_user, to_user=to_user)
#         await sync_to_async(FriendRequest.objects.get)(from_user=to_user, to_user=from_user)
#         await self.send(text_data=json.dumps({"Error": "Friend request already exists."}))
#     except FriendRequest.DoesNotExist:
#         await sync_to_async(FriendRequest.objects.create)(from_user=from_user, to_user=to_user, status="sent")
#         await sync_to_async(FriendRequest.objects.create)(from_user=to_user, to_user=from_user, status="recieved")
#     data = {
#         'type': 'add-friend-request',
#         'to_username' : to_username
#     }
#     ##printf"++++++++++++++ Friend request sent ++++++++++++++")
#     await self.send(text_data=json.dumps(data))

# async def cancel_friend_request(self, data):
#     from_username = data['from_username']
#     to_username = data['to_username']
#     from_user = await sync_to_async(customuser.objects.get)(username=from_username)
#     to_user = await sync_to_async(customuser.objects.get)(username=to_username)
#     try:
#         friend_request = await sync_to_async(FriendRequest.objects.get)(from_user=from_user, to_user=to_user, status="sent")
#         await sync_to_async(friend_request.delete)()
#         friend_request = await sync_to_async(FriendRequest.objects.get)(from_user=to_user, to_user=from_user, status="recieved")
#         await sync_to_async(friend_request.delete)()
#     except FriendRequest.DoesNotExist:
#         ##printf"++++++++++++++ Friend request doesn't exist. ++++++++++++++")
#     data = {
#         'type': 'cancel-friend-request',
#         'to_username' : to_username
#     }
#     ##printf"++++++++++++++ Friend request deleted successfully. ++++++++++++++")
#     await self.send(text_data=json.dumps(data))