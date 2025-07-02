export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { origin, destination, weight, volume, cargoType, email, company } = req.body

  // 验证输入
  if (!origin || !destination || !weight || !volume || !email) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields' 
    })
  }

  // 验证IATA代码格式
  if (origin.length !== 3 || destination.length !== 3) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid IATA code format' 
    })
  }

  // 验证重量和体积
  if (weight <= 0 || volume <= 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'Weight and volume must be greater than 0' 
    })
  }

  try {
    // 多数据源报价获取
    const quotes = await getMultiSourceQuotes({
      origin,
      destination,
      weight,
      volume,
      cargoType,
      email,
      company
    })

    // 价格验证和排序
    const validatedQuotes = validateAndSortQuotes(quotes)

    // 记录查询日志（用于价格分析）
    await logQuoteRequest({
      origin,
      destination,
      weight,
      volume,
      cargoType,
      quotes: validatedQuotes,
      timestamp: new Date(),
      clientInfo: { email, company }
    })

    if (validatedQuotes.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No available quotes for this route'
      })
    }

    res.status(200).json({
      success: true,
      data: validatedQuotes[0], // 返回最优报价
      alternatives: validatedQuotes.slice(1, 3), // 备选方案
      metadata: {
        quoteId: generateQuoteId(),
        validUntil: getQuoteExpiry(),
        lastUpdated: new Date().toISOString(),
        disclaimer: 'Prices are subject to change. Final rates confirmed upon booking.'
      }
    })

  } catch (error) {
    console.error('Quote API Error:', error)
    res.status(500).json({
      success: false,
      error: 'Unable to retrieve quotes at this time'
    })
  }
}

// 多数据源报价获取
async function getMultiSourceQuotes(params) {
  const quotes = []
  
  try {
    // 1. 主要航空公司API集成
    const airlineQuotes = await Promise.allSettled([
      getAirChinaQuote(params),
      getChinaEasternQuote(params),
      getChinaSouthernQuote(params),
      getCathayPacificQuote(params)
    ])

    // 2. 货代平台API集成
    const forwarderQuotes = await Promise.allSettled([
      getFreighthubQuote(params),
      getFlexportQuote(params),
      getForwardernetQuote(params)
    ])

    // 3. 市场价格API
    const marketQuotes = await Promise.allSettled([
      getFreightosQuote(params),
      getWorldfreightRatesQuote(params)
    ])

    // 合并所有成功的报价
    const allResults = [...airlineQuotes, ...forwarderQuotes, ...marketQuotes]
    
    allResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        quotes.push(result.value)
      }
    })

    // 如果没有实际API数据，使用模拟数据（开发阶段）
    if (quotes.length === 0) {
      quotes.push(...generateMockQuotes(params))
    }

    return quotes
  } catch (error) {
    console.error('Multi-source quote error:', error)
    // 降级到模拟数据
    return generateMockQuotes(params)
  }
}

// 航空公司API示例（需要实际API密钥）
async function getAirChinaQuote(params) {
  // 实际实现需要调用航空公司API
  // const response = await fetch('https://api.airchina.com/cargo/quote', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.AIR_CHINA_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(params)
  // })
  
  // 模拟数据（实际开发时替换）
  return generateAirlineQuote(params, 'Air China', 0.95)
}

async function getChinaEasternQuote(params) {
  return generateAirlineQuote(params, 'China Eastern', 0.92)
}

async function getChinaSouthernQuote(params) {
  return generateAirlineQuote(params, 'China Southern', 0.90)
}

async function getCathayPacificQuote(params) {
  return generateAirlineQuote(params, 'Cathay Pacific', 1.05)
}

// 货代平台API示例
async function getFreighthubQuote(params) {
  // 实际API调用
  // const response = await fetch('https://api.freighthub.com/quotes', {
  //   method: 'POST',
  //   headers: {
  //     'X-API-Key': process.env.FREIGHTHUB_API_KEY,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(params)
  // })
  
  return generateForwarderQuote(params, 'FreightHub', 0.88)
}

