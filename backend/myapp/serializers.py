from rest_framework import serializers
from .models import customuser

class MyModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = customuser
        fields = '__all__'