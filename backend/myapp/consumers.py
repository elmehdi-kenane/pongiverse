import json
from channels.generic.websocket import AsyncWebsocketConsumer


class testConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		# await self.send(text_data=json.dumps({
		# 	# 'type': 'connection_established',
		# 	# 'message': 'You are now connected!'
		# }))

	async def receive(self, text_data):
		data = json.loads(text_data)
		##printdata)
	def disconnect(self, close_code, message):
		self.send("Hellooo")
		pass