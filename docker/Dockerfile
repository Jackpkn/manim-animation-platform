FROM python:3.10-slim

# Install system dependencies for Manim
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    texlive-full \
    && rm -rf /var/lib/apt/lists/*

# Install Manim
RUN pip install manim

# Working directory
WORKDIR /app

# Copy execution script
COPY execute_manim.py .

# Expose port if needed for future enhancements
EXPOSE 8000

CMD ["python", "execute_manim.py"]