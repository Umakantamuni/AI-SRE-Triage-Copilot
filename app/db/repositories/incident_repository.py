from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.incident import IncidentDB


class IncidentRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(self, incident: IncidentDB) -> IncidentDB:
        self.db.add(incident)
        self.db.commit()
        self.db.refresh(incident)

        return incident

    def get_by_incident_id(
        self,
        incident_id: str,
    ) -> IncidentDB | None:

        statement = select(IncidentDB).where(
            IncidentDB.incident_id == incident_id
        )

        return self.db.scalar(statement)

    def list_all(self) -> list[IncidentDB]:

        statement = select(IncidentDB).order_by(
            IncidentDB.created_at.desc()
        )

        return list(self.db.scalars(statement).all())