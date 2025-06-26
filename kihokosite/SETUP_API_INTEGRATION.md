# Django API + React Frontend Integration Setup Guide

This guide will help you set up the complete integration between your Django backend and React frontend.

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
cd kihokosite
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```bash
cd web
npm install
```

### 3. Database Setup

```bash
cd kihokosite
python manage.py makemigrations
python manage.py migrate
```

### 4. Create API Tokens for Existing Users

```bash
python manage.py shell
```

Then run this Python code:
```python
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

# Create tokens for all existing users
for user in User.objects.all():
    Token.objects.get_or_create(user=user)
    
print("Tokens created for all users")
exit()
```

### 5. Start Both Servers

**Terminal 1 - Django Backend:**
```bash
cd kihokosite
python manage.py runserver
```
This will run on `http://localhost:8000`

**Terminal 2 - React Frontend:**
```bash
cd web
npm start
```
This will run on `http://localhost:3000`

## 📋 What's Been Set Up

### Django Backend API Endpoints

✅ **Projects & Artwork:**
- `GET /api/projects/` - List all projects
- `GET /api/project/{slug}/` - Get project details
- `GET /api/project/{slug}/images/` - Get project images
- `GET /api/artwork/{id}/` - Get artwork details
- `GET /api/artworks/` - List all artworks

✅ **Authentication:**
- `POST /api/auth/login/` - User login
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/logout/` - User logout

✅ **Merchandise:**
- `GET /api/merchandise/` - List merchandise

### React Frontend Features

✅ **Complete UI Components:**
- Responsive design matching Django templates
- Dark/light theme toggle
- Smooth animations with Framer Motion
- Form validation and error handling

✅ **API Integration:**
- Centralized API service with error handling
- Automatic token-based authentication
- Fallback to demo data for development

✅ **Routing:**
- React Router for client-side navigation
- All original Django routes replicated

## 🔧 Configuration Details

### CORS Configuration
- Development: Allows React dev server (localhost:3000)
- Production: Configured for your domain

### Authentication
- Token-based authentication using Django REST Framework
- Automatic token creation for new users
- Secure token storage in localStorage

### Error Handling
- Comprehensive error handling in React
- Fallback data for development
- User-friendly error messages

## 🧪 Testing the Integration

### 1. Test API Endpoints Directly

Visit these URLs in your browser while Django is running:

- http://localhost:8000/api/projects/
- http://localhost:8000/api/artworks/
- http://localhost:8000/admin/ (if you have admin access)

### 2. Test React Frontend

1. Start both servers
2. Visit http://localhost:3000
3. Navigate through all pages
4. Test theme toggle
5. Try login/signup (if you have test users)

### 3. Check Browser Network Tab

1. Open browser DevTools → Network tab
2. Navigate through React app
3. Verify API calls are being made to Django backend
4. Check for any CORS or authentication errors

## 🐛 Troubleshooting

### CORS Issues
If you see CORS errors in browser console:
```python
# In settings.py, temporarily add:
CORS_ALLOW_ALL_ORIGINS = True
```

### API Not Found (404)
Check that:
1. Django server is running on port 8000
2. URLs are correctly configured
3. Portfolio app is included in main URLconf

### Authentication Issues
```bash
# Create a test user
python manage.py createsuperuser

# Or create via shell:
python manage.py shell
from django.contrib.auth.models import User
user = User.objects.create_user('testuser', 'test@example.com', 'testpass123')
```

### No Data Showing
If no projects appear:
1. Add some test data via Django admin
2. Check browser console for errors
3. Verify API endpoints return data

## 📱 Production Deployment

### Django Settings Updates

For production, update these in your settings:

```python
# CORS for production
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]

# API base URL
API_BASE_URL = "https://yourdomain.com"
```

### React Build

```bash
cd web
npm run build
```

Serve the built files with your Django app or deploy separately.

## 🎯 Next Steps

1. **Add Real Data:** Upload your actual projects and artwork via Django admin
2. **Customize Styling:** Modify CSS to match your exact design preferences  
3. **Add Features:** Implement additional functionality like shopping cart, user profiles
4. **Optimize:** Add image optimization, lazy loading, SEO improvements
5. **Deploy:** Set up production deployment on your preferred platform

## 💡 Pro Tips

- **Development:** React app will fallback to demo data if Django API is unavailable
- **Debugging:** Check browser console for detailed error messages
- **API Testing:** Use tools like Postman to test API endpoints directly
- **Database:** Use Django admin to manage your content easily
- **Performance:** Images are served through Django in development, consider CDN for production

Your React portfolio app is now fully integrated with your Django backend! 🎉 