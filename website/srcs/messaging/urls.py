from rest_framework.routers import DefaultRouter
from .views import ConversationViewSet, MessageViewSet, BlockedUserViewSet

# app_name = 'messaging'

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversations')
router.register(r'messages', MessageViewSet)
router.register(r'blocked-users', BlockedUserViewSet)

urlpatterns = router.urls
