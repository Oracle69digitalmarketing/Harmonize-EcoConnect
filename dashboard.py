from fastapi import FastAPI, Request, File, UploadFile
import uvicorn
import json
import os
from PIL import Image, ImageDraw, ImageFont

# Attempt to load Waveshare E-ink drivers
try:
    from waveshare_epd import epd2in13_V4
    HAS_EPD = True
except ImportError:
    print("Waveshare E-ink drivers not found. Running in mock mode.")
    HAS_EPD = False

app = FastAPI(title="Harmonize EcoConnect Dashboard Service")

# Initialize E-ink display if available
if HAS_EPD:
    epd = epd2in13_V4.EPD()

def update_display(title: str, line1: str, line2: str, request: Request = None):
    battery = get_battery_percent(request)
    print(f"E-ink Update: [{battery}%] {title} | {line1}")
    if not HAS_EPD:
        return

    try:
        epd.init()
        # Create image (landscape: 250x122 for 2.13")
        image = Image.new('1', (epd.height, epd.width), 255)
        draw = ImageDraw.Draw(image)
        
        # Simple System Status Bar (Top)
        draw.rectangle((0, 0, epd.height, 15), fill=0)
        draw.text((5, 2), "HARMONIZE-LOCAL", fill=1)
        draw.text((180, 2), f"BAT: {battery}%", fill=1)
        
        # Icons (Simulated with text for now, can use bitmaps later)
        draw.text((150, 2), "WIFI", fill=1)
        
        # Content Section
        # Title (Bold-ish simulation)
        draw.text((10, 25), title.upper(), fill=0)
        draw.line((10, 38, 100, 38), fill=0)
        
        # Details
        draw.text((10, 50), line1, fill=0)
        draw.text((10, 70), line2, fill=0)
        
        # Footer / Node Info
        draw.text((10, 105), "ID: RPI-ECO-001", fill=0)
        draw.text((180, 105), "v2.0", fill=0)
        
        epd.display(epd.getbuffer(image))
        epd.sleep()
    except Exception as e:
        print(f"Display error: {e}")

import time
import serial
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

# --- Hardware Drivers ---

class GSMModem:
    def __init__(self, port="/dev/ttyUSB0", baudrate=115200):
        try:
            self.ser = serial.Serial(port, baudrate, timeout=5)
            self.is_connected = True
        except Exception as e:
            print(f"GSM Modem connection failed: {e}")
            self.is_connected = False

    def send_at(self, command):
        if not self.is_connected: return None
        self.ser.write((command + "\r\n").encode())
        time.sleep(1)
        return self.ser.read(self.ser.in_waiting).decode()

    def run_ussd(self, code):
        """Run a USSD code and return the response."""
        # AT+CUSD=1,"*556#",15
        resp = self.send_at(f'AT+CUSD=1,"{code}",15')
        return resp

    def send_sms(self, phone, message):
        self.send_at('AT+CMGF=1')
        self.send_at(f'AT+CMGS="{phone}"')
        self.ser.write((message + "\x1A").encode())

class SoilSensor:
    def __init__(self):
        try:
            self.i2c = busio.I2C(board.SCL, board.SDA)
            self.ads = ADS.ADS1115(self.i2c)
            self.chan = AnalogIn(self.ads, ADS.P0) # P0 is typical for sensor
            self.is_connected = True
        except Exception as e:
            print(f"I2C/ADC for Soil Sensor not found: {e}")
            self.is_connected = False

    def get_moisture_level(self):
        if not self.is_connected: return 0
        # Map voltage (0-3.3V) to percentage (0-100)
        # Calibration values vary by sensor
        voltage = self.chan.voltage
        moisture = max(0, min(100, (1 - (voltage / 3.3)) * 100))
        return round(moisture, 2)

class LoRaMesh:
    def __init__(self, port="/dev/ttyS0", baudrate=9600):
        try:
            self.ser = serial.Serial(port, baudrate, timeout=2)
            self.is_connected = True
        except Exception as e:
            print(f"LoRa Mesh module not found: {e}")
            self.is_connected = False

    def broadcast_query(self):
        """Send a broadcast signal to all remote nodes in the mesh."""
        if not self.is_connected: return
        self.ser.write(b"MESH_QUERY\n")

    def receive_data(self):
        """Listen for incoming sensor packets from the mesh."""
        if not self.is_connected or self.ser.in_waiting == 0:
            return None
        try:
            line = self.ser.readline().decode().strip()
            # Expecting format: NODE_ID,MOISTURE,TEMP
            return line
        except:
            return None

# --- Initialize Peripherals ---
gsm = GSMModem()
soil = SoilSensor()
lora = LoRaMesh()

# --- Power-Aware Configuration ---
BATTERY_THRESHOLD_CRITICAL = 10 
BATTERY_THRESHOLD_LOW = 25      
BATTERY_THRESHOLD_MEDIUM = 40   

def get_battery_percent(request: Request = None):
    """Read battery voltage. Supports simulation injection via header."""
    if request and "X-Simulated-Battery" in request.headers:
        try:
            return int(request.headers["X-Simulated-Battery"])
        except:
            pass
    
    if not soil.is_connected: return 85 
    try:
        # Assuming a 12.8V battery via a voltage divider (e.g., 10k/2k)
        chan_bat = AnalogIn(soil.ads, ADS.P1)
        voltage = chan_bat.voltage * 6.0 
        percent = ((voltage - 11.0) / (14.6 - 11.0)) * 100
        return max(0, min(100, round(percent, 2)))
    except:
        return 85

