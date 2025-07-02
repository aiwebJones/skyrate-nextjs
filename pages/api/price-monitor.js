// 价格监控和管理API
export default async function handler(req, res) {
  if (req.method === 'GET') {
    // 获取价格监控数据
    return getPriceMonitorData(req, res)
  } else if (req.method === 'POST') {
    // 更新价格数据或配置
    return updatePriceConfig(req, res)
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}

// 获取价格监控数据
async function getPriceMonitorData(req, res) {
  try {
    const { route, timeframe = '24h' } = req.query
    
    // 获取价格历史数据
    const priceHistory = await getPriceHistory(route, timeframe)
    
    // 获取数据源状态
    const dataSourceStatus = await getDataSourceStatus()
    
    // 获取价格异常警报
    const priceAlerts = await getPriceAlerts()
    
    // 计算价格统计
    const priceStats = calculatePriceStatistics(priceHistory)
    
    res.status(200).json({
      success: true,
      data: {
        priceHistory,
        dataSourceStatus,
        priceAlerts,
        statistics: priceStats,
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Price monitor error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get price monitor data'
    })
  }
}

// 获取价格历史数据
async function getPriceHistory(route, timeframe) {
  // 实际实现中应该从数据库获取
  const mockHistory = []
  const now = new Date()
  const hours = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
    
    mockHistory.push({
      timestamp: timestamp.toISOString(),
      route: route || 'PVG-LAX',
      prices: {
        airChina: 2.30 + (Math.random() - 0.5) * 0.2,
        chinaEastern: 2.25 + (Math.random() - 0.5) * 0.2,
        freighthub: 2.15 + (Math.random() - 0.5) * 0.2,
        flexport: 2.35 + (Math.random() - 0.5) * 0.2,
        marketAverage: 2.28 + (Math.random() - 0.5) * 0.2
      },
      volume: Math.floor(Math.random() * 100) + 50 // 查询量
    })
  }
  
  return mockHistory
}

// 获取数据源状态
async function getDataSourceStatus() {
  const dataSources = [
    { name: 'Air China API', status: 'online', latency: 150, lastUpdate: '2 minutes ago' },
    { name: 'China Eastern API', status: 'online', latency: 200, lastUpdate: '1 minute ago' },
    { name: 'FreightHub API', status: 'online', latency: 180, lastUpdate: '3 minutes ago' },
    { name: 'Flexport API', status: 'degraded', latency: 500, lastUpdate: '10 minutes ago' },
    { name: 'Freightos Market', status: 'offline', latency: null, lastUpdate: '2 hours ago' }
  ]
  
  return dataSources
}

// 获取价格异常警报
async function getPriceAlerts() {
  const alerts = [
    {
      id: 'ALERT_001',
      type: 'price_spike',
      route: 'PVG-LAX',
      message: 'Price spike detected: 15% increase in last hour',
      severity: 'medium',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      resolved: false
    },
    {
      id: 'ALERT_002',
      type: 'data_source_down',
      source: 'Freightos Market',
      message: 'Data source offline for 2+ hours',
      severity: 'high',
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      resolved: false
    },
    {
      id: 'ALERT_003',
      type: 'price_divergence',
      route: 'PEK-JFK',
      message: 'High price variance between sources (>20%)',
      severity: 'low',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      resolved: true
    }
  ]
  
  return alerts.filter(alert => !alert.resolved)
}

// 计算价格统计
function calculatePriceStatistics(priceHistory) {
  if (priceHistory.length === 0) return null
  
  const latest = priceHistory[priceHistory.length - 1]
  const prices = Object.values(latest.prices)
  
  const stats = {
    avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    priceRange: Math.max(...prices) - Math.min(...prices),
    variance: calculateVariance(prices),
    trend: calculatePriceTrend(priceHistory.slice(-24)), // 最近24小时趋势
    confidence: calculateConfidenceScore(priceHistory)
  }
  
  return {
    ...stats,
    avgPrice: Math.round(stats.avgPrice * 100) / 100,
    minPrice: Math.round(stats.minPrice * 100) / 100,
    maxPrice: Math.round(stats.maxPrice * 100) / 100,
    priceRange: Math.round(stats.priceRange * 100) / 100,
    variance: Math.round(stats.variance * 10000) / 10000
  }
}

// 计算方差
function calculateVariance(prices) {
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length
  return variance
}

// 计算价格趋势
function calculatePriceTrend(recentHistory) {
  if (recentHistory.length < 2) return 'stable'
  
  const firstPrice = Object.values(recentHistory[0].prices)[0]
  const lastPrice = Object.values(recentHistory[recentHistory.length - 1].prices)[0]
  const change = ((lastPrice - firstPrice) / firstPrice) * 100
  
  if (change > 5) return 'rising'
  if (change < -5) return 'falling'
  return 'stable'
}

// 计算置信度评分
function calculateConfidenceScore(priceHistory) {
  const factors = {
    dataFreshness: calculateDataFreshness(priceHistory),
    sourceReliability: calculateSourceReliability(),
    priceStability: calculatePriceStability(priceHistory),
    volumeIndicator: calculateVolumeIndicator(priceHistory)
  }
  
  // 综合评分 (0-100)
  const score = (
    factors.dataFreshness * 0.3 +
    factors.sourceReliability * 0.3 +
    factors.priceStability * 0.2 +
    factors.volumeIndicator * 0.2
  )
  
  return Math.round(score)
}

// 计算数据新鲜度
function calculateDataFreshness(priceHistory) {
  const latestData = priceHistory[priceHistory.length - 1]
  const ageMinutes = (Date.now() - new Date(latestData.timestamp).getTime()) / (1000 * 60)
  
  if (ageMinutes < 5) return 100
  if (ageMinutes < 15) return 80
  if (ageMinutes < 60) return 60
  return 30
}

// 计算数据源可靠性
function calculateSourceReliability() {
  // 基于数据源在线状态计算
  const onlineSources = 3 // 假设3个数据源在线
  const totalSources = 5
  return (onlineSources / totalSources) * 100
}

// 计算价格稳定性
function calculatePriceStability(priceHistory) {
  if (priceHistory.length < 10) return 50
  
  const recentPrices = priceHistory.slice(-10).map(h => Object.values(h.prices)[0])
  const variance = calculateVariance(recentPrices)
  
  // 方差越小，稳定性越高
  if (variance < 0.01) return 100
  if (variance < 0.05) return 80
  if (variance < 0.1) return 60
  return 40
}

// 计算成交量指标
function calculateVolumeIndicator(priceHistory) {
  const recentVolume = priceHistory.slice(-24).reduce((sum, h) => sum + h.volume, 0)
  
  if (recentVolume > 1000) return 100
  if (recentVolume > 500) return 80
  if (recentVolume > 200) return 60
  return 40
}

// 更新价格配置
async function updatePriceConfig(req, res) {
  try {
    const { type, data } = req.body
    
    switch (type) {
      case 'update_base_prices':
        await updateBasePrices(data)
        break
      case 'set_alert_thresholds':
        await setAlertThresholds(data)
        break
      case 'toggle_data_source':
        await toggleDataSource(data)
        break
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid update type'
        })
    }
    
    res.status(200).json({
      success: true,
      message: 'Configuration updated successfully'
    })
  } catch (error) {
    console.error('Update config error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update configuration'
    })
  }
}

// 更新基础价格
async function updateBasePrices(data) {
  // 实际实现中应该更新数据库
  console.log('Updating base prices:', data)
}

// 设置警报阈值
async function setAlertThresholds(data) {
  // 实际实现中应该保存到配置
  console.log('Setting alert thresholds:', data)
}

// 切换数据源状态
async function toggleDataSource(data) {
  // 实际实现中应该更新数据源配置
  console.log('Toggling data source:', data)
} 