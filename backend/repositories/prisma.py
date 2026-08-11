import uuid
import datetime
import json
from typing import List, Optional
from backend.repositories.base import BaseRepository
from prisma import Prisma, Json

class PrismaRepository(BaseRepository):
    def __init__(self):
        self.db = Prisma()

    async def init_db(self) -> None:
        await self.db.connect()
        # Seed default user if empty
        user_count = await self.db.user.count()
        if user_count == 0:
            import bcrypt
            hashed = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode("utf-8")
            
            user = await self.db.user.create(
                data={
                    "email": "demo@example.com",
                    "passwordHash": hashed,
                    "name": "Demo User",
                    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
                    "settings": {
                        "create": {
                            "theme": "dark",
                            "notificationsEnabled": True
                        }
                    }
                }
            )

            platinum = await self.db.creditcard.create(
                data={
                    "holderName": "Demo User",
                    "cardNumber": "3712 345678 90123",
                    "expiry": "12/30",
                    "cvv": "1234",
                    "limit": 10000.0,
                    "cardType": "Platinum",
                    "userId": user.id
                }
            )

            gold = await self.db.creditcard.create(
                data={
                    "holderName": "Demo User",
                    "cardNumber": "3787 987654 32109",
                    "expiry": "10/29",
                    "cvv": "5678",
                    "limit": 8000.0,
                    "cardType": "Gold",
                    "userId": user.id
                }
            )

            bluecash = await self.db.creditcard.create(
                data={
                    "holderName": "Demo User",
                    "cardNumber": "3728 555555 44444",
                    "expiry": "05/28",
                    "cvv": "9012",
                    "limit": 5000.0,
                    "cardType": "Blue Cash",
                    "userId": user.id
                }
            )

            # seed expenses
            expenses_data = [
                {
                    "description": "Starbucks Coffee",
                    "amount": 8.55,
                    "category": "Food",
                    "date": "2026-07-15",
                    "paymentMethod": "Gold",
                    "userId": user.id
                },
                {
                    "description": "Uber Airport Ride",
                    "amount": 45.00,
                    "category": "Travel",
                    "date": "2026-07-14",
                    "paymentMethod": "Platinum",
                    "userId": user.id
                },
                {
                    "description": "Netflix Subscription",
                    "amount": 15.99,
                    "category": "Entertainment",
                    "date": "2026-07-12",
                    "paymentMethod": "Platinum",
                    "userId": user.id
                },
                {
                    "description": "Amazon Web Devices",
                    "amount": 120.00,
                    "category": "Shopping",
                    "date": "2026-07-10",
                    "paymentMethod": "Platinum",
                    "userId": user.id
                }
            ]
            for exp in expenses_data:
                await self.db.expense.create(data=exp)

            # seed rewards
            rewards_data = [
                {
                    "points": 34,
                    "description": "Starbucks Coffee - 4X dining points multiplier",
                    "date": "2026-07-15",
                    "userId": user.id,
                    "creditCardId": gold.id
                },
                {
                    "points": 225,
                    "description": "Uber Airport Ride - 5X travel points multiplier",
                    "date": "2026-07-14",
                    "userId": user.id,
                    "creditCardId": platinum.id
                }
            ]
            for rew in rewards_data:
                await self.db.rewardhistory.create(data=rew)

            # seed conversation
            conv = await self.db.conversation.create(
                data={
                    "title": "Lounge benefits",
                    "userId": user.id,
                    "isPinned": True
                }
            )

            # seed message
            sources = [
                {
                    "text": "Cardmembers receive complimentary access to lounges globally.",
                    "title": "Centurion Lounge Access Terms",
                    "url": "https://americanexpress.com/lounge-benefits",
                    "score": 0.12,
                    "confidence": 95,
                    "page": 1,
                    "citation": "[1]"
                }
            ]
            await self.db.message.create(
                data={
                    "text": "Welcome to AmEx FinAssist. Ask me about airport lounge access, dining multipliers, or statement credits.",
                    "sender": "assistant",
                    "conversationId": conv.id,
                    "sources": Json(sources)
                }
            )

    async def user_register(self, email: str, password_hash: str, name: str, avatar: str) -> dict:
        user = await self.db.user.create(
            data={
                "email": email,
                "passwordHash": password_hash,
                "name": name,
                "avatar": avatar,
                "settings": {
                    "create": {
                        "theme": "dark",
                        "notificationsEnabled": True
                    }
                }
            }
        )
        
        card_id = "card-platinum-" + user.id[:5]
        await self.db.creditcard.create(
            data={
                "id": card_id,
                "holderName": name,
                "cardNumber": "3712 345678 90123",
                "expiry": "12/30",
                "cvv": "1234",
                "limit": 10000.0,
                "cardType": "Platinum",
                "userId": user.id
            }
        )

        return {"id": user.id, "email": user.email, "name": user.name, "avatar": user.avatar}

    async def user_get_by_email(self, email: str) -> Optional[dict]:
        user = await self.db.user.find_unique(where={"email": email})
        if not user:
            return None
        return {"id": user.id, "email": user.email, "passwordHash": user.passwordHash, "name": user.name, "avatar": user.avatar}

    async def user_get_by_id(self, user_id: str) -> Optional[dict]:
        user = await self.db.user.find_unique(where={"id": user_id})
        if not user:
            return None
        return {"id": user.id, "email": user.email, "name": user.name, "avatar": user.avatar}

    async def conversation_get_all(self, user_id: str) -> List[dict]:
        convs = await self.db.conversation.find_many(
            where={"userId": user_id},
            order=[
                {"isPinned": "desc"},
                {"createdAt": "desc"}
            ]
        )
        return [
            {"id": c.id, "title": c.title, "isPinned": c.isPinned, "createdAt": c.createdAt.isoformat()}
            for c in convs
        ]

    async def conversation_create(self, user_id: str, title: str) -> dict:
        conv = await self.db.conversation.create(
            data={
                "title": title,
                "userId": user_id,
                "isPinned": False
            }
        )
        return {"id": conv.id, "title": conv.title, "isPinned": conv.isPinned, "createdAt": conv.createdAt.isoformat()}

    async def conversation_update(self, conv_id: str, user_id: str, title: Optional[str] = None, is_pinned: Optional[bool] = None) -> bool:
        check = await self.db.conversation.find_first(where={"id": conv_id, "userId": user_id})
        if not check:
            return False

        update_data = {}
        if title is not None:
            update_data["title"] = title
        if is_pinned is not None:
            update_data["isPinned"] = is_pinned

        if update_data:
            await self.db.conversation.update(where={"id": conv_id}, data=update_data)
        return True

    async def conversation_delete(self, conv_id: str, user_id: str) -> bool:
        check = await self.db.conversation.find_first(where={"id": conv_id, "userId": user_id})
        if not check:
            return False

        await self.db.conversation.delete(where={"id": conv_id})
        return True

    async def messages_get_all(self, conv_id: str) -> List[dict]:
        msgs = await self.db.message.find_many(
            where={"conversationId": conv_id},
            order={"timestamp": "asc"}
        )
        return [
            {
                "id": m.id,
                "text": m.text,
                "sender": m.sender,
                "timestamp": m.timestamp.isoformat(),
                "sources": m.sources
            }
            for m in msgs
        ]

    async def message_create(self, conv_id: str, text: str, sender: str, sources: Optional[List[dict]] = None) -> dict:
        msg = await self.db.message.create(
            data={
                "conversationId": conv_id,
                "text": text,
                "sender": sender,
                "sources": Json(sources) if sources else None
            }
        )
        return {
            "id": msg.id,
            "text": msg.text,
            "sender": msg.sender,
            "timestamp": msg.timestamp.isoformat(),
            "sources": sources or []
        }

    async def expense_get_all(self, user_id: str) -> List[dict]:
        exps = await self.db.expense.find_many(
            where={"userId": user_id},
            order={"date": "desc"}
        )
        return [
            {
                "id": e.id,
                "description": e.description,
                "amount": e.amount,
                "category": e.category,
                "date": e.date,
                "payment_method": e.paymentMethod
            }
            for e in exps
        ]

    async def expense_create(self, user_id: str, description: str, amount: float, category: str, date: str, payment_method: str) -> dict:
        exp = await self.db.expense.create(
            data={
                "description": description,
                "amount": amount,
                "category": category,
                "date": date,
                "paymentMethod": payment_method,
                "userId": user_id
            }
        )

        points = 0
        pm = payment_method.lower()
        cat = category.lower()
        if "gold" in pm and cat == "food":
            points = int(amount * 4)
        elif "platinum" in pm and cat == "travel":
            points = int(amount * 5)
        elif "blue cash" in pm and cat == "shopping":
            points = int(amount * 2)
        else:
            points = int(amount * 1)

        if points > 0:
            card = await self.db.creditcard.find_first(where={"userId": user_id, "cardType": {"contains": payment_method}})
            card_id = card.id if card else None
            await self.db.rewardhistory.create(
                data={
                    "points": points,
                    "description": f"{description} - Point Multiplier",
                    "date": date,
                    "userId": user_id,
                    "creditCardId": card_id
                }
            )

        return {
            "id": exp.id,
            "description": exp.description,
            "amount": exp.amount,
            "category": exp.category,
            "date": exp.date,
            "payment_method": exp.paymentMethod,
            "points_earned": points
        }

    async def expense_delete(self, expense_id: str, user_id: str) -> bool:
        check = await self.db.expense.find_first(where={"id": expense_id, "userId": user_id})
        if not check:
            return False

        await self.db.expense.delete(where={"id": expense_id})
        return True

    async def credit_card_get_all(self, user_id: str) -> List[dict]:
        cards = await self.db.creditcard.find_many(where={"userId": user_id})
        cards_list = []
        for c in cards:
            expenses = await self.db.expense.find_many(where={"userId": user_id, "paymentMethod": c.cardType})
            spend = sum(e.amount for e in expenses)
            cards_list.append({
                "id": c.id,
                "holderName": c.holderName,
                "cardNumber": c.cardNumber,
                "expiry": c.expiry,
                "cvv": c.cvv,
                "limit": c.limit,
                "cardType": c.cardType,
                "currentStatement": spend,
                "availableCredit": max(0.0, c.limit - spend)
            })
        return cards_list

    async def rewards_get_profile(self, user_id: str) -> dict:
        rewards = await self.db.rewardhistory.find_many(where={"userId": user_id})
        points_earned = sum(r.points for r in rewards)
        total_mr_points = 124500 + points_earned
        
        history_rows = await self.db.rewardhistory.find_many(
            where={"userId": user_id},
            order={"date": "desc"},
            take=10
        )
        
        return {
            "membershipRewardsBalance": total_mr_points,
            "pointsEarnedFromSpend": points_earned,
            "history": [
                {"id": r.id, "points": r.points, "description": r.description, "date": r.date}
                for r in history_rows
            ]
        }

    async def settings_get(self, user_id: str) -> dict:
        sett = await self.db.settings.find_unique(where={"userId": user_id})
        if not sett:
            return {"theme": "dark", "defaultCardId": "card-platinum", "notificationsEnabled": True}
        return {
            "theme": sett.theme,
            "defaultCardId": sett.defaultCardId or "card-platinum",
            "notificationsEnabled": sett.notificationsEnabled
        }

    async def settings_update(self, user_id: str, theme: Optional[str] = None, default_card_id: Optional[str] = None, notifications_enabled: Optional[bool] = None) -> bool:
        sett = await self.db.settings.find_unique(where={"userId": user_id})
        
        update_data = {}
        if theme is not None:
            update_data["theme"] = theme
        if default_card_id is not None:
            update_data["defaultCardId"] = default_card_id
        if notifications_enabled is not None:
            update_data["notificationsEnabled"] = notifications_enabled

        if not sett:
            await self.db.settings.create(
                data={
                    "theme": theme or "dark",
                    "defaultCardId": default_card_id or "card-platinum",
                    "notificationsEnabled": notifications_enabled if notifications_enabled is not None else True,
                    "userId": user_id
                }
            )
        else:
            if update_data:
                await self.db.settings.update(where={"userId": user_id}, data=update_data)
        return True

    async def analytics_get(self, user_id: str) -> dict:
        expenses = await self.db.expense.find_many(where={"userId": user_id})
        
        categories_breakdown = {}
        for e in expenses:
            categories_breakdown[e.category] = categories_breakdown.get(e.category, 0.0) + e.amount
            
        monthly_map = {}
        for e in expenses:
            month = e.date[:7]
            monthly_map[month] = monthly_map.get(month, 0.0) + e.amount
        monthly_comparison = [{"month": k, "total": v} for k, v in sorted(monthly_map.items())]

        weekly_map = {}
        for e in expenses:
            weekly_map[e.date] = weekly_map.get(e.date, 0.0) + e.amount
        weekly_comparison = [{"date": k, "amount": v} for k, v in sorted(weekly_map.items(), reverse=True)[:7]]
        
        return {
            "categories": categories_breakdown,
            "monthlyComparison": monthly_comparison,
            "weeklyComparison": weekly_comparison,
            "forecastNextMonth": sum(categories_breakdown.values()) * 1.05,
            "budgets": {
                "Food": 1500.0,
                "Travel": 3000.0,
                "Shopping": 2000.0,
                "Entertainment": 500.0,
                "Utilities": 800.0,
                "Others": 1000.0
            }
        }
