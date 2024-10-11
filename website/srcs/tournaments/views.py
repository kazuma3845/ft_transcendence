from rest_framework import viewsets
from .models import Tournament
from .serializers import TournamentSerializer
from rest_framework.permissions import IsAuthenticated

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()  # Tous les tournois
    serializer_class = TournamentSerializer  # Le serializer à utiliser pour le modèle
    permission_classes = [IsAuthenticated]
    # Optionnel: Si tu veux personnaliser le comportement, tu peux surcharger les méthodes create, update, etc.
    # Par exemple, pour ajouter de la logique spécifique lors de la création d'un tournoi :
    #
    # def create(self, request, *args, **kwargs):
    #     # Ta logique personnalisée ici
    #     return super().create(request, *args, **kwargs)
