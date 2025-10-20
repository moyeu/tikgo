# TikGo - TikTok Video Downloader

[![Next.js](https://img.shields.io/badge/Next.js-15.1.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A powerful, fast, and user-friendly web application for downloading TikTok videos without watermarks. Built with Next.js and React, featuring multi-language support and a modern, responsive design.

## 🌟 Features

- **🎥 High-Quality Downloads** - Download TikTok videos in HD quality without watermarks
- **🎵 Audio Extraction** - Extract MP3 audio from TikTok videos
- **🖼️ Multiple Formats** - Support for videos, slides, and stories
- **🌍 Multi-Language** - Available in 14 languages (English, Vietnamese, Indonesian, Arabic, German, Spanish, Portuguese, French, Italian, Czech, Turkish, Japanese, Thai, Chinese)
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **⚡ Fast & Efficient** - Optimized performance with Next.js server-side rendering
- **🔒 Privacy Focused** - No registration required, no data collection
- **🎨 Modern UI** - Clean and intuitive user interface
- **📊 SEO Optimized** - Built-in SEO metadata and sitemap generation

## 🚀 Demo

Visit the live demo: [https://tikgo.me/](https://tikgo.me/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 18.0 or higher)
- npm or yarn package manager
- Redis (optional, for rate limiting)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/tikgo.git
cd tikgo/frontend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory and configure the following variables:

```env
# Server Configuration
NEXT_PUBLIC_API_URL=your_backend_api_url
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Feature Flags
TRAILING_SLASH=false
ENABLE_URL_MAPPING=true

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# AdSense (Optional)
NEXT_PUBLIC_ADSENSE_CLIENT=your_adsense_client_id

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_jwt_secret_key
CSRF_SECRET=your_csrf_secret_key
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 📁 Project Structure

```
frontend/
├── components/          # React components
│   ├── TikTokDownloader.js
│   ├── VideoResult.js
│   ├── Header.js
│   ├── Footer.js
│   └── ...
├── pages/              # Next.js pages
│   ├── index.js        # Home page
│   ├── _app.js         # App wrapper
│   ├── _document.js    # Document wrapper
│   └── api/            # API routes
├── styles/             # CSS modules and global styles
├── public/             # Static assets
│   ├── locales/        # Translation files
│   ├── images/         # Images
│   └── icons/          # Icons
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── context/            # React context providers
├── lib/                # Library functions
└── scripts/            # Build and utility scripts
```

## 🎯 Usage

### For End Users

1. **Visit the website**
2. **Paste TikTok video URL** - Copy the link from TikTok app or website
3. **Click Download** - Wait for the processing to complete
4. **Choose format** - Select video quality or MP3 audio
5. **Save to device** - Download starts automatically

### Supported URL Formats

- `https://www.tiktok.com/@username/video/1234567890`
- `https://vt.tiktok.com/xxxxx/`
- `https://vm.tiktok.com/xxxxx/`
- TikTok mobile share links

## 🌐 Supported Languages

The application supports the following languages:
- 🇬🇧 English
- 🇻🇳 Vietnamese
- 🇮🇩 Indonesian
- 🇸🇦 Arabic
- 🇩🇪 German
- 🇪🇸 Spanish
- 🇵🇹 Portuguese
- 🇫🇷 French
- 🇮🇹 Italian
- 🇨🇿 Czech
- 🇹🇷 Turkish
- 🇯🇵 Japanese
- 🇹🇭 Thai
- 🇨🇳 Chinese

## 🔧 Configuration

### URL Mapping

Enable or disable URL mapping in `.env`:
```env
ENABLE_URL_MAPPING=true
```

### Trailing Slash

Configure trailing slash behavior:
```env
TRAILING_SLASH=false
```

### Rate Limiting

Configure Redis for rate limiting in `lib/rateLimit.js`

## 📦 Key Dependencies

- **Next.js** - React framework for production
- **React** - UI library
- **next-i18next** - Internationalization
- **crypto-js** - Cryptographic functions
- **jose** - JWT handling
- **markdown-it** - Markdown parser
- **redis** - Caching and rate limiting

## 🧪 Testing

Run the test suite:

```bash
npm test
# or
yarn test
```

## 📊 Performance Optimization

The application includes several performance optimizations:
- Server-side rendering (SSR)
- Static generation for content pages
- Image optimization
- Code splitting and lazy loading
- Bundle analysis with `@next/bundle-analyzer`
- Console removal in production
- Gzip compression

To analyze bundle size:

```bash
ANALYZE=true npm run build
```

## 🔒 Security Features

- CSRF protection
- JWT authentication
- Rate limiting
- Input validation
- XSS prevention
- Secure headers

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow ESLint configuration
- Use meaningful variable and function names
- Write comments for complex logic
- Keep components small and focused
- Write unit tests for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

- X.com: [@tikgome](https://x.com/tikgome)
- Youtube: [https://www.youtube.com/@tikgome](https://www.youtube.com/@tikgome)
- Project Link: [https://github.com/yourusername/tikgo](https://github.com/yourusername/tikgo)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Vercel](https://vercel.com/) - Hosting and deployment
- [TikTok](https://www.tiktok.com/) - Content platform
- All contributors who have helped this project

## 📧 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Email: tikgodotme@gmail.com
- Visit our website: [https://yourdomain.com/contact](https://tikgo.me/contact)

## 🗺️ Roadmap

- [ ] Add support for Instagram reels
- [ ] Implement batch download
- [ ] Add video editing features
- [ ] Create browser extensions
- [ ] Add API documentation
- [ ] Implement user accounts (optional)
- [ ] Add download history

## ⚠️ Disclaimer

This tool is for personal use only. Please respect content creators' rights and TikTok's terms of service. Always obtain permission before downloading and using someone else's content.

---

Made with ❤️ by moyeu
