#!/bin/bash

# Update and install node.js, npm, and git
sudo apt-get update
sudo apt-get install -y curl git build-essential

# Install Node.js (latest LTS)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB (if not using managed service)
# For Ubuntu 20.04 example:
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Clone repo (replace URL with your repo)
git clone https://github.com/yourusername/lms-backend.git
cd lms-backend

# Install dependencies
npm install

# Setup environment variables (example, adjust as needed)
cat > .env <<EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms-backend-db
JWT_SECRET=your_jwt_secret_here
EOL

# Start the app using pm2 or forever for production
npm install -g pm2
pm2 start app.js --name lms-backend

# Setup pm2 to auto-start on reboot
pm2 startup systemd
pm2 save

echo "Setup completed! Your LMS backend is running."
