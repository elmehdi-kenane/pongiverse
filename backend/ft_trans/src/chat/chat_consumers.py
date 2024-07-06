from channels.generic.websocket import AsyncWebsocketConsumer
from myapp.models import customuser ###########
from asgiref.sync import sync_to_async
from .models import Room, Membership, Message, Directs
import json
import base64
import imghdr
from django.core.files.base import ContentFile
from django.contrib.auth.hashers import make_password, check_password

async def  add_user_channel_group(self, data):
    user = await get_user_by_name(self , data['user'])
    memberships = await sync_to_async(list)(Membership.objects.filter(user=user))
    for membership in memberships:
        room_name = await sync_to_async(lambda: membership.room.name)()
        await self.channel_layer.group_add(room_name, self.channel_name)

async def  create_chat_room(self, data):
    print(data['user'])
    print(data['message']['name'])
    print('topic',data['message']['topic'])
    print('visibility',data['message']['roomVisibility'])
    print('password',data['message']['password'])

    user_name = data['user']
    room_name = data['message']['name']
    image_data = base64.b64decode(data['message']['icon'])
    try:
        user = await get_user_by_name(self ,user_name)
    except customuser.DoesNotExist:
        return  
    print("user is found")      
    room = await sync_to_async(Room.objects.filter(name=room_name).first)()
    if not room:
        print("room not found")
        image_type = imghdr.what(None, h=image_data)
        if image_type is None:
            print("Unsupported image type")
            return
        image_file = ContentFile(image_data, name=f'{room_name}.{image_type}')
        room = await sync_to_async(Room.objects.create)(name=room_name, topic=data['message']['topic'], icon=image_file)
        room.members_count += 1
        room.visiblity = 'private' if data['message']['roomVisibility'] == 'private-room' else ('protected' if data['message']['roomVisibility'] == 'protected-room' else 'public')
        if room.visiblity == 'protected':
            room.password = make_password(data['message']['password'])
    elif room:
        self.send(json.dumps({'type': 'roomAlreadyExists'}))
        return
    await sync_to_async(Membership.objects.create)(user=user, room=room, roles='admin')
    await sync_to_async(room.save)()
    await self.channel_layer.group_add(room_name, self.channel_name)
    message = {
        'type': 'newRoomCreated',
        'room' : {'id': room.id, 'name': room.name,  'topic': room.topic, 'icon_url':room.icon.path, 'membersCount' : room.members_count,},
    }
    await self.send(json.dumps(message))

async def  join_chat_room(self, data):
    #search for room is exist
    room = await sync_to_async(Room.objects.filter(name=data['name']).first)()
    if room :
        #get the user query
        user = await get_user_by_name(self , data['user'])
        membership = await sync_to_async(Membership.objects.filter(user=user, room=room).exists)()
        #check is user already joined room
        if membership:
            await self.send(json.dumps({'type' : 'alreadyJoined'}))
            return
        #handle private room
        elif room.visiblity == 'private':
            await self.send(json.dumps({'type' : 'privateRoom'}))
            return
        #handle protected room with no password
        elif room.visiblity == 'protected' and data['password'] == '':
            await self.send(json.dumps({'type' : 'incorrectPassword'}))
            return
        #protected room with wrong password
        elif room.visiblity == 'protected':
            if not check_password(data['password'], room.password):
                await self.send(json.dumps({'type' : 'incorrectPassword'}))
                return
        
        await sync_to_async(Membership.objects.create)(user=user, room=room, roles='member')
        room.members_count += 1
        await sync_to_async(room.save)()
        await self.channel_layer.group_add(room.name, self.channel_name)
        await self.channel_layer.group_send(room.name, {'type' : 'newRoomJoin', 'data' : {
            'id': room.id, 'name': room.name,  'topic': room.topic, 'icon_url':room.icon.path, 'membersCount' : room.members_count,
        }})
    elif not room:
        await self.send(json.dumps({'type': 'roomNotFound'}))

async def message(self, data):
	room_id = data['data']['room_id']
	user_name = data['data']['sender']
	message = data['data']['message']
	room  = await sync_to_async(Room.objects.filter(id=room_id).get)()
	sender = await get_user_by_name(self, user_name)
	newMessage = await sync_to_async(Message.objects.create)(sender=sender,room=room, content=message)
	event = {
		'type': 'send_message',
		'message': newMessage,
	}
	await self.channel_layer.group_add(room.name, self.channel_name)
	await self.channel_layer.group_send(room.name, event)

async def get_user_by_name(self, user_name):
    return await sync_to_async(customuser.objects.get)(username=user_name)

async def direct_message(self, data, user_channels):
    sender = await sync_to_async(customuser.objects.get)(username=data['data']['sender'])
    reciver = await sync_to_async(customuser.objects.get)(username=data['data']['reciver'])
    await sync_to_async(Directs.objects.create)(sender=sender, reciver=reciver, message = data['data']['message'])
    channel_name = user_channels.get(data['data']['reciver'])
    mychannel_name = user_channels.get(data['data']['sender'])
    if(channel_name):
        await self.channel_layer.send(
            channel_name, {
                'type' : 'send_direct',
                'data' : {
                    'sender' : data['data']['sender'],
                    'reciver' : data['data']['reciver'],
                    'message' : data['data']['message']
                }
            }
        )
    if(mychannel_name):
        await self.channel_layer.send(
            mychannel_name, {
                'type' : 'send_direct',
                'data' : {
                    'sender' : data['data']['sender'],
                    'reciver' : data['data']['sender'],
                    'message' : data['data']['message']
                }
            }
        )
