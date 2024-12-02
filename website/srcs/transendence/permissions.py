from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminOrReadAndCreate(BasePermission):
    """
    Permission pour :
    - Autoriser les méthodes en lecture (GET, HEAD, OPTIONS) pour tout le monde.
    - Autoriser la création (POST) à tout utilisateur authentifié.
    - Restreindre les modifications et suppressions (PUT, PATCH, DELETE) aux administrateurs.
    """
    def has_permission(self, request, view):
        # Autoriser tout le monde pour les méthodes en lecture
        if request.method in SAFE_METHODS:
            return True

        # Autoriser les utilisateurs authentifiés pour les créations (POST)
        if request.method == 'POST':
            return request.user and request.user.is_authenticated

        # Restreindre PUT, PATCH, DELETE aux administrateurs
        return request.user and request.user.is_staff
