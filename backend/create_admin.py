#!/usr/bin/env python3
"""Create or reset admin user"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.core.config import settings
from app.core.security import hash_password
import uuid

# Create database session
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    # Check if admin user exists
    admin_email = "admin@axioninvoice.app"
    admin_password = "Admin@123456"

    existing = db.query(User).filter(User.email == admin_email).first()

    if existing:
        print(f"✓ Admin user exists: {existing.email} (ID: {existing.id})")
        print("  Resetting password...")
        existing.password_hash = hash_password(admin_password)
        existing.is_admin = True
        db.commit()
        print(f"✓ Password reset to: {admin_password}")
    else:
        print(f"✗ Admin user not found. Creating...")
        admin_user = User(
            id=uuid.UUID("00000000-0000-0000-0000-0000000000a1"),
            email=admin_email,
            password_hash=hash_password(admin_password),
            full_name="Admin User",
            account_type="bireysel",
            is_admin=True,
            is_demo=False,
        )
        db.add(admin_user)
        db.commit()
        print(f"✓ Admin user created!")
        print(f"  Email: {admin_email}")
        print(f"  Password: {admin_password}")
        print(f"  ID: {admin_user.id}")

    # Show all users
    print("\n--- All Users ---")
    users = db.query(User).all()
    for user in users:
        print(f"  - {user.email} (admin: {user.is_admin}, id: {user.id})")

except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    db.close()
