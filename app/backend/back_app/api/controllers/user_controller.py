from datetime import datetime

# Mock database - replace with real database later
MOCK_USERS = [
    {
        "id": "U001",
        "name": "John Smith",
        "access_rights": "Admin",
        "start_date": "2025-01-01",
        "end_date": "2026-01-01",
        "last_login": "2025-08-12"
    },
    {
        "id": "U002",
        "name": "Jane Doe",
        "access_rights": "Operator",
        "start_date": "2025-02-01",
        "end_date": "2026-02-01",
        "last_login": "2025-08-11"
    }
]

MOCK_ROLES = [
    {
        "id": "R001",
        "name": "Admin",
        "description": "Full system access",
        "permissions": "All permissions"
    },
    {
        "id": "R002",
        "name": "Operator",
        "description": "Drone operation access",
        "permissions": "View, Execute missions"
    }
]

def list_users():
    return MOCK_USERS

def get_user(user_id: str):
    return next((user for user in MOCK_USERS if user["id"] == user_id), None)

def create_user(user_data: dict):
    new_user = {
        "id": f"U{str(len(MOCK_USERS) + 1).zfill(3)}",
        **user_data,
        "last_login": None
    }
    MOCK_USERS.append(new_user)
    return new_user

def update_user(user_id: str, user_data: dict):
    user = next((user for user in MOCK_USERS if user["id"] == user_id), None)
    if user:
        user.update(user_data)
    return user

def delete_user(user_id: str):
    user = next((user for user in MOCK_USERS if user["id"] == user_id), None)
    if user:
        MOCK_USERS.remove(user)
        return True
    return False

def list_roles():
    return MOCK_ROLES