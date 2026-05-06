# Harmonize EcoConnect
**AI-Powered, Solar Edge-Native Platform for Rural Resilience**

Harmonize EcoConnect is a standalone "local cloud" engineered to strengthen rural communities by merging predictive agriculture and primary healthcare into a single, intelligent, solar-powered node.

Built specifically for the constraints of rural Africa (Nigeria), it operates without cellular data, runs AI models directly on-device, and creates its own WiFi network to serve local users.

---

## 🛠️ Hardware Stack (The Node)
- **Compute**: Raspberry Pi Zero 2W (64-bit Lite OS).
- **Display**: Waveshare 2.13" E-ink HAT (status at-a-glance).
- **Peripherals**: 
    - GSM Modem (SIM7600/800L) for USSD & SMS.
    - Soil Moisture Sensors (Capacitive) via ADS1115 ADC.
    - LiFePO4 Battery + MPPT Solar Charge Controller.
- **Enclosure**: IP65 Dust/Waterproof housing with passive heatsink.

---

## 🚀 Hardware Assembly & Flashing Guide

### 1. Flashing the Software ("The Golden Image")
1.  **Download OS**: Use [Raspberry Pi Imager](https://www.raspberrypi.com/software/) to download **Raspberry Pi OS Lite (64-bit)**.
2.  **Advanced Settings**:
    *   Set hostname to `ecoconnect.local`.
    *   Enable **SSH** (use a strong password).
    *   Pre-configure your office WiFi for the initial setup.
3.  **Flash**: Write to a **High-Endurance microSD card** (e.g., SanDisk Max Endurance).
4.  **Boot & Clone**:
    ```bash
    ssh pi@ecoconnect.local
    git clone https://github.com/Oracle69digitalmarketing/Harmonize-EcoConnect
    cd Harmonize-EcoConnect
    chmod +x setup_node.sh && ./setup_node.sh
    ```
5.  **Reboot**: After the script finishes, the node will switch to its own WiFi AP.

### 2. Physical Setup (The Box)
- **Mounting**: Place the Raspberry Pi Zero 2W inside the **IP65 Enclosure** using standoffs.
- **Cooling**: Apply the **passive heatsink** to the Pi's SoC; rural temperatures can lead to thermal throttling during AI inference.
- **Power Wiring**:
    1. Connect the **Solar Panel** to the `Solar` terminals on the MPPT controller.
    2. Connect the **LiFePO4 Battery** to the `Battery` terminals.
    3. Connect the **Buck Converter** to the `Load` terminals, adjusting the output to exactly **5.1V**.
    4. Plug the converter into the Pi's Micro-USB power port or GPIO pins (5V/GND).
- **Peripherals**:
    - **E-ink**: Attach the Waveshare HAT directly to the GPIO.
    - **GSM Modem**: Connect to USB via a micro-USB adapter.
    - **Soil Sensors**: Wire to the **ADS1115 ADC** (I2C: SDA/SCL).

---

## 📖 How to Use

### 1. Connection
- Search for the WiFi network **`Harmonize-Local`** on your smartphone.
- Open your browser and go to **`http://192.168.4.1`**.
- Install the app as a **PWA** (Add to Home Screen) for the best offline experience.

### 2. Agri Mode (FarmConnect)
- **Logging**: Input soil moisture, crop status, or livestock observations via keypad or voice.
- **Local AI**: Receive instant tips on planting windows and pest control based on on-device TFLite models.
- **Sensors**: Real-time moisture data is automatically captured if soil sensors are connected.

### 3. Health Mode (AI Navigator)
- **Patient Registration**: Securely log patients even with zero internet.
- **Triage**: Use the symptom questionnaire + photo upload for clinical decision support.
- **Emergency**: The node can trigger SMS alerts to the nearest city hospital if a "Critical" triage result is generated.

### 4. Finance Mode (Financial Access)
- **USSD Bridge**: Dial telco shortcodes directly through the web UI using the built-in GSM modem.
- **Credit Scoring**: The platform calculates an on-device credit score based on your farming logs to facilitate micro-loans without a bank.

---

## ⚙️ Architecture & Security
- **Backend**: FastAPI (`dashboard.py`) + Appwrite (Docker).
- **Frontend**: React + TailwindCSS + shadcn/ui.
- **Data Sync**: SQLite-backed Appwrite DB. Syncs to cloud only when GSM/WiFi internet is detected.
- **Security**: 
    - RBAC (Role-Based Access Control) via Appwrite.
    - LUKS disk encryption recommended for patient privacy.
    - Read-only root filesystem (OverlayFS) to prevent power-cut corruption.
- **Power-Aware AI**: The system throttles high-res AI inference if the battery drops below 40% to preserve the node's uptime.

---

## 👨‍💻 Developer Notes
- **Webhooks**: Configure Appwrite webhooks to point to `http://host.docker.internal:8000/webhook/new-record`.
- **Telemetry**: Sentry logs are compressed and deferred until high-bandwidth sync windows.
- **Local IP**: Always use `192.168.4.1` for local API calls.

---
*Built for rural Nigeria — Solar-powered, Dust-proof, Edge-native.*
