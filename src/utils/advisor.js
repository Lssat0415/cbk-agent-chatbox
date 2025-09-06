// Parse user intent from text
export function parseUserIntent(text) {
  const normalized = text.replace(/\s+/g, '').toLowerCase()

  // Risk preference
  let risk = '平衡'
  if (/保守|低风险|稳健|低波动/.test(text)) risk = '稳健'
  if (/激进|高风险|进取|进阶/.test(text)) risk = '激进'
  if (/平衡|中等|适中/.test(text)) risk = '平衡'

  // Investment period (in months)
  let months = null
  const yearMatch = text.match(/(\d+(?:\.\d+)?)\s*年/)
  const monthMatch = text.match(/(\d+(?:\.\d+)?)\s*个月/)
  const rangeMatch = text.match(/(\d+(?:\.\d+)?)\s*[-~到]\s*(\d+(?:\.\d+)?)\s*年/)
  
  if (rangeMatch) {
    months = Math.round(((parseFloat(rangeMatch[1]) + parseFloat(rangeMatch[2])) / 2) * 12)
  } else if (yearMatch) {
    months = Math.round(parseFloat(yearMatch[1]) * 12)
  } else if (monthMatch) {
    months = Math.round(parseFloat(monthMatch[1]))
  }

  // Budget amount (in RMB)
  let budget = null
  const budgetMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:万|万元|w)/i)
  const yuanMatch = text.match(/(\d{4,})\s*(?:元|rmb|人民币)?/i)
  
  if (budgetMatch) {
    budget = parseFloat(budgetMatch[1]) * 10000
  } else if (yuanMatch) {
    budget = parseFloat(yuanMatch[1])
  }

  // Monthly investment (SIP)
  let sipMonthly = null
  const sipMatch = text.match(/每月\s*(\d+(?:\.\d+)?)\s*(?:元|rmb)?/)
  if (sipMatch) sipMonthly = parseFloat(sipMatch[1])
  
  const sipWan = text.match(/每月\s*(\d+(?:\.\d+)?)\s*(?:万|万元)/)
  if (sipWan) sipMonthly = parseFloat(sipWan[1]) * 10000

  // Target annual return
  let targetAnnual = null
  const ann = text.match(/年化\s*(\d+(?:\.\d+)?)\s*%/)
  if (ann) targetAnnual = parseFloat(ann[1])

  // Theme and preference keywords
  const interests = []
  if (/etf|指数|宽基/.test(normalized)) interests.push('ETF/指数')
  if (/科技|先进制造|半导体|ai|新能源|数字经济/.test(text)) interests.push('科技主题')
  if (/现金|货币|余[额]宝|高流动性|现金管理/.test(text)) interests.push('现金管理')
  if (/债券|固收|逆回购/.test(text)) interests.push('固收')
  if (/养老|退休/.test(text)) interests.push('养老')
  if (/教育|子女/.test(text)) interests.push('教育金')
  if (/买房|房贷|首付/.test(text)) interests.push('置业')

  return { risk, months, budget, sipMonthly, targetAnnual, interests }
}

// Build asset allocation based on risk and period
function buildAllocation(riskLevel, months, interests) {
  const longTerm = months != null ? months >= 36 : true
  let cash = 15, bond = 45, equity = 40 // Default balanced

  if (riskLevel === '稳健') {
    cash = longTerm ? 20 : 30
    bond = longTerm ? 55 : 50
    equity = 100 - cash - bond
  } else if (riskLevel === '激进') {
    cash = longTerm ? 10 : 15
    bond = longTerm ? 25 : 35
    equity = 100 - cash - bond
  }

  // Adjust based on interests
  if (interests.includes('现金管理')) {
    cash = Math.min(40, cash + 10)
    bond = Math.max(10, bond - 5)
    equity = 100 - cash - bond
  }
  if (interests.includes('ETF/指数')) {
    equity = Math.min(70, equity + 5)
    bond = Math.max(10, bond - 3)
    cash = 100 - equity - bond
  }
  if (interests.includes('固收')) {
    bond = Math.min(70, bond + 8)
    equity = Math.max(5, equity - 6)
    cash = 100 - equity - bond
  }

  return { cash, bond, equity }
}

