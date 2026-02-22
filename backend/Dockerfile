FROM python:3.11-slim

# Instalar FFmpeg y dependencias del sistema
RUN apt-get update && apt-get install -y \
    ffmpeg \
    gcc \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir --upgrade yt-dlp

# Copiar el código
COPY . .

# Puerto que expone la app
EXPOSE 8080

# Iniciar con gunicorn
CMD ["gunicorn", "app:app", "--config", "gunicorn.conf.py", "--bind", "0.0.0.0:8080"]
