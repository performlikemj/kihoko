# Kihoko Portfolio - Azure Static Web App

A modern portfolio website built with React and Azure Functions, designed as an Azure Static Web App. This architecture provides a fully serverless, scalable solution for showcasing portfolio images with categories like tattoo art and artistic photography.

## 🏗 Architecture

- **Frontend**: React (Azure Static Web App)
- **Backend**: Azure Functions (Node.js)
- **Database**: Azure Cosmos DB (NoSQL)
- **Storage**: Azure Blob Storage for images
- **Deployment**: GitHub Actions → Azure Static Web Apps

## 🚀 Features

- **Image Categories**: Tattoo Art, Art Photography, Digital Art
- **Automatic Thumbnails**: Generated using Sharp.js
- **Responsive Design**: Mobile-first design with React and Framer Motion
- **Serverless Architecture**: Auto-scaling with Azure Functions
- **CDN Integration**: Fast global image delivery via Azure Blob Storage
- **Search & Filter**: Filter images by category
- **Featured Images**: Highlight your best work
- **Secure Local Uploads**: Add new art using `scripts/secure-upload.js`

## 📦 Project Structure

```
kihoko/
├── api/                          # Azure Functions backend
│   ├── shared/                   # Shared utilities
│   │   ├── config.js            # Azure service configuration
│   │   ├── models.js            # Data models
│   │   ├── database.js          # Cosmos DB service
│   │   └── blobStorage.js       # Blob Storage service
│   ├── GetCategories/           # Get portfolio categories
│   ├── GetImages/               # Get images (all or by category)
│   ├── UploadImage/             # Upload new images
│   ├── package.json
│   └── host.json
├── kihokosite/web/              # React frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   └── styles/              # CSS styles
│   └── package.json
├── staticwebapp.config.json     # Azure Static Web App config
├── .github/workflows/           # GitHub Actions
└── README.md
```

## 🔧 Setup Instructions

### Prerequisites

1. **Azure Account** with access to:
   - Azure Static Web Apps
   - Azure Cosmos DB
   - Azure Blob Storage
2. **GitHub Account** for repository and CI/CD
3. **Node.js 18+** for local development

### 1. Azure Resources Setup

#### Create Azure Cosmos DB
```bash
# Create Cosmos DB account
az cosmosdb create \
  --name kihoko-portfolio-db \
  --resource-group your-resource-group \
  --kind GlobalDocumentDB \
  --default-consistency-level Session

# Create database and container (optional - auto-created by functions)
```

#### Create Azure Storage Account
```bash
# Create storage account
az storage account create \
  --name kihokostrg \
  --resource-group your-resource-group \
  --sku Standard_LRS \
  --allow-blob-public-access true

# Get connection string
az storage account show-connection-string \
  --name kihokostrg \
  --resource-group your-resource-group
```

### 2. Azure Static Web App Setup

1. **Create Azure Static Web App**:
   ```bash
   az staticwebapp create \
     --name kihoko-portfolio \
     --resource-group your-resource-group \
     --source https://github.com/your-username/kihoko \
     --location "Central US" \
     --branch main \
     --app-location "kihokosite/web" \
     --api-location "api" \
     --output-location "build"
   ```

2. **Get deployment token**:
   ```bash
   az staticwebapp secrets list --name kihoko-portfolio
   ```

### 3. GitHub Repository Setup

1. **Fork or clone this repository**
2. **Set up GitHub Secrets**:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`: From step 2 above
   - `COSMOS_DB_ENDPOINT`: Your Cosmos DB endpoint
   - `COSMOS_DB_KEY`: Your Cosmos DB primary key
   - `AZURE_STORAGE_CONNECTION_STRING`: Your storage connection string

### 4. Local Development

#### Backend (Azure Functions)
```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Navigate to API directory
cd api

# Install dependencies
npm install

# Set up local.settings.json
cp local.settings.example.json local.settings.json
# Edit with your Azure credentials

# Start the functions locally
npm start
# Functions will run on http://localhost:7071
```

#### Frontend (React)
```bash
# Navigate to web directory
cd kihokosite/web

# Install dependencies
npm install

# Start development server
npm start
# React app will run on http://localhost:3000
```

### 5. Environment Variables

Create `api/local.settings.json` for local development:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_DB_ENDPOINT": "https://your-cosmos-db.documents.azure.com:443/",
    "COSMOS_DB_KEY": "your-cosmos-db-key",
    "AZURE_STORAGE_CONNECTION_STRING": "DefaultEndpointsProtocol=https;AccountName=..."
  }
}
```

For the React frontend, the application automatically falls back to the same
origin for API requests. When running locally you should point the frontend to
your local Functions host by copying `web/.env.example` to `web/.env` and
adjusting the values:

```bash
REACT_APP_API_URL=http://localhost:7071/api
REACT_APP_ENABLE_UPLOAD=true
```

The Webpack build loads these variables automatically using the
`dotenv-webpack` plugin. In Azure Static Web Apps you can set
`REACT_APP_API_URL` in the Configuration section if your API lives on a
different domain.

## 📱 API Endpoints

### Categories
- `GET /api/categories` - Get all categories

### Images
- `GET /api/images` - Get all images (with pagination)
- `GET /api/images/{categorySlug}` - Get images by category
- `GET /api/images?featured=true` - Get featured images
- `POST /api/images/upload` - Upload new image *(disabled by default; use the local script)*

### Example API Usage

```javascript
// Get all categories
const categories = await fetch('/api/categories');

// Get images by category
const images = await fetch('/api/images/tattoo-art');

// Upload new image using the local script
// $ node scripts/secure-upload.js ~/Desktop/art.jpg --title "My Artwork"
```

## 🎨 Default Categories

The system comes with these pre-configured categories:

1. **Tattoo Art** (`tattoo-art`) - Tattoo photography and artwork
2. **Art Photography** (`art-photography`) - Artistic photography and visual art  
3. **Digital Art** (`digital-art`) - Digital artwork and illustrations

## 🚀 Deployment

Deployment is automated via GitHub Actions. Simply push to the `main` branch:

```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

The workflow will:
1. Build the React app
2. Install Azure Functions dependencies
3. Deploy to Azure Static Web Apps
4. Set environment variables

## 🔒 Security & Performance

- **Public Image Access**: Images are served directly from Azure Blob Storage CDN
- **Serverless Scaling**: Azure Functions auto-scale based on demand
- **Global CDN**: Images cached globally for fast loading
- **Optimized Images**: Automatic thumbnail generation and optimization
- **CORS Configuration**: Properly configured for secure cross-origin requests

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions:
- Create a GitHub issue
- Check the Azure Static Web Apps documentation
- Review Azure Functions troubleshooting guide 