# Kihoko Web React App

This React application is a complete modernization of the Django portfolio website, providing a single-page application experience while maintaining all the functionality of the original Django app.

## Features

- **Portfolio Display**: Grid layout of art projects with hover effects and animations
- **Project Details**: Individual project pages with image galleries
- **Art Detail View**: Full-screen art viewing with navigation between pieces
- **Contact Form**: Functional contact form with form validation
- **User Authentication**: Login and signup functionality
- **Theme Toggle**: Dark/light mode switching
- **Responsive Design**: Mobile-first responsive design
- **Smooth Animations**: Framer Motion animations and AOS scroll effects

## Technology Stack

- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Framer Motion**: Smooth animations and transitions
- **Styled Components**: CSS-in-JS theming
- **Axios**: API communication with Django backend
- **Bootstrap 5**: UI framework
- **Font Awesome**: Icons
- **AOS**: Scroll animations

## Project Structure

```
src/
├── components/
│   ├── Header.js           # Navigation header with theme toggle
│   ├── Footer.js           # Site footer
│   └── ProjectCard.js      # Individual project cards
├── pages/
│   ├── HomePage.js         # Main portfolio page
│   ├── ProjectDetailPage.js # Individual project details
│   ├── ArtDetailPage.js    # Full-screen art viewer
│   ├── ContactPage.js      # Contact form
│   ├── LoginPage.js        # User login
│   └── SignupPage.js       # User registration
├── styles/
│   ├── GlobalStyles.js     # Global styled-components
│   ├── themes.js           # Light/dark theme definitions
│   └── style.css           # CSS styles (matches Django styles)
├── App.js                  # Main app component with routing
└── index.js               # App entry point
```

## Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`

3. **Build for production:**
   ```bash
   npm run build
   ```
   Creates optimized production bundle in `dist/` directory

## API Integration

The React app is designed to work with Django API endpoints. You'll need to create the following API endpoints in your Django backend:

### Required API Endpoints

- `GET /api/projects/` - List all projects
- `GET /api/project/{slug}/` - Get project details
- `GET /api/project/{slug}/images/` - Get project images
- `GET /api/artwork/{id}/` - Get artwork details
- `GET /api/artworks/` - List all artworks
- `POST /api/contact/` - Submit contact form
- `POST /api/auth/login/` - User login
- `POST /api/auth/signup/` - User registration

### Sample Django API Views

You can add these to your Django `views.py`:

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse

@api_view(['GET'])
def projects_list(request):
    projects = Project.objects.all()
    data = [{
        'id': p.id,
        'title': p.title,
        'slug': p.slug,
        'image': p.image.url if p.image else None,
        'description': p.description
    } for p in projects]
    return Response(data)

@api_view(['GET'])
def project_detail(request, slug):
    project = get_object_or_404(Project, slug=slug)
    data = {
        'id': project.id,
        'title': project.title,
        'slug': project.slug,
        'image': project.image.url if project.image else None,
        'description': project.description
    }
    return Response(data)
```

## Deployment

### Option 1: Serve React from Django
1. Build the React app: `npm run build`
2. Configure Django to serve the built files
3. Update Django URLs to handle React routing

### Option 2: Separate Deployment
1. Deploy React app to Netlify, Vercel, or similar
2. Configure CORS in Django for API access
3. Update API base URLs in React app

## Current Status

The React app includes:
- ✅ Complete UI components matching Django templates
- ✅ All routes and navigation
- ✅ Form handling and validation
- ✅ Theme switching functionality
- ✅ Responsive design
- ✅ Animations and transitions
- ⚠️ API integration (placeholder data for development)
- ⚠️ Authentication system (needs Django API endpoints)

## Next Steps

1. **Create Django API endpoints** for the React app to consume
2. **Set up Django REST Framework** if not already installed
3. **Configure CORS** for API access
4. **Implement authentication** API endpoints
5. **Test integration** between React frontend and Django backend
6. **Deploy** the application

The React app is ready to use and will work with placeholder data for development. Once you create the corresponding Django API endpoints, it will be fully functional with your existing Django backend.
