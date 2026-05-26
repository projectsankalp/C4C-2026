from celery import Celery

celery_app = Celery(
    "worker",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0"
)

@celery_app.task
def process_telemetry_data(data):
    # Process and store high-throughput data
    print(f"Processing: {data}")
    return True
