# Start Backend (Navigate to backend, activate venv, run python script)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; python run.py"

# Start Frontend (Run npm start in root)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"
