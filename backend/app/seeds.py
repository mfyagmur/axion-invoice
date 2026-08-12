"""
Seed admin user and other initial data for development/testing.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, AccountType
from app.models.subscription import Plan, Subscription, BillingInterval

ADMIN_ID = uuid.UUID("00000000-0000-0000-0000-0000000000a1")
ADMIN_EMAIL = "admin@axioninvoice.app"
ADMIN_PASSWORD = "Admin@123456"
ADMIN_FULL_NAME = "Admin Kullanıcı"

def seed_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.execute(
            select(User).where(User.email == ADMIN_EMAIL)
        ).scalar_one_or_none()

        if existing:
            print(f"✅ Admin user already exists: {ADMIN_EMAIL}")
            return

        # Get Business plan
        business_plan = db.execute(
            select(Plan).where(Plan.key == "business")
        ).scalar_one_or_none()

        if not business_plan:
            print("❌ Business plan not found in database")
            return

        # Create admin user
        admin_user = User(
            id=ADMIN_ID,
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            full_name=ADMIN_FULL_NAME,
            account_type=AccountType.BIREYSEL,
            locale="tr",
            is_demo=False,
            is_admin=True,
            invoice_sequence=0,
        )
        db.add(admin_user)
        db.flush()

        # Create Business subscription for admin
        subscription = Subscription(
            id=uuid.uuid4(),
            user_id=ADMIN_ID,
            plan_id=business_plan.id,
            status="active",
            billing_interval=BillingInterval.MONTHLY,
            current_period_end=None,
            stripe_subscription_id=None,
        )
        db.add(subscription)
        db.commit()

        print(f"""
✅ Admin user seeded successfully!

📋 Admin Credentials:
   Email:    {ADMIN_EMAIL}
   Password: {ADMIN_PASSWORD}
   User ID:  {ADMIN_ID}
   Full Name: {ADMIN_FULL_NAME}
   Is Admin: True
   Plan:     Business (Unlimited)
""")

    except Exception as e:
        print(f"❌ Error seeding admin: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
