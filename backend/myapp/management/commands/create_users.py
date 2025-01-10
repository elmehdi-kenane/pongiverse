import random
from django.core.management.base import BaseCommand
from myapp.models import customuser
from myapp.serializers import MyModelSerializer
from mainApp.models import UserMatchStatics
from friends.models import Friendship

# from django.core.management.base import BaseCommand
# from yourapp.models import customuser, UserMatchStatics, Friendship  # Update with your actual models
# from yourapp.serializers import MyModelSerializer  # Update with your actual serializer

class Command(BaseCommand):
    help = 'Create 10 random users and make user1 friends with all others'
    number = 50
    def handle(self, *args, **kwargs):
        # Create 10 random users
        for i in range(50):
            user_data = {
                'username': f'user{i+1}',
                'email': f'user{i+1}@example.com',
                'password': f'password{i+1}',
            }

            serializer = MyModelSerializer(data=user_data)
            if serializer.is_valid():
                user = serializer.save()
                if user:
                    UserMatchStatics.objects.create(player=user, wins=0, losts=0, level=0, total_xp=0, goals=0)
                    self.stdout.write(self.style.SUCCESS(f'User {user.username} created successfully.'))

            else:
                self.stdout.write(self.style.ERROR(f"Failed to create user{i+1}: {serializer.errors}"))

        # Ensure user1 is created successfully
        user1 = customuser.objects.filter(username='user1').first()
        for i in range(2, 51):
            user2 = customuser.objects.filter(username=f'user{i}').first()
            self.stdout.write(self.style.SUCCESS(f'User1: {user1.username}'))
            Friendship.objects.create(user=user1, friend=user2)
            Friendship.objects.create(user=user2, friend=user1)
            self.stdout.write(self.style.SUCCESS(f'User {user1.username} is now friends with {user2.username}'))


            

