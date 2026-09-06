from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
)


class Settings(BaseSettings):
    app_name: str = "AI SRE Triage Copilot"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = True

    database_url: str = ""

    gemini_api_key: str = ""
    ai_model: str = "gemini-2.5-flash"
    ai_enabled: bool = True

    jwt_secret_key: str = (
        "change-this-in-production"
    )

    jwt_algorithm: str = "HS256"

    access_token_expire_minutes: int = 60

    # ServiceNow
    servicenow_url: str = ""
    servicenow_username: str = ""
    servicenow_password: str = ""
    servicenow_enabled: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()