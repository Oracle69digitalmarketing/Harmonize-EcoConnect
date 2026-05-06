# Harmonize EcoConnect — System Maintenance & Architecture

This file documents the edge-native architecture and provides instructions for managing the Raspberry Pi Zero 2W nodes.

## 1. System Components

- **Frontend**: React + Vite + TailwindCSS + shadcn/ui. Served as a PWA from the Pi.
- **Node Backend**: FastAPI (`dashboard.py`). Handles E-ink updates and TFLite inference.
- **Data Backend**: Appwrite (Dockerized). Manages users and document synchronization.
- **Hardware**: RPi Zero 2W, Waveshare 2.13" E-ink, Solar Power System.

## 2. Provisioning New Nodes

To set up a fresh Raspberry Pi OS Lite (64-bit) image:

1. Clone this repository to `/home/pi/Harmonize-EcoConnect`.
2. Run the provisioning script:
   ```bash
   chmod +x setup_node.sh && ./setup_node.sh
   ```
3. Reboot the device.

## 3. Local Cloud & Access Point

- **SSID**: `Harmonize-Local`
- **Passphrase**: `HarmonizeEco2026`
- **Static IP**: `192.168.4.1`
- **Dashboard URL**: `http://192.168.4.1`

## 4. AI Inference (TFLite & NLP)

Local AI models should be placed in `models/` as `.tflite` files.
The `dashboard.py` FastAPI service exposes:
- `POST /ai/triage`: Clinical symptom analysis.
- `POST /ai/agri-advice`: Crop yield and disease prediction.
- `POST /ai/speech-to-text`: NLP for voice-driven data logging.

### Power-Aware Throttling
Inference is automatically throttled based on battery levels:
- **>40%**: Full high-res image inference.
- **25-40%**: Text-only triage; image inference deferred.
- **<10%**: Critical Sleep Mode; all non-essential services halted.

## 5. LoRa Mesh & Peripheral Network

The Node acts as a **LoRa Gateway** to aggregate data from remote fields.
- **Port**: `/dev/ttyS0` (UART).
- **Communication**: Broadcasts `MESH_QUERY` signals; remote sensors reply with `ID,MOISTURE,TEMP` packets.
- **Protocol**: LoRa point-to-multipoint mesh.

## 6. Regional Management Dashboard (Appwrite)

To monitor multiple rural nodes from a central hub, configure the cloud Appwrite instance as follows:

### Collections Schema
- **`health_records`**:
    - `name` (string): Patient ID/Name.
    - `symptoms` (text): Local log.
    - `riskLevel` (string): Low, Medium, High.
    - `nodeId` (string): Identifier for the rural Pi.
- **`agri_logs`**:
    - `type` (enum): crop, soil, fish, waste.
    - `value` (string): Metric/Observation.
    - `location` (string): GPS coordinates from Pi (if available).
- **`mesh_nodes`**:
    - `id` (string): Peripheral sensor ID.
    - `battery` (float): Remote battery status.

### User Roles
- **`Admin`**: Full access to global trends and node statuses.
- **`Health Worker`**: Scoped access to local node patients.
- **`Field Officer`**: Access to agricultural yields and credit scores.

## 7. Security & Resilience

- **Encryption**: SQLite databases used by Appwrite and the local cache should be encrypted at rest using LUKS (OS-level) or Appwrite's internal encryption features.
- **Sentry Telemetry**: Errors are captured locally. Telemetry is compressed and uploaded ONLY when a high-bandwidth sync window (4G/Periodic WiFi) is active, preserving battery and solar budget.
- **Read-only Filesystem**: OverlayFS is enabled in `setup_node.sh` to protect against SD card corruption during sudden power drops.

## 7. Power Management

The `setup_node.sh` script installs tools to monitor GPIO.
- **Low Battery (<10%)**: The system is designed to perform a clean halt to prevent SD corruption.
- **Solar Native**: MPPT controller serial logs can be integrated into `dashboard.py` for real-time status updates on the E-ink display.

---

*Built for rural Nigeria — Solar-powered, Dust-proof, Edge-native.*
