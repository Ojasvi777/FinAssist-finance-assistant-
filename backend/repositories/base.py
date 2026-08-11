from abc import ABC, abstractmethod
from typing import List, Optional, Any

class BaseRepository(ABC):
    @abstractmethod
    async def init_db(self) -> None:
        """Initialise the database and seed initial data if empty."""
        pass

    @abstractmethod
    async def user_register(self, email: str, password_hash: str, name: str, avatar: str) -> dict:
        """Register a new user and return the user details."""
        pass

    @abstractmethod
    async def user_get_by_email(self, email: str) -> Optional[dict]:
        """Fetch user details by email."""
        pass

    @abstractmethod
    async def user_get_by_id(self, user_id: str) -> Optional[dict]:
        """Fetch user details by ID."""
        pass

    @abstractmethod
    async def conversation_get_all(self, user_id: str) -> List[dict]:
        """Fetch all conversations for a user."""
        pass

    @abstractmethod
    async def conversation_create(self, user_id: str, title: str) -> dict:
        """Create a new conversation session."""
        pass

    @abstractmethod
    async def conversation_update(self, conv_id: str, user_id: str, title: Optional[str] = None, is_pinned: Optional[bool] = None) -> bool:
        """Update conversation properties (title, pin status)."""
        pass

    @abstractmethod
    async def conversation_delete(self, conv_id: str, user_id: str) -> bool:
        """Delete a conversation session."""
        pass

    @abstractmethod
    async def messages_get_all(self, conv_id: str) -> List[dict]:
        """Fetch all messages for a conversation."""
        pass

    @abstractmethod
    async def message_create(self, conv_id: str, text: str, sender: str, sources: Optional[List[dict]] = None) -> dict:
        """Create and store a chat message with optional sources."""
        pass

    @abstractmethod
    async def expense_get_all(self, user_id: str) -> List[dict]:
        """Fetch all tracked expenses for a user."""
        pass

    @abstractmethod
    async def expense_create(self, user_id: str, description: str, amount: float, category: str, date: str, payment_method: str) -> dict:
        """Log a new expense entry and calculate points."""
        pass

    @abstractmethod
    async def expense_delete(self, expense_id: str, user_id: str) -> bool:
        """Delete an expense entry."""
        pass

    @abstractmethod
    async def credit_card_get_all(self, user_id: str) -> List[dict]:
        """Fetch linked credit cards and calculate spend balances."""
        pass

    @abstractmethod
    async def rewards_get_profile(self, user_id: str) -> dict:
        """Fetch Membership Rewards balance and point history."""
        pass

    @abstractmethod
    async def settings_get(self, user_id: str) -> dict:
        """Fetch application settings for a user."""
        pass

    @abstractmethod
    async def settings_update(self, user_id: str, theme: Optional[str] = None, default_card_id: Optional[str] = None, notifications_enabled: Optional[bool] = None) -> bool:
        """Update application settings."""
        pass

    @abstractmethod
    async def analytics_get(self, user_id: str) -> dict:
        """Fetch financial analytics (monthly spend, categories, budgets, forecast)."""
        pass
