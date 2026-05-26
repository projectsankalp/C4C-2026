import uvicorn
from src.main import app
from src.database import engine
from src import models

if __name__ == "__main__":
    models.Base.metadata.create_all(bind=engine)
    uvicorn.run(app, host="0.0.0.0", port=8000)
