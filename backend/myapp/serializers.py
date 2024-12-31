from rest_framework import serializers
from .models import customuser
from django.contrib.auth.hashers import make_password

class MyModelSerializer(serializers.ModelSerializer):
	class Meta:
		model = customuser
		fields = '__all__'
	def create(self, validated_data):
		validated_data['password'] = make_password(validated_data['password'])
		return super().create(validated_data)
