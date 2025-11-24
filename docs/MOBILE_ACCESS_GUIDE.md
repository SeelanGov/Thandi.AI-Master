# Mobile Device Access Guide

## Quick Setup

### Step 1: Start Both Servers

**Terminal 1 - Next.js Dev Server:**
```bash
npm run dev
```

**Terminal 2 - Mock API Server:**
```bash
npm run mock:server
```

### Step 2: Verify Network Configuration

Check your computer's IP address:
```bash
# Windows PowerShell
ipconfig | Select-String "IPv4"
```

Your IP should be something like: `192.168.101.108`

### Step 3: Check Server Output

When `npm run dev` starts, it should show:
```
- Local:   http://localhost:3000
- Network: http://192.168.101.108:3000
```

If it **only** shows "Local", Next.js isn't listening on network interfaces.

**Fix:** Make sure `package.json` has:
```json
"dev": "next dev -H 0.0.0.0"
```

### Step 4: Configure Windows Firewall

#### Option A: Temporary Allow (Easiest)
When you start `npm run dev`, Windows might show a firewall popup:
- **"Allow Node.js to access network?"**
- Click **"Allow"**

#### Option B: Manual Firewall Rule (If No Popup)

1. Open **Windows Defender Firewall**
2. Click **"Advanced settings"**
3. Click **"Inbound Rules"** → **"New Rule"**
4. Choose **"Port"** → Next
5. **TCP**, Specific local ports: `3000, 3001` → Next
6. **Allow the connection** → Next
7. Apply to **all profiles** (Domain, Private, Public) → Next
8. Name it **"Node.js Dev Servers"** → Finish

### Step 5: Test from Mobile Phone

1. **Ensure phone and computer are on the same Wi-Fi network**
   - Not mobile data
   - Same router/Wi-Fi access point

2. **On your phone's browser, go to:**
   ```
   http://192.168.101.108:3000/assessment
   ```
   ⚠️ Replace `192.168.101.108` with YOUR actual IP address

3. **Fill out the assessment form**
   - Select subjects
   - Click Next
   - Form should submit to mock API at `192.168.101.108:3001`

### Troubleshooting

#### "This site can't be reached" or "Connection refused"

**Possible Causes:**

1. **Firewall blocking connections**
   - Try Option B above to add firewall rule
   - Or temporarily disable Windows Firewall to test

2. **Wrong IP address**
   - Check `ipconfig` again - IP may have changed
   - Make sure you're using Wi-Fi adapter IP (not Ethernet)

3. **Servers not running**
   - Check Terminal 1: `npm run dev` is running?
   - Check Terminal 2: `npm run mock:server` is running?
   - Verify ports: `netstat -ano | Select-String ":300[01]"`

4. **Different networks**
   - Phone on mobile data while computer on Wi-Fi? Won't work
   - Phone and computer must be on same Wi-Fi network

5. **Next.js only listening on localhost**
   - Check `package.json`: Should have `"dev": "next dev -H 0.0.0.0"`
   - Restart dev server after changing

#### Test Firewall Rule

From another device on the same network:
```bash
# Test if ports are accessible
telnet 192.168.101.108 3000
telnet 192.168.101.108 3001
```

If connection succeeds, firewall is working. If it times out, firewall is blocking.

### Current Configuration

- **Next.js Dev Server:** Port 3000 (accessible from network)
- **Mock API Server:** Port 3001 (accessible from network)
- **Your IP:** `192.168.101.108` (check with `ipconfig` if it changes)
- **Mobile URL:** `http://192.168.101.108:3000/assessment`

### Notes

- IP addresses can change when you reconnect to Wi-Fi
- Check IP address each time before testing from mobile
- Both servers must be running simultaneously
- Firewall rule persists after restart (Option B)




