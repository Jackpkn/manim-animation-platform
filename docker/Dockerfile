FROM python:3.10-slim

# Install system dependencies for Manim
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    texlive-full \
    build-essential \
    python3-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Manim
RUN pip install manim

# Working directory
WORKDIR /app

# Create media directory with proper permissions
RUN mkdir -p /app/media/videos && chmod -R 777 /app/media

# Copy execution script
COPY execute_manim.py .

# Expose port if needed for future enhancements
EXPOSE 8000

CMD ["python", "execute_manim.py"]