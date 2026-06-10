FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["fastmcp", "run", "app.py", "--transport", "streamable-http", "--host", "0.0.0.0", "--port", "8080"]