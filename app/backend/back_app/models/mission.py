from pydantic import BaseModel

class Mission(BaseModel):
    id: int
    name: str
    description: str | None = None