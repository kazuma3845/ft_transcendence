from rest_framework.routers import DefaultRouter
from .views import ConversationViewSet, MessageViewSet, BlockedUserViewSet

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'blocked-users', BlockedUserViewSet)

urlpatterns = router.urls
