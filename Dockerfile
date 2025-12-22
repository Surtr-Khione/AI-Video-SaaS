FROM python:3.11-slim

# Install system dependencies for Chrome and Selenium
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY scrape_airtable.py .
COPY scrape_airtable_n8n.py .
COPY api_server.py .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV HEADLESS=true
ENV PORT=5000

# Expose port for API server
EXPOSE 5000

# Default command runs the API server
CMD ["python", "api_server.py"]
