from sqlalchemy.orm import Session

from app.db.models.user import UserDB


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_username(
        self,
        username: str,
    ) -> UserDB | None:
        return (
            self.db.query(UserDB)
            .filter(
                UserDB.username == username
            )
            .first()
        )

    def get_by_email(
        self,
        email: str,
    ) -> UserDB | None:
        return (
            self.db.query(UserDB)
            .filter(
                UserDB.email == email
            )
            .first()
        )

    def create(
        self,
        user: UserDB,
    ) -> UserDB:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user