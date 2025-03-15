# SmartPad - Modern Online Notepad

A modern, feature-rich online notepad application with user authentication and real-time saving.

## Features

- Rich text editing
- User authentication
- Dark/Light theme
- File download (PDF/TXT)
- Share functionality
- Speech-to-text
- Profile management
- Responsive design

## Deployment Options

### 1. Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create a new Heroku app
heroku create smartpad-app

# Push to Heroku
git push heroku main
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel
```

### 3. Deploy to Netlify

1. Sign up for a Netlify account
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `npm install`
   - Publish directory: `.`

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smartpad.git
cd smartpad
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Start production server:
```bash
npm start
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=production
```

## Requirements

- Node.js >= 14.0.0
- NPM >= 6.0.0

## License

ISC License 