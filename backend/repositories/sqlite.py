import sqlite3
import json
import uuid
import datetime
from typing import List, Optional
from backend.repositories.base import BaseRepository

class SQLiteRepository(BaseRepository):
    def __init__(self, db_path: str = "data/expenses.db"):
        self.db_path = db_path

    def _get_conn(self):
        return sqlite3.connect(self.db_path)

    async def init_db(self) -> None:
        import os
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        conn = self._get_conn()
        cursor = conn.cursor()
        
        # 1. Users Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT,
                avatar TEXT,
                created_at TEXT NOT NULL
            )
        """)
        
        # 2. Conversations Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                user_id TEXT NOT NULL,
                is_pinned INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # 3. Messages Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                text TEXT NOT NULL,
                sender TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                conversation_id TEXT NOT NULL,
                sources TEXT,
                FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            )
        """)

        # 4. Expenses Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS expenses (
                id TEXT PRIMARY KEY,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                date TEXT NOT NULL,
                payment_method TEXT NOT NULL,
                user_id TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Auto-migration for legacy DB schemas missing user_id column
        cursor.execute("PRAGMA table_info(expenses)")
        cols = [row[1] for row in cursor.fetchall()]
        if cols and "user_id" not in cols:
            cursor.execute("ALTER TABLE expenses ADD COLUMN user_id TEXT DEFAULT 'legacy_user'")

        cursor.execute("PRAGMA table_info(conversations)")
        cols = [row[1] for row in cursor.fetchall()]
        if cols and "user_id" not in cols:
            cursor.execute("ALTER TABLE conversations ADD COLUMN user_id TEXT DEFAULT 'legacy_user'")

        cursor.execute("PRAGMA table_info(credit_cards)")
        cols = [row[1] for row in cursor.fetchall()]
        if cols and "user_id" not in cols:
            cursor.execute("ALTER TABLE credit_cards ADD COLUMN user_id TEXT DEFAULT 'legacy_user'")

        cursor.execute("PRAGMA table_info(reward_history)")
        cols = [row[1] for row in cursor.fetchall()]
        if cols and "user_id" not in cols:
            cursor.execute("ALTER TABLE reward_history ADD COLUMN user_id TEXT DEFAULT 'legacy_user'")

        cursor.execute("PRAGMA table_info(settings)")
        cols = [row[1] for row in cursor.fetchall()]
        if cols and "user_id" not in cols:
            cursor.execute("ALTER TABLE settings ADD COLUMN user_id TEXT DEFAULT 'legacy_user'")

        # 5. Credit Cards Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS credit_cards (
                id TEXT PRIMARY KEY,
                holder_name TEXT NOT NULL,
                card_number TEXT NOT NULL,
                expiry TEXT NOT NULL,
                cvv TEXT NOT NULL,
                credit_limit REAL NOT NULL,
                card_type TEXT NOT NULL,
                user_id TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # 6. Reward History Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reward_history (
                id TEXT PRIMARY KEY,
                points INTEGER NOT NULL,
                description TEXT NOT NULL,
                date TEXT NOT NULL,
                user_id TEXT NOT NULL,
                credit_card_id TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(credit_card_id) REFERENCES credit_cards(id) ON DELETE SET NULL
            )
        """)

        # 7. Settings Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                id TEXT PRIMARY KEY,
                theme TEXT DEFAULT 'dark',
                default_card_id TEXT,
                notifications_enabled INTEGER DEFAULT 1,
                user_id TEXT UNIQUE NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        conn.commit()

        # Seed data check
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            demo_user_id = str(uuid.uuid4())
            import bcrypt
            hashed = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode("utf-8")
            now = datetime.datetime.utcnow().isoformat()
            
            cursor.execute(
                "INSERT INTO users (id, email, password_hash, name, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (demo_user_id, "demo@example.com", hashed, "Demo User", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80", now)
            )

            cursor.execute(
                "INSERT INTO settings (id, theme, default_card_id, notifications_enabled, user_id) VALUES (?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), "dark", "card-platinum", 1, demo_user_id)
            )

            cards = [
                ("card-platinum", "Demo User", "3712 345678 90123", "12/30", "1234", 10000.0, "Platinum", demo_user_id),
                ("card-gold", "Demo User", "3787 987654 32109", "10/29", "5678", 8000.0, "Gold", demo_user_id),
                ("card-bluecash", "Demo User", "3728 555555 44444", "05/28", "9012", 5000.0, "Blue Cash", demo_user_id)
            ]
            cursor.executemany(
                "INSERT INTO credit_cards (id, holder_name, card_number, expiry, cvv, credit_limit, card_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                cards
            )

            expenses_seed = [
                (str(uuid.uuid4()), "Starbucks Coffee", 8.55, "Food", "2026-07-15", "Gold", demo_user_id),
                (str(uuid.uuid4()), "Uber Airport Ride", 45.00, "Travel", "2026-07-14", "Platinum", demo_user_id),
                (str(uuid.uuid4()), "Netflix Subscription", 15.99, "Entertainment", "2026-07-12", "Platinum", demo_user_id),
                (str(uuid.uuid4()), "Amazon Web Devices", 120.00, "Shopping", "2026-07-10", "Platinum", demo_user_id)
            ]
            cursor.executemany(
                "INSERT INTO expenses (id, description, amount, category, date, payment_method, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                expenses_seed
            )

            rewards_seed = [
                (str(uuid.uuid4()), 34, "Starbucks Coffee - 4X dining points multiplier", "2026-07-15", demo_user_id, "card-gold"),
                (str(uuid.uuid4()), 225, "Uber Airport Ride - 5X travel points multiplier", "2026-07-14", demo_user_id, "card-platinum")
            ]
            cursor.executemany(
                "INSERT INTO reward_history (id, points, description, date, user_id, credit_card_id) VALUES (?, ?, ?, ?, ?, ?)",
                rewards_seed
            )

            conv_id = "default-1"
            cursor.execute(
                "INSERT INTO conversations (id, title, user_id, is_pinned, created_at) VALUES (?, ?, ?, ?, ?)",
                (conv_id, "Lounge benefits", demo_user_id, 1, now)
            )

            cursor.execute(
                "INSERT INTO messages (id, text, sender, timestamp, conversation_id, sources) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    str(uuid.uuid4()),
                    "Welcome to AmEx FinAssist. Ask me about airport lounge access, dining multipliers, or statement credits.",
                    "assistant",
                    now,
                    conv_id,
                    json.dumps([
                        {
                            "text": "Cardmembers receive complimentary access to lounges globally.",
                            "title": "Centurion Lounge Access Terms",
                            "url": "https://americanexpress.com/lounge-benefits",
                            "score": 0.12,
                            "confidence": 95,
                            "page": 1,
                            "citation": "[1]"
                        }
                    ])
                )
            )
            conn.commit()
        conn.close()

    async def user_register(self, email: str, password_hash: str, name: str, avatar: str) -> dict:
        conn = self._get_conn()
        cursor = conn.cursor()
        user_id = str(uuid.uuid4())
        now = datetime.datetime.utcnow().isoformat()
        cursor.execute(
            "INSERT INTO users (id, email, password_hash, name, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, email, password_hash, name, avatar, now)
        )
        
        cursor.execute(
            "INSERT INTO settings (id, theme, default_card_id, notifications_enabled, user_id) VALUES (?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), "dark", "card-platinum-" + user_id[:5], 1, user_id)
        )

        card_id = "card-platinum-" + user_id[:5]
        cursor.execute(
            "INSERT INTO credit_cards (id, holder_name, card_number, expiry, cvv, credit_limit, card_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (card_id, name, "3712 345678 90123", "12/30", "1234", 10000.0, "Platinum", user_id)
        )

        conn.commit()
        conn.close()
        return {"id": user_id, "email": email, "name": name, "avatar": avatar}

    async def user_get_by_email(self, email: str) -> Optional[dict]:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, password_hash, name, avatar FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        return {"id": row[0], "email": row[1], "passwordHash": row[2], "name": row[3], "avatar": row[4]}

    async def user_get_by_id(self, user_id: str) -> Optional[dict]:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, name, avatar FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        return {"id": row[0], "email": row[1], "name": row[2], "avatar": row[3]}

    async def conversation_get_all(self, user_id: str) -> List[dict]:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, title, is_pinned, created_at FROM conversations WHERE user_id = ? ORDER BY is_pinned DESC, created_at DESC",
            (user_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        return [
            {"id": r[0], "title": r[1], "isPinned": bool(r[2]), "createdAt": r[3]}
            for r in rows
        ]

    async def conversation_create(self, user_id: str, title: str) -> dict:
        conn = self._get_conn()
        cursor = conn.cursor()
        conv_id = str(uuid.uuid4())
        now = datetime.datetime.utcnow().isoformat()
        cursor.execute(
            "INSERT INTO conversations (id, title, user_id, is_pinned, created_at) VALUES (?, ?, ?, ?, ?)",
            (conv_id, title, user_id, 0, now)
        )
        conn.commit()
        conn.close()
        return {"id": conv_id, "title": title, "isPinned": False, "createdAt": now}

    async def conversation_update(self, conv_id: str, user_id: str, title: Optional[str] = None, is_pinned: Optional[bool] = None) -> bool:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM conversations WHERE id = ? AND user_id = ?", (conv_id, user_id))
        if not cursor.fetchone():
            conn.close()
            return False

        if title is not None:
            cursor.execute("UPDATE conversations SET title = ? WHERE id = ?", (title, conv_id))
        if is_pinned is not None:
            cursor.execute("UPDATE conversations SET is_pinned = ? WHERE id = ?", (1 if is_pinned else 0, conv_id))

        conn.commit()
        conn.close()
        return True

    async def conversation_delete(self, conv_id: str, user_id: str) -> bool:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM conversations WHERE id = ? AND user_id = ?", (conv_id, user_id))
        if not cursor.fetchone():
            conn.close()
            return False

        cursor.execute("DELETE FROM conversations WHERE id = ?", (conv_id,))
        conn.commit()
        conn.close()
        return True

    async def messages_get_all(self, conv_id: str) -> List[dict]:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, text, sender, timestamp, sources FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC",
            (conv_id,)
        )
        rows = cursor.fetchall()
        conn.close()

        messages = []
        for r in rows:
            sources_list = []
            if r[4]:
                try:
                    sources_list = json.loads(r[4])
                except Exception:
                    pass
            messages.append({
                "id": r[0],
                "text": r[1],
                "sender": r[2],
                "timestamp": r[3],
                "sources": sources_list
            })
        return messages

    async def message_create(self, conv_id: str, text: str, sender: str, sources: Optional[List[dict]] = None) -> dict:
        conn = self._get_conn()
        cursor = conn.cursor()
        msg_id = str(uuid.uuid4())
        now = datetime.datetime.utcnow().isoformat()
        sources_str = json.dumps(sources) if sources else None
        cursor.execute(
            "INSERT INTO messages (id, text, sender, timestamp, conversation_id, sources) VALUES (?, ?, ?, ?, ?, ?)",
            (msg_id, text, sender, now, conv_id, sources_str)
        )
        conn.commit()
        conn.close()
        return {
            "id": msg_id,
            "text": text,
            "sender": sender,
            "timestamp": now,
            "sources": sources or []
        }

    async def expense_get_all(self, user_id: str) -> List[dict]:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, description, amount, category, date, payment_method FROM expenses WHERE user_id = ? ORDER BY date DESC",
            (user_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        return [
            {"id": r[0], "description": r[1], "amount": r[2], "category": r[3], "date": r[4], "payment_method": r[5]}
            for r in rows
        ]

    async def expense_create(self, user_id: str, description: str, amount: float, category: str, date: str, payment_method: str) -> dict:
        conn = self._get_conn()
        cursor = conn.cursor()
        exp_id = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO expenses (id, description, amount, category, date, payment_method, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (exp_id, description, amount, category, date, payment_method, user_id)
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
            cursor.execute(
                "INSERT INTO reward_history (id, points, description, date, user_id, credit_card_id) VALUES (?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), points, f"{description} - Point Multiplier", date, user_id, None)
            )

        conn.commit()
        conn.close()
        return {
            "id": exp_id,
            "description": description,
            "amount": amount,
            "category": category,
            "date": date,
            "payment_method": payment_method,
            "points_earned": points
        }

    async def expense_delete(self, expense_id: str, user_id: str) -> bool:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM expenses WHERE id = ? AND user_id = ?", (expense_id, user_id))
        if not cursor.fetchone():
            conn.close()
            return False

        cursor.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
        conn.commit()
        conn.close()
        return True

    async def credit_card_get_all(self, user_id: str) -> List[dict]:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, holder_name, card_number, expiry, cvv, credit_limit, card_type FROM credit_cards WHERE user_id = ?",
            (user_id,)
        )
        rows = cursor.fetchall()
        
        cards_list = []
        for r in rows:
            cursor.execute("SELECT SUM(amount) FROM expenses WHERE user_id = ? AND payment_method LIKE ?", (user_id, f"%{r[6]}%"))
            spend = cursor.fetchone()[0] or 0.0
            cards_list.append({
                "id": r[0],
                "holderName": r[1],
                "cardNumber": r[2],
                "expiry": r[3],
                "cvv": r[4],
                "limit": r[5],
                "cardType": r[6],
                "currentStatement": spend,
                "availableCredit": max(0.0, r[5] - spend)
            })
        conn.close()
        return cards_list

    async def rewards_get_profile(self, user_id: str) -> dict:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT SUM(points) FROM reward_history WHERE user_id = ?", (user_id,))
        points_earned = cursor.fetchone()[0] or 0
        total_mr_points = 124500 + points_earned
        
        cursor.execute("SELECT id, points, description, date FROM reward_history WHERE user_id = ? ORDER BY date DESC LIMIT 10", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        
        return {
            "membershipRewardsBalance": total_mr_points,
            "pointsEarnedFromSpend": points_earned,
            "history": [
                {"id": r[0], "points": r[1], "description": r[2], "date": r[3]}
                for r in rows
            ]
        }

    async def settings_get(self, user_id: str) -> dict:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT theme, default_card_id, notifications_enabled FROM settings WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return {"theme": "dark", "defaultCardId": "card-platinum", "notificationsEnabled": True}
        return {
            "theme": row[0],
            "defaultCardId": row[1],
            "notificationsEnabled": bool(row[2])
        }

    async def settings_update(self, user_id: str, theme: Optional[str] = None, default_card_id: Optional[str] = None, notifications_enabled: Optional[bool] = None) -> bool:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM settings WHERE user_id = ?", (user_id,))
        if not cursor.fetchone():
            cursor.execute(
                "INSERT INTO settings (id, theme, default_card_id, notifications_enabled, user_id) VALUES (?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), theme or "dark", default_card_id, 1 if notifications_enabled else 0, user_id)
            )
        else:
            if theme is not None:
                cursor.execute("UPDATE settings SET theme = ? WHERE user_id = ?", (theme, user_id))
            if default_card_id is not None:
                cursor.execute("UPDATE settings SET default_card_id = ? WHERE user_id = ?", (default_card_id, user_id))
            if notifications_enabled is not None:
                cursor.execute("UPDATE settings SET notifications_enabled = ? WHERE user_id = ?", (1 if notifications_enabled else 0, user_id))
        
        conn.commit()
        conn.close()
        return True

    async def analytics_get(self, user_id: str) -> dict:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute("SELECT category, SUM(amount) FROM expenses WHERE user_id = ? GROUP BY category", (user_id,))
        cat_rows = cursor.fetchall()
        categories_breakdown = {r[0]: r[1] for r in cat_rows}
        
        cursor.execute("SELECT substr(date, 1, 7) as month, SUM(amount) FROM expenses WHERE user_id = ? GROUP BY month ORDER BY month ASC", (user_id,))
        month_rows = cursor.fetchall()
        monthly_comparison = [{"month": r[0], "total": r[1]} for r in month_rows]
        
        cursor.execute("SELECT date, SUM(amount) FROM expenses WHERE user_id = ? GROUP BY date ORDER BY date DESC LIMIT 7", (user_id,))
        day_rows = cursor.fetchall()
        weekly_breakdown = [{"date": r[0], "amount": r[1]} for r in day_rows]
        
        conn.close()
        
        return {
            "categories": categories_breakdown,
            "monthlyComparison": monthly_comparison,
            "weeklyComparison": weekly_breakdown,
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