async function getFlexportQuote(params) {
  return generateForwarderQuote(params, 'Flexport', 0.93)
}

async function getForwardernetQuote(params) {
  return generateForwarderQuote(params, 'Forwarder.net', 0.87)
}

// 市场价格API示例
async function getFreightosQuote(params) {
  return generateMarketQuote(params, 'Freightos Marketplace', 0.91)
}

async function getWorldfreightRatesQuote(params) {
  return generateMarketQuote(params, 'World Freight Rates', 0.89)
}

// 生成航空公司报价
function generateAirlineQuote(params, carrier, priceFactor) {
  const basePrice = calculateBasePrice(params.origin, params.destination, params.weight, params.volume)
  const adjustedPrice = basePrice * priceFactor
  
  return {
    source: 'airline',
    carrier: carrier,
    price: Math.round(adjustedPrice * 100) / 100,
    currency: 'USD',
    transitTime: getTransitTime(params.origin, params.destination),
    totalCost: Math.round(adjustedPrice * Math.max(params.weight, params.volume * 167) * 100) / 100,
    serviceType: 'Direct Airline',
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时有效
    lastUpdated: new Date().toISOString(),
    reliability: 0.95, // 可靠性评分
    marketRank: Math.floor(Math.random() * 10) + 1
  }
}

// 生成货代报价
function generateForwarderQuote(params, provider, priceFactor) {
  const basePrice = calculateBasePrice(params.origin, params.destination, params.weight, params.volume)
  const adjustedPrice = basePrice * priceFactor
  
  return {
    source: 'forwarder',
    carrier: provider,
    price: Math.round(adjustedPrice * 100) / 100,
    currency: 'USD',
    transitTime: getTransitTime(params.origin, params.destination),
    totalCost: Math.round(adjustedPrice * Math.max(params.weight, params.volume * 167) * 100) / 100,
    serviceType: 'Freight Forwarder',
    validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48小时有效
    lastUpdated: new Date().toISOString(),
    reliability: 0.90,
    marketRank: Math.floor(Math.random() * 10) + 1,
    additionalServices: ['Customs Clearance', 'Door to Door', 'Insurance']
  }
}

// 生成市场价格
function generateMarketQuote(params, platform, priceFactor) {
  const basePrice = calculateBasePrice(params.origin, params.destination, params.weight, params.volume)
  const adjustedPrice = basePrice * priceFactor
  
  return {
    source: 'marketplace',
    carrier: platform,
    price: Math.round(adjustedPrice * 100) / 100,
    currency: 'USD',
    transitTime: getTransitTime(params.origin, params.destination),
    totalCost: Math.round(adjustedPrice * Math.max(params.weight, params.volume * 167) * 100) / 100,
    serviceType: 'Market Average',
    validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12小时有效
    lastUpdated: new Date().toISOString(),
    reliability: 0.85,
    marketRank: Math.floor(Math.random() * 10) + 1
  }
}

// 价格验证和排序
function validateAndSortQuotes(quotes) {
  return quotes
    .filter(quote => {
      // 过滤无效报价
      return quote.price > 0 && 
             quote.price < 50 && // 价格合理性检查
             new Date(quote.validUntil) > new Date() // 检查有效期
    })
    .sort((a, b) => {
      // 综合评分排序：价格 + 可靠性 + 时效
      const scoreA = (1 / a.price) * a.reliability * (a.transitTime.includes('1-2') ? 1.2 : 1.0)
      const scoreB = (1 / b.price) * b.reliability * (b.transitTime.includes('1-2') ? 1.2 : 1.0)
      return scoreB - scoreA
    })
}

