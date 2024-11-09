import pytest
from unittest.mock import MagicMock

def test_player_disconnected_sends_username_to_all_clients():
    consumers = MagicMock()
    username = "test_user"
    consumers.player_disconnected(username)

    consumers.send.assert_called_with({"event": "player_disconnected", "username": username})