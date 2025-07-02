# 🎯 价格准确性保障指南

## 概述

为确保 **skyrate.info** 为客户提供最准确、最及时的空运价格信息，我们建立了多层次的价格准确性保障体系。

## 🛡️ 价格准确性保障策略

### 1. **多数据源集成** 🔗

#### 1.1 直接航空公司API
- **中国国际航空** (Air China)
- **中国东方航空** (China Eastern)
- **中国南方航空** (China Southern)
- **国泰航空** (Cathay Pacific)

```javascript
// API集成示例
const airlineQuotes = await Promise.allSettled([
  getAirChinaQuote(params),
  getChinaEasternQuote(params),
  getChinaSouthernQuote(params),
  getCathayPacificQuote(params)
])
```

#### 1.2 专业货代平台
- **FreightHub** - 欧美优质货代网络
- **Flexport** - 全球供应链平台
- **Forwarder.net** - 国际货代联盟

#### 1.3 市场价格数据
- **Freightos Marketplace** - 全球物流市场
- **World Freight Rates** - 实时市场价格

### 2. **实时价格验证** ⚡

#### 2.1 价格合理性检查
```javascript
.filter(quote => {
  return quote.price > 0 && 
         quote.price < 50 && // 价格上限检查
         new Date(quote.validUntil) > new Date() // 有效期检查
})
```

#### 2.2 价格波动监控
- **异常检测**: 15% 以上价格变动触发警报
- **市场对比**: 多数据源价格差异分析
- **趋势分析**: 24小时价格走势监控

### 3. **智能排序算法** 🧠

#### 3.1 综合评分公式
```javascript
const score = (1 / price) * reliability * timeBonus
```

**评分因子**:
- **价格因子**: 价格越低分数越高
- **可靠性因子**: 数据源可靠性评分 (0.85-0.95)
- **时效奖励**: 1-2天运输时间获得 1.2x 加分

#### 3.2 数据源权重
| 数据源类型 | 可靠性评分 | 权重 |
|-----------|-----------|------|
| 直接航空公司 | 95% | 高 |
| 专业货代 | 90% | 中 |
| 市场数据 | 85% | 低 |

### 4. **缓存与更新策略** 💾

#### 4.1 分层缓存
```javascript
// 缓存配置
const cacheTTL = {
  airline: 300,      // 5分钟
  forwarder: 600,    // 10分钟
  marketplace: 900   // 15分钟
}
```

#### 4.2 更新频率
- **高频路线**: 每 5 分钟更新
- **普通路线**: 每 10 分钟更新
- **低频路线**: 每 30 分钟更新

### 5. **价格有效期管理** ⏰

#### 5.1 有效期设置
| 数据源 | 有效期 | 说明 |
|-------|--------|------|
| 航空公司 | 24小时 | 直接报价，稳定性高 |
| 货代平台 | 48小时 | 包含服务费，更新较慢 |
| 市场数据 | 12小时 | 市场波动，需频繁更新 |

#### 5.2 过期处理
```javascript
// 自动清理过期数据
const isExpired = new Date(quote.validUntil) < new Date()
if (isExpired) {
  removeFromCache(quote.id)
  triggerPriceUpdate(route)
}
```

### 6. **错误处理与降级** 🛡️

#### 6.1 降级策略
1. **主要API失败** → 使用备用数据源
2. **部分数据源失败** → 标记置信度降低
3. **全部API失败** → 使用历史数据 + 免责声明

#### 6.2 错误监控
```javascript
// 数据源状态监控
const sourceStatus = {
  'Air China API': { status: 'online', latency: 150 },
  'FreightHub API': { status: 'degraded', latency: 500 },
  'Freightos Market': { status: 'offline', lastUpdate: '2h ago' }
}
```

## 📊 价格监控系统

### 1. **实时监控面板**

访问 `/api/price-monitor` 查看：
- 价格历史走势
- 数据源在线状态
- 价格异常警报
- 置信度评分

### 2. **智能警报系统**

#### 2.1 警报类型
- **价格异常**: 超过阈值的价格变动
- **数据源离线**: API服务中断
- **价格分歧**: 多数据源价格差异过大

#### 2.2 警报处理
```javascript
const alerts = [
  {
    type: 'price_spike',
    route: 'PVG-LAX',
    message: 'Price spike detected: 15% increase',
    severity: 'medium'
  }
]
```

### 3. **置信度评分系统**

#### 3.1 评分因子 (总分100)
- **数据新鲜度** (30%): 最近更新时间
- **数据源可靠性** (30%): 在线数据源比例
- **价格稳定性** (20%): 近期价格波动方差
- **成交量指标** (20%): 查询量和市场活跃度

#### 3.2 置信度等级
- **90-100**: 🟢 高置信度 (绿色)
- **80-89**: 🟡 中等置信度 (黄色)
- **<80**: 🔴 低置信度 (红色)

## 🔧 实施建议

### 1. **立即可实施** (开发阶段)
- ✅ 多数据源模拟
- ✅ 价格验证逻辑
- ✅ 缓存机制
- ✅ 置信度显示

### 2. **生产环境准备**
- 🔄 申请航空公司API密钥
- 🔄 集成货代平台API
- 🔄 部署Redis缓存
- 🔄 设置监控报警

### 3. **持续优化**
- 📈 机器学习价格预测
- 📈 用户行为分析
- 📈 动态定价优化
- 📈 A/B测试不同策略

## 🎯 最佳实践

### 1. **透明度原则**
- 显示数据来源
- 标明更新时间
- 提供置信度评分
- 清楚的免责声明

### 2. **用户体验**
- 快速响应 (<3秒)
- 降级优雅处理
- 错误信息友好
- 备选方案提供

### 3. **数据质量**
- 定期校验API数据
- 人工抽查验证
- 用户反馈收集
- 持续改进算法

## 📞 技术支持

如需帮助实施价格准确性保障系统，请联系:
- **技术支持**: tech@skyrate.info
- **紧急热线**: +86-400-XXX-XXXX
- **监控面板**: https://skyrate.info/admin/price-monitor

---

*此文档将根据系统升级和最佳实践持续更新* 