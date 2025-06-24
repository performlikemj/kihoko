# 🔒 Secure Image Upload Script

This script provides a **secure way** to upload images to your Kihoko portfolio **from your local computer only**.

## ⚠️ Security Benefits

- **No public upload endpoint** - only you can upload
- **Direct Azure access** - bypasses the web API entirely  
- **Local credentials** - connection strings never leave your computer
- **No authentication needed** - because it runs locally

## 🚀 Setup

1. **Install dependencies** (if not already done):
   ```bash
   cd scripts
   npm install
   ```

2. **Create `.env` file** in the `scripts` directory:
   ```bash
   # Azure Blob Storage Connection String
   AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=your_storage_account;AccountKey=your_key;EndpointSuffix=core.windows.net"
   
   # Azure Cosmos DB Connection String  
   AZURE_COSMOS_CONNECTION_STRING="AccountEndpoint=https://your_account.documents.azure.com:443/;AccountKey=your_key;"
   
   # Database name
   AZURE_COSMOS_DATABASE_NAME="kihokodb"
   ```

3. **Get your connection strings** from Azure Portal:
   - **Blob Storage**: Storage Account > Access keys
   - **Cosmos DB**: Cosmos DB Account > Keys

## 📖 Usage

### Basic upload:
```bash
node secure-upload.js ~/Desktop/my-artwork.jpg
```

### Upload with metadata:
```bash
node secure-upload.js ~/Desktop/artwork.jpg \
  --title "Beautiful Landscape" \
  --description "Oil painting of mountain scenery" \
  --featured \
  --tags "landscape,oil,mountains"
```

### View available categories:
```bash
node secure-upload.js
```

### All options:
```bash
node secure-upload.js <image-path> \
  --title "Title" \
  --description "Description" \
  --category-id "uuid-here" \
  --tags "tag1,tag2,tag3" \
  --featured \
  --order 5
```

## 🛡️ Security Notes

- **Keep `.env` file private** - never commit it to git
- **Only run from your trusted computer**
- **Connection strings have full access** - treat them like passwords
- **Script bypasses all web security** - because it's local-only

## 🔧 Troubleshooting

- **"Missing environment variables"**: Create the `.env` file with your Azure connection strings
- **"File not found"**: Check the image path is correct
- **"Upload failed"**: Verify your Azure connection strings are valid

This is the **most secure** way to manage your portfolio uploads! 🎨 