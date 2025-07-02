// 环境配置示例
// 复制此文件为 config/env.js 并填入真实的API密钥

module.exports = {
  // 数据库配置
  database: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/skyrate_db'
  },

  // 航空公司API密钥
  airlines: {
    airChina: process.env.AIR_CHINA_API_KEY || 'your_air_china_api_key_here',
    chinaEastern: process.env.CHINA_EASTERN_API_KEY || 'your_china_eastern_api_key_here',
    chinaSouthern: process.env.CHINA_SOUTHERN_API_KEY || 'your_china_southern_api_key_here',
    cathayPacific: process.env.CATHAY_PACIFIC_API_KEY || 'your_cathay_pacific_api_key_here'
  },

  // 货代平台API密钥
  forwarders: {
    freighthub: process.env.FREIGHTHUB_API_KEY || 'your_freighthub_api_key_here',
    flexport: process.env.FLEXPORT_API_KEY || 'your_flexport_api_key_here',
    forwarderNet: process.env.FORWARDER_NET_API_KEY || 'your_forwarder_net_api_key_here'
  },

  // 市场数据API密钥
  marketData: {
    freightos: process.env.FREIGHTOS_API_KEY || 'your_freightos_api_key_here',
    worldFreightRates: process.env.WORLD_FREIGHT_RATES_API_KEY || 'your_world_freight_rates_api_key_here'
  },

  // 价格监控配置
  priceMonitor: {
    updateInterval: parseInt(process.env.PRICE_UPDATE_INTERVAL) || 300, // 5分钟
    maxVariance: parseFloat(process.env.MAX_PRICE_VARIANCE) || 0.2,     // 20%
    alertEmail: process.env.ALERT_EMAIL || 'admin@skyrate.info',
    cacheTTL: parseInt(process.env.CACHE_TTL) || 300  // 5分钟缓存
  },

  // 缓存配置
  cache: {
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    defaultTTL: 300
  },

  // 安全配置
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
    rateLimitPerMinute: parseInt(process.env.API_RATE_LIMIT) || 100
  },

  // 邮件服务配置
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || 'your_email@gmail.com',
    pass: process.env.SMTP_PASS || 'your_email_password'
  },

  // 第三方服务
  services: {
    sentryDsn: process.env.SENTRY_DSN || 'your_sentry_dsn_for_error_tracking',
    analyticsId: process.env.ANALYTICS_ID || 'your_google_analytics_id'
  }
} 