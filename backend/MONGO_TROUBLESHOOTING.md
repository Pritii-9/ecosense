# MongoDB Connection Troubleshooting

## Problem
DNS resolution failure for MongoDB Atlas SRV record (`_mongodb._tcp.cluster0.ufbixi2.mongodb.net`)

## Solutions (try in order)

### Solution 1: Change DNS Server (Recommended)
Your router's DNS (192.168.1.1) is failing. Use Google's public DNS instead:

**Windows:**
1. Open Network Settings > Change adapter options
2. Right-click your active network adapter > Properties
3. Select "Internet Protocol Version 4 (TCP/IPv4)" > Properties
4. Select "Use the following DNS server addresses"
5. Enter:
   - Preferred DNS server: `8.8.8.8`
   - Alternate DNS server: `8.8.4.4`
6. Click OK and restart your terminal

**Or via Command Prompt (as Administrator):**
```cmd
netsh interface ip set dns name="Wi-Fi" static 8.8.8.8
```

### Solution 2: Use Direct Connection String
Replace the SRV connection string in `.env` with a direct connection:

```
MONGO_URI=mongodb://pvjadhav2513_db_user:z8xq5AiC6maC2nKk@ac-xxxxx-shard-00-00.ufbixi2.mongodb.net:27017,ac-xxxxx-shard-00-01.ufbixi2.mongodb.net:27017,ac-xxxxx-shard-00-02.ufbixi2.mongodb.net:27017/?ssl=true&replicaSet=atlas-xxxxxx&authSource=admin&retryWrites=true&retryReads=true
```

To get the exact direct connection string:
1. Go to MongoDB Atlas: https://cloud.mongodb.com/
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Driver: Python" and "Version: 4.0 or later"
5. Copy the connection string and replace the one in `.env`

### Solution 3: Flush DNS Cache
```cmd
ipconfig /flushdns
```

### Solution 4: Check MongoDB Atlas Network Access
1. Go to MongoDB Atlas
2. Navigate to Network Access
3. Ensure your IP address is whitelisted (or use 0.0.0.0/0 for testing)

### Solution 5: Test MongoDB Connection
Test if MongoDB Atlas is reachable:
```cmd
nslookup _mongodb._tcp.cluster0.ufbixi2.mongodb.net 8.8.8.8
```

If this works with 8.8.8.8 but not with your default DNS, the issue is definitely your DNS server.