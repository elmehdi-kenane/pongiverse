"""
ASGI config for ft_transcandence project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import mainApp.routing
import Notifications.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ft_transcandence.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(
            mainApp.routing.websocket_urlpatterns +
            Notifications.routing.websocket_urlpatterns
        )
    )
})
