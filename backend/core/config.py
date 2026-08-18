
from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ANVAYA Backend"
    app_env: str = "development"
    debug: bool = True

    database_url: str

    supabase_url: str
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    cors_origins: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
       env_file="backend/.env",
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