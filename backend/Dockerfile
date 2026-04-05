FROM python:3.13-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

# Use eventlet worker for Socket.IO support
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--worker-class", "eventlet", "-w", "1", "run:app"]