// Format currency display
function formatCurrency(cny) {
  if (cny == null) return '—'
  if (cny >= 10000) {
    return (cny / 10000).toFixed(2).replace(/\.00$/, '') + ' 万元'
  }
  return Math.round(cny).toLocaleString('zh-CN') + ' 元'
}

// Generate investment advice based on parsed intent
export function generateAdvice(intel) {
  const { risk, months, budget, sipMonthly, targetAnnual, interests } = intel
  const alloc = buildAllocation(risk, months, interests)

  const horizonText = months != null 
    ? (months >= 12 ? (months / 12).toFixed(1).replace(/\.0$/, '') + ' 年' : months + ' 个月')
    : '未指定'
  const interestText = interests.length ? interests.join('、') : '—'

  const recommendations = []

  // Recommendation 1: Comprehensive asset allocation
  recommendations.push({
    title: '综合资产配置方案',
    summary: '按风险与期限给出现金/固收/权益的基准比例，并可按主题偏好微调。',
    lines: [
      `目标风险：${risk}；投资期限：${horizonText}`,
      `偏好主题：${interestText}；预算：${formatCurrency(budget)}${sipMonthly ? `；每月定投：${formatCurrency(sipMonthly)}` : ''}`,
      `目标年化：${targetAnnual != null ? targetAnnual + '%（自定目标）' : '未设定'}`
    ],
    table: [
      ['现金及货币类', alloc.cash + '%', '应急/流动性管理'],
      ['债券/固收+', alloc.bond + '%', '稳健收益基石'],
      ['股票/权益类', alloc.equity + '%', '中长期增值来源']
    ]
  })

  // Recommendation 2: Theme enhancement
  if (interests.includes('ETF/指数') || interests.includes('科技主题')) {
    recommendations.push({
      title: '主题/指数增强方案',
      summary: '利用宽基+行业/主题ETF做"核心-卫星"配置，控制单主题暴露。',
      lines: [
        '核心：沪深300/中证500/中证全指 等宽基指数；',
        '卫星：科技/新能源/高端制造 主题ETF 不超过权益的30%-40%。'
      ],
      table: [
        ['核心（宽基ETF）', '权益的 60%-70%', '分散市场 Beta'],
        ['卫星（主题ETF）', '权益的 30%-40%', '获取超额收益机会'],
        ['止损与再平衡', '季度/半年度', '纪律性管理波动']
      ]
    })
  }

  // Recommendation 3: Cash management
  if (interests.includes('现金管理') || (months != null && months <= 6)) {
    recommendations.push({
      title: '现金与流动性管理方案',
      summary: '强调流动性与本金安全，适合短期或随时可用预算。',
      lines: [
        '工具：货币基金、短债基金、银行智能存款、逆回购等；',
        '目标：在确保流动性的前提下，力争优于活期的稳健收益。'
      ],
      table: [
        ['货币/现金类', '50%-80%', 'T+0/T+1 赎回，流动性高'],
        ['短债/固收+', '20%-50%', '波动较小，收益略高'],
        ['提醒', '—', '关注流动性规则与赎回限制']
      ]
    })
  }

  // Default recommendation if none match
  if (recommendations.length === 0) {
    recommendations.push({
      title: '基础配置参考',
      summary: '缺少偏好细节时，提供通用的风险分层配置作为参考。',
      lines: ['可补充：风险偏好、期限、预算、主题偏好等信息，以获得更精准建议。'],
      table: [
        ['现金及货币类', '20%-30%', '应急与短期支出'],
        ['债券/固收+', '40%-50%', '稳健收益底座'],
        ['股票/权益类', '20%-40%', '中长期成长']
      ]
    })
  }

  return {
    alloc,
    recommendations,
    risk,
    horizonText,
    budgetText: formatCurrency(budget)
  }
}