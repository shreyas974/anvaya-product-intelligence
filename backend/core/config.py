from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ANVAYA Backend"
    app_env: str = "development"
    debug: bool = True

    database_url: str = "sqlite:///./data/anvaya.db"

    supabase_url: str = "https://placeholder.supabase.co"
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    ai_service_url: str = ""
    ai_service_timeout: float = 30.0

    cors_origins: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=["backend/.env", ".env"],
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()