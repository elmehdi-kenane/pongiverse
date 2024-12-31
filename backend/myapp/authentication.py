from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model


class CustomUserModelBackend(ModelBackend):
	def authenticate(self, request, username=None, password=None, **kwargs):
		UserModel = get_user_model()
		try:
			user = UserModel.objects.get(username=username)
			if user.check_password(password):
				return user
		except UserModel.DoesNotExist:
			UserModel().set_password(password)