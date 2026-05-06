import requests
import time
import json

NODE_URL = "http://localhost:8000" # Assuming the dashboard service is running locally for simulation

def run_emergency_health_alert():
    print("\n--- Scenario 1: Emergency Health Alert ---")
    payload = {
        "symptoms": "Patient has severe respiratory distress and high fever (40C).",
        "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..." # Mock image
    }
    
    print("1. Sending High-Risk Health Triage Request...")
    response = requests.post(f"{NODE_URL}/ai/triage", json=payload)
    print(f"Node Response: {response.json()}")
    
    # Simulating the Appwrite Webhook that would be triggered after saving
    print("\n2. Simulating Appwrite Webhook (Critical Record Created)...")
    webhook_payload = {
        "$id": "patient-007-critical",
        "$collectionId": "health_records",
        "status": "Critical",
        "riskLevel": "High"
    }
    webhook_response = requests.post(f"{NODE_URL}/webhook/new-record", json=webhook_payload)
    print(f"E-ink Status: {webhook_response.json()}")

def run_solar_strained_agri_sync():
    print("\n--- Scenario 2: Solar-Strained Agri Sync ---")
    print("Simulating battery at 30% via Header (Throttling threshold is 40%)...")
    
    headers = {"X-Simulated-Battery": "30"}
    payload = {
        "symptoms": "Cassava leaf check", # Using triage endpoint for throttle test
        "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..." 
    }
    
    print("1. Sending Request with Image during Low Power...")
    response = requests.post(f"{NODE_URL}/ai/triage", json=payload, headers=headers)
    print(f"Node Throttling Response: {response.json()}")

if __name__ == "__main__":
    try:
        # Check if node is running
        requests.get(f"{NODE_URL}/status")
    except:
        print(f"Error: Node dashboard service not detected at {NODE_URL}. Please start dashboard.py first.")
        exit(1)
        
    run_emergency_health_alert()
    time.sleep(2)
    run_solar_strained_agri_sync()
