# 🌍 SkyRate - International Air Freight Quote Platform

A professional air freight quotation platform designed for international customers, providing accurate real-time pricing from multiple carriers and freight forwarders.

## ✨ Features

- **Multi-Source Pricing**: Integration with airlines, freight forwarders, and market data
- **Real-Time Quotes**: Live pricing with reliability scoring
- **Price Accuracy System**: Advanced validation and monitoring
- **Professional UI**: Modern, responsive design for international users
- **Smart Sorting**: AI-powered quote ranking by price, reliability, and transit time

## 🚀 Live Demo

**🌐 Website**: [https://skyrate-nextjs.vercel.app](https://skyrate-nextjs.vercel.app)

## 📋 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Deployment**: Vercel
- **Languages**: English (International customers)

## 🛠️ Installation

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/skyrate-nextjs.git
cd skyrate-nextjs

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Copy `config/env.example.js` to `config/env.js` and configure with your API keys:

```javascript
module.exports = {
  airlines: {
    airChina: 'your_air_china_api_key',
    chinaEastern: 'your_china_eastern_api_key',
    // ... more configurations
  }
}
```

## 📊 API Endpoints

### Quote API
```bash
POST /api/quote
{
  "origin": "PVG",
  "destination": "LAX", 
  "weight": 100,
  "volume": 1,
  "cargoType": "general",
  "email": "customer@example.com",
  "company": "Company Name"
}
```

### Price Monitor API
```bash
GET /api/price-monitor?route=PVG-LAX&timeframe=24h
```

## 🎯 Price Accuracy System

### Multi-Source Integration
- **Airlines**: Air China, China Eastern, China Southern, Cathay Pacific
- **Freight Forwarders**: FreightHub, Flexport, Forwarder.net
- **Market Data**: Freightos, World Freight Rates

### Reliability Scoring
- **Data Freshness** (30%): Last update time
- **Source Reliability** (30%): API uptime and quality
- **Price Stability** (20%): Recent price variance
- **Volume Indicator** (20%): Query volume and market activity

### Quality Assurance
- Real-time price validation
- Automatic outlier detection
- Smart caching with TTL
- Graceful degradation

## 📈 Business Routes

Popular air freight routes supported:

| Origin | Destination | Avg Transit | Price Range |
|--------|------------|-------------|-------------|
| PVG (Shanghai) | LAX (Los Angeles) | 2-3 days | $2.20-2.50/kg |
| PEK (Beijing) | JFK (New York) | 1-2 days | $2.80-3.10/kg |
| CAN (Guangzhou) | LHR (London) | 1-2 days | $2.95-3.25/kg |
| SZX (Shenzhen) | FRA (Frankfurt) | 1-2 days | $2.85-3.15/kg |

## 🔧 Deployment

### Deploy to Vercel (Recommended)

1. **Fork this repository**
2. **Connect to Vercel**:
   ```bash
   npx vercel --prod
   ```
3. **Configure environment variables** in Vercel dashboard
4. **Custom domain** (optional): Add your domain in Vercel settings

### Deploy to Netlify

1. **Connect repository** to Netlify
2. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. **Environment variables**: Configure in Netlify dashboard

## 🌐 International Features

- **Optimized for Global Users**: English interface, international business practices
- **IATA Airport Codes**: Standard 3-letter airport codes
- **Multi-Currency Support**: USD primary, with conversion options
- **Timezone Aware**: All timestamps in UTC with local conversion
- **Mobile Responsive**: Works on all devices and screen sizes

## 📞 Support

- **Technical Support**: tech@skyrate.info
- **Business Inquiries**: sales@skyrate.info
- **Emergency**: +86-400-XXX-XXXX

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- All the airlines and freight forwarders providing APIs
- International air freight community

---

**Built with ❤️ for the global air freight industry**