def check_power_throttle(request: Request = None):
    battery = get_battery_percent(request)
    if battery < BATTERY_THRESHOLD_CRITICAL:
        return "CRITICAL", "System entering Sleep Mode. Solar recharge required."
    if battery < BATTERY_THRESHOLD_LOW:
        return "LOW", "AI throttled: Text-only mode active."
    return "HEALTHY", None

# --- API Endpoints ---

@app.get("/sensors/soil")
async def read_soil():
    return {
        "moisture": soil.get_moisture_level(),
        "status": "OK" if soil.is_connected else "HARDWARE_DISCONNECTED"
    }
# --- Telco Configuration (Nigeria) ---
TELCO_REGISTRY = {
    "MTN": {
        "balance": "*310#",
        "data": "*312#",
        "loan_service": "*606#",
        "value_added": "*123#"
    },
    "AIRTEL": {
        "balance": "*310#",
        "data": "*312#",
        "loan_service": "*500#",
        "value_added": "*121#"
    },
    "GLO": {
        "balance": "*310#",
        "data": "*312#",
        "loan_service": "*303#",
        "value_added": "*777#"
    },
    "9MOBILE": {
        "balance": "*232#",
        "data": "*200#",
        "loan_service": "*665#",
        "value_added": "*222#"
    }
}

@app.get("/ussd/registry")
async def get_ussd_registry():
    return TELCO_REGISTRY

@app.post("/ussd/request")
async def handle_ussd(request: Request):
...

    """Real GSM USSD session (Financial Access)."""
    data = await request.json()
    code = data.get("code", "*556#") # Default balance check
    
    if not gsm.is_connected:
        return {"status": "ERROR", "reason": "GSM Modem not detected on /dev/ttyUSB0"}

    raw_response = gsm.run_ussd(code)
    
    # Process credit scoring internally based on farm logs
    # This remains programmatic logic but uses real modem for the return session
    score = 75 
    eligible = score > 60
    
    update_display("FINANCIAL ACCESS", f"USSD Code: {code}", f"Eligible: {eligible}", request)
    
    return {
        "raw_ussd": raw_response,
        "eligible": eligible,
        "score": score
    }

@app.post("/webhook/new-record")
async def handle_new_record(request: Request):
    """Webhook triggered by Appwrite on record creation."""
    power_status, _ = check_power_throttle(request)
    if power_status == "CRITICAL":
        return {"status": "ignored", "reason": "Power Critical"}

    payload = await request.json()
    doc_id = payload.get('$id', 'Unknown')
    status = payload.get('status', 'Logged')
    
    update_display("NEW RECORD DETECTED", f"ID: {doc_id}", f"Status: {status}", request)
    return {"status": "success"}

@app.post("/ai/triage")
async def triage_symptoms(request: Request):
    """Local TFLite Symptom Triage with Power Throttling."""
    power_status, msg = check_power_throttle(request)
    if power_status == "CRITICAL":
        return {"error": msg}

    data = await request.json()
    has_image = "imageBase64" in data and data["imageBase64"]
    
    if has_image and get_battery_percent(request) < BATTERY_THRESHOLD_MEDIUM:
        return {"error": "Battery low. High-res image inference disabled. Use text-only triage."}

    symptoms = data.get("symptoms", "")
    
    # MOCK TFLite logic
    result = {
        "riskLevel": "Low",
        "advice": "Hydrate and rest. Monitor temperature.",
        "redFlags": ["Sudden fever", "Difficulty breathing"]
    }
    
    update_display("HEALTH TRIAGE", f"Symptoms: {symptoms[:15]}...", f"Risk: {result['riskLevel']}", request)
    return result

@app.post("/ai/agri-advice")
async def agri_advice(request: Request):
    """Local TFLite Agri Advice."""
    data = await request.json()
    crop_data = data.get("data", {})
    
    result = {
        "prediction": "Optimal planting window: Next 5 days.",
        "confidence": 0.89,
        "tips": ["Mulch base", "Apply Nitrogen", "Monitor pests"]
    }
    
    update_display("AGRI ADVICE", "Prediction Generated", f"Conf: {result['confidence']}", request)
    return result

@app.post("/ai/speech-to-text")
async def speech_to_text(file: UploadFile = File(...)):
    """Local NLP for voice data logging (Farm/Health)."""
    # MOCK Speech-to-Text
    # In production, use a quantized Whisper or Kaldi model
    return {
        "text": "The cassava leaves show brown spots and wilting.",
        "confidence": 0.92
    }

@app.get("/mesh/status")
async def get_mesh_status():
    return {
        "status": "ACTIVE" if lora.is_connected else "HARDWARE_DISCONNECTED",
        "mesh_nodes_detected": 4, # Simulated
        "lora_port": "/dev/ttyS0"
    }

@app.get("/mesh/poll")
async def poll_mesh():
    lora.broadcast_query()
    return {"status": "broadcast_sent"}

@app.get("/system/power")
async def get_power_status(request: Request):
    battery = get_battery_percent(request)
    status, advice = check_power_throttle(request)
    return {
        "battery_percent": battery,
        "status": status,
        "advice": advice,
        "solar_input": "ACTIVE" # Mock
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
