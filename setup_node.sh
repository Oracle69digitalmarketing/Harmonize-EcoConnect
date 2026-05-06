#!/bin/bash

# Harmonize EcoConnect Node Provisioning Script
# Target: Raspberry Pi Zero 2W (64-bit Lite OS)

set -e

echo "Starting Harmonize EcoConnect Provisioning..."

# 1. Update and Install System Tools
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-pil python3-numpy git docker.io docker-compose hostapd dnsmasq i2c-tools uvicorn

# 2. Expand Swap to 2GB (Crucial for Appwrite/Docker on 512MB RAM)
echo "Expanding swap to 2GB..."
sudo dphys-swapfile swapoff || true
sudo sed -i 's/CONF_SWAPSIZE=100/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# 3. Enable Hardware Interfaces
echo "Enabling SPI and I2C..."
sudo raspi-config nonint do_spi 0
sudo raspi-config nonint do_i2c 0

# 4. Networking: Local WiFi Access Point (Harmonize-Local)
echo "Configuring WiFi Access Point..."
sudo systemctl stop hostapd dnsmasq || true

# Static IP for wlan0
if ! grep -q "interface wlan0" /etc/dhcpcd.conf; then
sudo tee -a /etc/dhcpcd.conf <<EOF
interface wlan0
    static ip_address=192.168.4.1/24
    nohook wpa_supplicant
EOF
fi

# DHCP Config
sudo tee /etc/dnsmasq.conf <<EOF
interface=wlan0
dhcp-range=192.168.4.2,192.168.4.50,255.255.255.0,24h
EOF

# hostapd Config
sudo tee /etc/hostapd/hostapd.conf <<EOF
country_code=NG
interface=wlan0
ssid=Harmonize-Local
hw_mode=g
channel=7
wpa=2
wpa_passphrase=HarmonizeEco2026
wpa_key_mgmt=WPA-PSK
EOF

sudo sed -i 's/#DAEMON_CONF=""/DAEMON_CONF="\/etc\/hostapd\/hostapd.conf"/' /etc/default/hostapd

sudo systemctl unmask hostapd
sudo systemctl enable hostapd dnsmasq

# 5. Appwrite Installation (Headless)
echo "Setting up Appwrite..."
mkdir -p ~/appwrite && cd ~/appwrite
# Note: In a real automated script, we'd pass environment variables to skip interactive prompts
# curl -sL https://appwrite.io/install | bash

# 6. Python Environment and Dashboard Service
echo "Setting up Python services and hardware drivers..."
pip3 install fastapi uvicorn pillow tflite-runtime pyserial adafruit-circuitpython-ads1x15

# Add user to hardware groups
sudo usermod -a -G dialout pi
sudo usermod -a -G i2c pi

# Create Systemd Service
sudo tee /etc/systemd/system/ecoconnect.service <<EOF
[Unit]
Description=EcoConnect Webhook Listener & AI Inference
After=network.target

[Service]
ExecStart=/usr/bin/python3 /home/pi/Harmonize-EcoConnect/dashboard.py
WorkingDirectory=/home/pi/Harmonize-EcoConnect
StandardOutput=inherit
StandardError=inherit
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable ecoconnect.service

# 7. Read-only Filesystem (Optional, commented out by default for safety)
# echo "Enabling OverlayFS..."
# sudo raspi-config nonint enable_overlayfs

echo "Provisioning complete. Please reboot to activate all changes."