// 生成模拟报价（开发阶段使用）
function generateMockQuotes(params) {
  const carriers = [
    { name: 'Air China', factor: 0.95, type: 'airline' },
    { name: 'China Eastern', factor: 0.92, type: 'airline' },
    { name: 'FreightHub', factor: 0.88, type: 'forwarder' },
    { name: 'Flexport', factor: 0.93, type: 'forwarder' },
    { name: 'Freightos Market', factor: 0.91, type: 'marketplace' }
  ]

  return carriers.map(carrier => {
    const basePrice = calculateBasePrice(params.origin, params.destination, params.weight, params.volume)
    const adjustedPrice = basePrice * carrier.factor * (0.9 + Math.random() * 0.2) // 添加随机波动
    
    return {
      source: carrier.type,
      carrier: carrier.name,
      price: Math.round(adjustedPrice * 100) / 100,
      currency: 'USD',
      transitTime: getTransitTime(params.origin, params.destination),
      totalCost: Math.round(adjustedPrice * Math.max(params.weight, params.volume * 167) * 100) / 100,
      serviceType: carrier.type === 'airline' ? 'Direct Airline' : 
                   carrier.type === 'forwarder' ? 'Freight Forwarder' : 'Market Average',
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date().toISOString(),
      reliability: 0.85 + Math.random() * 0.15,
      marketRank: Math.floor(Math.random() * 10) + 1
    }
  })
}

// 基础价格计算（保持原有逻辑）
function calculateBasePrice(origin, destination, weight, volume) {
  const basePrices = {
    'PVG-LAX': 2.30, 'PVG-JFK': 2.80, 'PVG-LHR': 3.10, 'PVG-FRA': 3.05,
    'PEK-LAX': 2.50, 'PEK-JFK': 2.90, 'PEK-LHR': 3.15, 'PEK-FRA': 3.10,
    'CAN-LAX': 2.20, 'CAN-JFK': 2.70, 'CAN-LHR': 3.00, 'CAN-FRA': 2.95,
    'SZX-LAX': 2.15, 'SZX-JFK': 2.65, 'SZX-LHR': 2.95, 'SZX-FRA': 2.90,
  }

  const route = `${origin}-${destination}`
  let basePrice = basePrices[route] || 2.50

  // 体积重量计算
  const volumeWeight = volume * 167
  const chargeableWeight = Math.max(weight, volumeWeight)
  
  // 重量阶梯定价
  if (chargeableWeight > 1000) basePrice *= 0.85
  else if (chargeableWeight > 500) basePrice *= 0.90
  else if (chargeableWeight > 100) basePrice *= 0.95

  return basePrice
}

// 运输时间计算
function getTransitTime(origin, destination) {
  const transitTimes = {
    'PVG-LAX': '2-3 days', 'PVG-JFK': '1-2 days', 'PVG-LHR': '1-2 days', 'PVG-FRA': '1-2 days',
    'PEK-LAX': '2-3 days', 'PEK-JFK': '1-2 days', 'PEK-LHR': '1-2 days', 'PEK-FRA': '1-2 days',
    'CAN-LAX': '2-3 days', 'CAN-JFK': '2-3 days', 'CAN-LHR': '2-3 days', 'CAN-FRA': '2-3 days',
    'SZX-LAX': '2-3 days', 'SZX-JFK': '2-3 days', 'SZX-LHR': '2-3 days', 'SZX-FRA': '2-3 days',
  }

  return transitTimes[`${origin}-${destination}`] || '2-4 days'
}

// 生成报价ID
function generateQuoteId() {
  return 'SKY' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase()
}

// 获取报价有效期
function getQuoteExpiry() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
}

// 记录查询日志
async function logQuoteRequest(data) {
  // 实际实现中应该保存到数据库
  console.log('Quote Request Logged:', {
    timestamp: data.timestamp,
    route: `${data.origin}-${data.destination}`,
    client: data.clientInfo.company || data.clientInfo.email,
    quotesCount: data.quotes.length,
    bestPrice: data.quotes[0]?.price
  })
} 