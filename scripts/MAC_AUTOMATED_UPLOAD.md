# 🍎 Mac Automated Portfolio Upload Setup

**Set-and-forget nightly uploads from your Mac to Azure.**  
Drop images in `~/Pictures/Portfolio` → They appear on your website at midnight.

## ✅ What You'll Have

- **~/portfolio-sync/** folder with:
  - `upload_portfolio_images.py` — upload script
  - `.env` — Azure connection strings (private)
  - `upload_portfolio_images.json` — tracks last run
- **Nightly automation** via cron or launchd
- **Public blob storage** so your React app can display images instantly
- **Metadata in Cosmos DB** for rich portfolio features

---

## 🚀 Quick Setup

**Run this one command:**
```bash
cd /path/to/kihokosite/scripts && chmod +x setup_mac_upload.sh && ./setup_mac_upload.sh
```

Then follow the prompts to configure your Azure connection strings.

---

## 📋 Manual Setup (if you prefer step-by-step)

### 1. Azure Storage Setup

1. **Azure Portal** → Storage accounts → Your account → **Containers**
2. Click **+ Container**, name it `media`, set **Public access level** → **Blob**
3. Go to **Shared access tokens** → Generate SAS with:
   - ✅ **Read, Write, List** permissions  
   - ✅ Valid for **1 year**
   - Copy the **Connection string**

### 2. Mac Environment Setup

```bash
# Install Python 3 (if not already installed)
brew install python3

# Create project directory
mkdir ~/portfolio-sync && cd ~/portfolio-sync

# Setup Python virtual environment
python3 -m venv .venv && source .venv/bin/activate

# Install Azure SDK
pip install azure-storage-blob azure-cosmos python-dotenv
```

### 3. Configuration

Create `~/portfolio-sync/.env`:
```bash
# Azure Blob Storage (required)
AZURE_CONN_STR="BlobEndpoint=https://YOURACCOUNTNAME.blob.core.windows.net/;SharedAccessSignature=sv=2022-11-02&ss=b&srt=sco&sp=rwdlacupiytfx&se=2025-12-31T23:59:59Z&st=2024-01-01T00:00:00Z&spr=https&sig=YOURSIGNATURE"

# Container name
CONTAINER="media"

# Local directory to monitor
WATCH_DIR="/Users/YOURUSERNAME/Pictures/Portfolio"

# Optional: Cosmos DB for metadata
COSMOS_CONN_STR="AccountEndpoint=https://YOURACCOUNTNAME.documents.azure.com:443/;AccountKey=YOURKEY;"
COSMOS_DATABASE="kihokodb"
```

### 4. Copy the Upload Script

Copy `upload_portfolio_images.py` to `~/portfolio-sync/` and make it executable:
```bash
chmod +x ~/portfolio-sync/upload_portfolio_images.py
```

### 5. Test the Setup

```bash
cd ~/portfolio-sync
source .venv/bin/activate
python upload_portfolio_images.py
```

You should see: `📁 No new images found` (which means it's working!)

---

## ⏰ Automated Scheduling

### Option A: Cron (Simple)

1. **Grant Terminal Full Disk Access:**
   - System Settings → Privacy & Security → Full Disk Access → **+** → `/usr/sbin/cron`

2. **Setup cron job:**
   ```bash
   crontab -e
   ```
   
   Add this line (replace USERNAME):
   ```
   0 0 * * * /Users/USERNAME/portfolio-sync/.venv/bin/python /Users/USERNAME/portfolio-sync/upload_portfolio_images.py >> /Users/USERNAME/Library/Logs/portfolio_sync.log 2>&1
   ```

### Option B: LaunchAgent (Apple's Way)

1. **Create launch agent:**
   ```bash
   mkdir -p ~/Library/LaunchAgents
   ```

2. **Create `~/Library/LaunchAgents/com.kihoko.portfolio-sync.plist`:**
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.kihoko.portfolio-sync</string>
       <key>ProgramArguments</key>
       <array>
           <string>/Users/USERNAME/portfolio-sync/.venv/bin/python</string>
           <string>/Users/USERNAME/portfolio-sync/upload_portfolio_images.py</string>
       </array>
       <key>StartCalendarInterval</key>
       <dict>
           <key>Hour</key><integer>0</integer>
           <key>Minute</key><integer>0</integer>
       </dict>
       <key>StandardOutPath</key>
       <string>/Users/USERNAME/Library/Logs/portfolio_sync.log</string>
       <key>StandardErrorPath</key>
       <string>/Users/USERNAME/Library/Logs/portfolio_sync.err</string>
   </dict>
   </plist>
   ```

3. **Load the agent:**
   ```bash
   launchctl load ~/Library/LaunchAgents/com.kihoko.portfolio-sync.plist
   ```

---

## 🎨 Usage

1. **Add images** to `~/Pictures/Portfolio/`
2. **Wait until midnight** (or run manually for testing)
3. **Images appear** on your website automatically!

**Manual run for testing:**
```bash
cd ~/portfolio-sync && source .venv/bin/activate && python upload_portfolio_images.py
```

---

## 🔍 Monitoring & Logs

**View logs:**
```bash
tail -f ~/Library/Logs/portfolio_sync.log
```

**Check what's scheduled:**
```bash
# For cron
crontab -l

# For launchd
launchctl list | grep kihoko
```

**Debug runs:**
```bash
cd ~/portfolio-sync
source .venv/bin/activate
python upload_portfolio_images.py
```

---

## 🛡️ Security Features

- ✅ **Upload API disabled** - no public uploads possible
- ✅ **Local-only processing** - connection strings never leave your Mac
- ✅ **SAS token with expiration** - time-limited access
- ✅ **Read-only public container** - website can display but not modify
- ✅ **Private .env file** - credentials stay local

---

## 🚨 **CRITICAL: Upload API Now Disabled**

The web upload endpoint (`/api/UploadImage`) has been **disabled** for security:
- Returns **403 Forbidden** 
- Message: *"Public uploads are disabled for security"*
- ✅ **Only your local script can upload images**

---

## 💡 Pro Tips

**Bulk upload existing images:**
```bash
# Touch all files to mark them as "new"
find ~/Pictures/Portfolio -name "*.jpg" -exec touch {} \;

# Then run the script
cd ~/portfolio-sync && source .venv/bin/activate && python upload_portfolio_images.py
```

**Check what will be uploaded:**
```bash
# Shows files newer than last run without uploading
cd ~/portfolio-sync && source .venv/bin/activate
python -c "
import upload_portfolio_images as script
files = script.find_new_images(script.load_last_run())
print(f'Would upload: {[f.name for f in files]}')
"
```

**Reset state (force re-upload everything):**
```bash
rm ~/portfolio-sync/upload_portfolio_images.json
```

---

## 🎯 Your Images Appear At:

**On your website:**
```
https://polite-river-0804e5800.2.azurestaticapps.net
```

**Direct blob URLs:**
```
https://YOURACCOUNTNAME.blob.core.windows.net/media/images/filename.jpg
```

**Perfect for a set-and-forget portfolio workflow!** 🎨✨ 