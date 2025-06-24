#!/bin/bash

# Kihoko Portfolio - Mac Setup Script
# Sets up automated nightly uploads from ~/Pictures/Portfolio to Azure

set -e

echo "🎨 Kihoko Portfolio - Mac Setup"
echo "Setting up automated nightly uploads..."

# Create the portfolio-sync directory
SYNC_DIR="$HOME/portfolio-sync"
if [ ! -d "$SYNC_DIR" ]; then
    echo "📁 Creating $SYNC_DIR"
    mkdir -p "$SYNC_DIR"
fi

cd "$SYNC_DIR"

# Check for Python 3
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install it first:"
    echo "   brew install python3"
    exit 1
fi

# Create virtual environment
echo "🐍 Setting up Python virtual environment..."
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
echo "📦 Installing Python packages..."
pip install --upgrade pip
pip install azure-storage-blob azure-cosmos python-dotenv

# Copy the upload script
echo "📄 Setting up upload script..."
cp "$(dirname "$0")/upload_portfolio_images.py" ./
chmod +x upload_portfolio_images.py

# Create .env template if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env template..."
    cat > .env << 'EOF'
# Azure Blob Storage Connection String
# Get this from Azure Portal > Storage accounts > Your account > Access keys
AZURE_CONN_STR="BlobEndpoint=https://YOURACCOUNTNAME.blob.core.windows.net/;SharedAccessSignature=YOURSASTOKEN"

# Container name (usually 'media')
CONTAINER="media"

# Local directory to watch for new images
WATCH_DIR="/Users/$(whoami)/Pictures/Portfolio"

# Optional: Cosmos DB connection for metadata
# COSMOS_CONN_STR="AccountEndpoint=https://YOURACCOUNTNAME.documents.azure.com:443/;AccountKey=YOURKEY;"
# COSMOS_DATABASE="kihokodb"
EOF
    echo "📝 Please edit .env with your Azure connection strings"
fi

# Create the Pictures/Portfolio directory if it doesn't exist
PORTFOLIO_DIR="$HOME/Pictures/Portfolio"
if [ ! -d "$PORTFOLIO_DIR" ]; then
    echo "📸 Creating $PORTFOLIO_DIR"
    mkdir -p "$PORTFOLIO_DIR"
fi

# Test the script
echo "🧪 Testing the upload script..."
if source .venv/bin/activate && python upload_portfolio_images.py; then
    echo "✅ Script test successful!"
else
    echo "⚠️  Script test failed. Check your .env configuration."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit $SYNC_DIR/.env with your Azure connection strings"
echo "2. Add some test images to $PORTFOLIO_DIR"
echo "3. Run the script manually to test: cd $SYNC_DIR && source .venv/bin/activate && python upload_portfolio_images.py"
echo "4. Set up nightly scheduling with cron or launchd (see documentation)"
echo ""
echo "Files created:"
echo "  $SYNC_DIR/upload_portfolio_images.py - The upload script"
echo "  $SYNC_DIR/.env - Configuration file (edit this!)"
echo "  $SYNC_DIR/.venv/ - Python virtual environment"
echo "  $PORTFOLIO_DIR/ - Directory to watch for new images" 