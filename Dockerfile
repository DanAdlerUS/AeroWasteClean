FROM python:3.11-slim

# Optional: avoid needing build tools by using binary drivers
# (if you use psycopg3, ensure requirements uses psycopg[binary])
# Otherwise uncomment the apt-get block below if needed for builds.

# RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Set working directory to where your backend code will be mounted
# Compose mounts ./app -> /app, so backend is at /app/backend
WORKDIR /app/backend

# Install Python deps (use a small, cached layer if possible)
# If your requirements.txt is at the repo root, copy it first:
COPY app/requirements.txt /tmp/requirements.txt
RUN python -m pip install --upgrade pip && pip install -r /tmp/requirements.txt

# In dev, your code will be volume-mounted; COPY is optional.
# COPY app/backend /app/backend

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI (module path matches /app/backend/back_app/main.py)
CMD ["uvicorn", "back_app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
