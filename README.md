# Department of Physics - Government Bangla College

A React-based educational website for the Department of Physics at Government Bangla College. The portal serves as a comprehensive resource for students, faculty, and visitors to explore the department's programs, facilities, and activities.

## Features

### Core Pages

- **Home** - Department overview, programs, research areas, facilities, and testimonials
- **About** - Detailed information about the department's history and mission
- **Teachers** - Faculty profiles and contact information
- **Academic** - Academic programs, curriculum details, and study resources
- **Class Routine** - Weekly class schedules

### Interactive Features

- **Games** - Embedded browser games for entertainment
  - Snake Game
  - Flappy Bird
- **Scientific** - Interactive fractal explorer with customizable themes and visualizations
- **Chess** - Chess board component for gameplay (multiplayer capability)

### Technical Stack

- **Frontend**: React 18, React Router v6
- **Styling**: SCSS, CSS Modules
- **Build Tool**: Create React App
- **Deployment**: Netlify

## Project Structure

```
dop-repo/
├── public/                  # Static assets
│   ├── Scientific/         # Fractal explorer files
│   └── index.html
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Chessboard/     # Chess game component
│   │   ├── Home/           # Home page sections
│   │   └── Layout/         # Header, Footer, Layout
│   ├── context/            # React Context (Theme, Auth)
│   ├── pages/              # Page components
│   │   ├── Academic/       # Academic section
│   │   ├── Games/          # Game pages
│   │   ├── Home/           # Home page
│   │   ├── Scientific/     # Scientific tools
│   │   └── Teachers/       # Faculty pages
│   ├── styles/             # SCSS/CSS files
│   ├── api.js              # API configuration
│   └── App.js              # Main application component
├── package.json
└── netlify.toml            # Netlify deployment config
```

## Available Scripts

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## Key Details

### Theme System

- Dark/Light mode toggle available via ThemeContext
- Custom SCSS theming with CSS variables

### Routing

- Client-side routing with React Router v6
- Supports nested routes for academic sections

### API Integration

- Axios-based API client for backend communication
- JWT authentication support via AuthContext

### Deployment

- Configured for Netlify automatic deployment
- Build command: `npm run build`
- Publish directory: `build`

## Programs Offered

### Undergraduate

- B.Sc. (Honors) in Physics - 4 Year program

### Postgraduate

- M.Sc. in Physics - 1 Year program

## Research Areas

- Condensed Matter Physics
- Nuclear Physics
- Electronics
- Theoretical Physics
- Experimental Physics

## Facilities

- Advanced Physics Laboratory
- Electronics Lab
- Computer Lab
- Research Equipment

## Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=your_api_url
REACT_APP_JWT_SECRET=your_secret
```

## License

This project is for educational purposes.