# 🔐 Secure Local Development Setup

This guide helps you set up local development for the Kihoko Azure Functions while keeping your credentials secure.

## 🚀 Quick Setup

1. **Run the setup script:**
   ```bash
   npm run setup-dev
   ```

2. **Configure your Azure credentials:**
   - Edit `local.settings.json` 
   - Replace the placeholder values with your actual Azure credentials
   - Follow the instructions provided by the setup script

3. **Verify your setup:**
   ```bash
   npm run check-secrets
   ```

4. **Start the functions:**
   ```bash
   npm start
   ```

## 🔒 Security Features

- ✅ `local.settings.json` is automatically excluded from git
- ✅ Environment files (`.env*`) are in `.gitignore` 
- ✅ Setup script provides clear guidance
- ✅ Pre-built security checks available

## 📋 Required Azure Credentials

### Cosmos DB
- **Endpoint**: Your Cosmos DB URI (e.g., `https://your-db.documents.azure.com:443/`)
- **Key**: Primary key from Azure Portal

### Azure Storage
- **Connection String**: Full connection string from Azure Portal

## 🔧 Where to Find Your Credentials

### Cosmos DB Credentials
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Cosmos DB account
3. Go to **Settings** → **Keys**
4. Copy the **URI** and **Primary Key**

### Azure Storage Credentials  
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Storage account
3. Go to **Security + networking** → **Access keys**
4. Copy the **Connection string** for key1

## ⚠️ Security Best Practices

- **Never commit credentials** to version control
- **Use different credentials** for development and production
- **Regularly rotate** your Azure keys
- **Limit permissions** to only what's needed for development
- **Don't share** your `local.settings.json` file

## 🐛 Troubleshooting

- **Functions fail to load**: Check that credentials are properly configured
- **Database connection errors**: Verify Cosmos DB endpoint and key
- **Image loading issues**: Check Azure Storage connection string
- **403/401 errors**: Ensure your keys have the correct permissions

## 📞 Need Help?

If you encounter issues:
1. Run `npm run check-secrets` to verify configuration
2. Check the Azure Functions logs for specific error messages
3. Verify your credentials in the Azure Portal 