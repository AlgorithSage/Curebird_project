# Use an official Python runtime as a parent image
FROM python:3.9-slim

# 1. Set the working directory in the container
WORKDIR /app

# 2. Copy the dependencies file to the working directory
COPY requirements.txt .

# 3. Install Python packages (including google-cloud-vision)
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy the rest of the backend code
COPY . .

# 5. Make port 8080 available to the world outside this container
EXPOSE 8080

# 6. Define environment variable for Flask
# IMPORTANT: If your main file is named 'app.py', change this to 'app.py'
ENV FLASK_APP=run.py

# 7. Run the application
# Cloud Run sets the PORT environment variable, usually 8080
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 run:app