from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ENGINEER = "engineer"
    REVIEWER = "reviewer"
    ADMIN = "admin"
