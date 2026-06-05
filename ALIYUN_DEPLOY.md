# Deploy on Alibaba Cloud

This app can run on Alibaba Cloud ECS or Lightweight Application Server.

## Recommended server

- OS: Ubuntu 22.04 or Ubuntu 24.04
- Public bandwidth: 1 Mbps or higher
- Open inbound port: `8765`

## Upload code

Push this project to GitHub first, then clone it on the server:

```bash
git clone https://github.com/squarelittlecan/BoDao-Fund-Report.git
cd BoDao-Fund-Report
```

## Run with Python

```bash
sudo apt update
sudo apt install -y python3 python3-pip
export APP_PASSWORD="your_password_here"
python3 app_server.py --host 0.0.0.0 --port 8765
```

Visit:

```text
http://your_server_public_ip:8765
```

## Run in background

```bash
export APP_PASSWORD="your_password_here"
nohup python3 app_server.py --host 0.0.0.0 --port 8765 > app.log 2>&1 &
```

Check logs:

```bash
tail -f app.log
```

Stop:

```bash
pkill -f app_server.py
```

## Run with Docker

```bash
sudo apt update
sudo apt install -y docker.io
sudo systemctl enable --now docker
sudo docker build -t bodao-fund-report .
sudo docker run -d \
  --name bodao-fund-report \
  -p 8765:8765 \
  -e APP_PASSWORD="your_password_here" \
  --restart unless-stopped \
  bodao-fund-report
```

Visit:

```text
http://your_server_public_ip:8765
```

## Alibaba Cloud security group

In the Alibaba Cloud console, open inbound TCP port `8765` for the server.

For production with a domain, use Nginx and HTTPS, then proxy port `80/443` to `127.0.0.1:8765`.
