import os
from backend.models.user_model import create_user

admin_pw = os.getenv("DEMO_ADMIN_PASSWORD")
test_pw = os.getenv("DEMO_TEST_PASSWORD")

if not admin_pw or not test_pw:
    raise RuntimeError("Set DEMO_ADMIN_PASSWORD and DEMO_TEST_PASSWORD in your environment (.env).")

create_user("admin", admin_pw)
create_user("test", test_pw)

print("✅ Demo users created/ensured: admin, test")
