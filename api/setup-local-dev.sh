#!/bin/bash

# Secure Local Development Setup for Azure Functions
# This script helps you configure local development safely

echo "🔐 Setting up secure local development environment..."
echo ""

# Check if local.settings.json exists
if [ -f "local.settings.json" ]; then
    echo "✅ local.settings.json exists"
else
    echo "❌ local.settings.json not found"
    echo "Creating local.settings.json from template..."
    cp local.settings.example.json local.settings.json
fi

echo ""
echo "🔧 You need to configure your Azure credentials:"
echo ""
echo "1. 📊 Get your Cosmos DB credentials:"
echo "   - Go to Azure Portal → Your Cosmos DB account"
echo "   - Navigate to 'Settings' → 'Keys'"
echo "   - Copy the URI and Primary Key"
echo ""
echo "2. 💾 Get your Azure Storage credentials:"
echo "   - Go to Azure Portal → Your Storage account"
echo "   - Navigate to 'Security + networking' → 'Access keys'"
echo "   - Copy the Connection string for key1"
echo ""
echo "3. ✏️  Edit local.settings.json and replace:"
echo "   - YOUR_COSMOS_DB_ENDPOINT_HERE"
echo "   - YOUR_COSMOS_DB_KEY_HERE"
echo "   - YOUR_AZURE_STORAGE_CONNECTION_STRING_HERE"
echo ""
echo "⚠️  SECURITY REMINDER:"
echo "   - local.settings.json is in .gitignore and won't be committed"
echo "   - Never share these credentials publicly"
echo "   - Use different credentials for production"
echo ""
echo "After setup, run: npm start" 