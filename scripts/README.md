# Portfolio Migration Scripts

⚠️ **SECURITY WARNING**: These scripts contain infrastructure references and should NOT be committed to public repositories.

## Image Migration Script

This script migrates your existing blob storage images to Cosmos DB metadata records.

### Setup

1. **Copy environment template:**
   ```bash
   cp env.example .env
   ```

2. **Fill in your actual values** in `.env`:
   - `COSMOS_DB_ENDPOINT` - From Azure Portal
   - `COSMOS_DB_KEY` - From Azure Portal 
   - `COSMOS_DB_DATABASE_ID` - Usually "KihokoPortfolio"
   - `COSMOS_DB_CONTAINER_ID` - Usually "Portfolio"
   - `AZURE_STORAGE_CONNECTION_STRING` - From Azure Portal
   - `BLOB_CONTAINER_NAME` - Usually "media"

3. **Install dependencies:**
   ```bash
   npm install @azure/cosmos @azure/storage-blob uuid
   ```

4. **Run the migration:**
   ```bash
   node migrate-images-to-cosmosdb.js
   ```

### What it does

- Scans your blob storage for images
- Creates portfolio categories in Cosmos DB
- Creates image metadata records pointing to your blob files
- Generates titles from filenames
- Randomly marks some images as "featured"

### Security Notes

- The `.env` file is automatically ignored by git
- Never commit actual connection strings or keys
- Run this script locally only
- Delete the script after migration if desired 