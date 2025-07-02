import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    weight: '',
    volume: '',
    cargoType: 'general',
    email: '',
    company: ''
  })
  const [loading, setLoading] = useState(false)
  const [quotes, setQuotes] = useState([])
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' })

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'error' })
    }, 5000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'origin' || name === 'destination' ? value.toUpperCase() : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.origin.length !== 3 || formData.destination.length !== 3) {
      showToast('Please enter valid 3-letter IATA airport codes')
      return
    }
    
    if (parseFloat(formData.weight) <= 0 || parseFloat(formData.volume) <= 0) {
      showToast('Weight and volume must be greater than 0')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: formData.origin,
          destination: formData.destination,
          weight: parseFloat(formData.weight),
          volume: parseFloat(formData.volume),
          cargoType: formData.cargoType,
          email: formData.email,
          company: formData.company
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setQuotes([result.data]) // 将来可以扩展为多个报价
        showToast('Quote retrieved successfully!', 'success')
      } else {
        showToast(result.error || 'Failed to get quote')
      }
    } catch (error) {
      console.error('API Error:', error)
      showToast('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }

  const popularRoutes = [
    { from: 'PVG', to: 'LAX', route: 'Shanghai → Los Angeles' },
    { from: 'PEK', to: 'JFK', route: 'Beijing → New York' },
    { from: 'CAN', to: 'LHR', route: 'Guangzhou → London' },
    { from: 'SZX', to: 'FRA', route: 'Shenzhen → Frankfurt' },
  ]

  const features = [
    {
      icon: '🌍',
      title: 'Global Coverage',
      description: 'Air freight services to 200+ destinations worldwide'
    },
    {
      icon: '⚡',
      title: 'Fast Transit',
      description: 'Express delivery options with 1-3 days transit time'
    },
    {
      icon: '📊',
      title: 'Competitive Rates',
      description: 'Best market rates with transparent pricing'
    },
    {
      icon: '🔒',
      title: 'Secure Handling',
      description: 'Professional cargo handling and insurance coverage'
    }
  ]

  return (
    <>
      <Head>
        <title>SkyRate - Global Air Freight Quote Platform</title>
        <meta name="description" content="Get instant air freight quotes from China to worldwide destinations. Professional air cargo services for international shipping." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="air freight, air cargo, shipping quote, international shipping, freight forwarder" />
      </Head>

      <div className="bg-gray-50 text-gray-900 min-h-screen">
        {/* Toast */}
        <div className={`toast px-6 py-3 rounded-lg shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white ${toast.show ? 'show' : ''}`}>
          <span>{toast.message}</span>
        </div>

        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">SkyRate</h1>
              <nav className="hidden md:flex space-x-6">
                <a href="#quote" className="text-gray-600 hover:text-blue-600">Get Quote</a>
                <a href="#services" className="text-gray-600 hover:text-blue-600">Services</a>
                <a href="#about" className="text-gray-600 hover:text-blue-600">About</a>
                <a href="#contact" className="text-gray-600 hover:text-blue-600">Contact</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-5xl font-bold mb-6">Global Air Freight Solutions</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Get instant quotes for air cargo shipping from China to worldwide destinations. 
              Professional freight forwarding services with competitive rates.
            </p>
            <div className="flex justify-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold">200+</div>
                <div className="text-blue-200">Destinations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-blue-200">Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">1-3</div>
                <div className="text-blue-200">Days Transit</div>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Form Section */}
        <section id="quote" className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Get Your Air Freight Quote</h3>
              <p className="text-xl text-gray-600">Enter your shipment details for an instant quote</p>
          </div>

            <div className="bg-white rounded-xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Route Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                    <label className="block text-sm font-medium mb-2">Origin Airport (IATA Code)</label>
                <input 
                  type="text" 
                  name="origin" 
                      placeholder="e.g., PVG (Shanghai)" 
                  value={formData.origin}
                  onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required 
                  maxLength="3" 
                />
              </div>
              
              <div>
                    <label className="block text-sm font-medium mb-2">Destination Airport (IATA Code)</label>
                <input 
                  type="text" 
                  name="destination" 
                      placeholder="e.g., LAX (Los Angeles)" 
                  value={formData.destination}
                  onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required 
                  maxLength="3" 
                />
                  </div>
              </div>
              
                {/* Cargo Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                    <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                <input 
                  type="number" 
                  name="weight" 
                  placeholder="100" 
                  min="1" 
                  value={formData.weight}
                  onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                />
              </div>
              
              <div>
                    <label className="block text-sm font-medium mb-2">Volume (CBM)</label>
                <input 
                  type="number" 
                  name="volume" 
                  placeholder="0.5" 
                  step="0.1" 
                  min="0.1" 
                  value={formData.volume}
                  onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cargo Type</label>
                    <select 
                      name="cargoType"
                      value={formData.cargoType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="general">General Cargo</option>
                      <option value="electronics">Electronics</option>
                      <option value="textiles">Textiles</option>
                      <option value="machinery">Machinery</option>
                      <option value="dangerous">Dangerous Goods</option>
                    </select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="your@company.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required
                />
              </div>
              
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <input 
                      type="text" 
                      name="company" 
                      placeholder="Your Company Ltd" 
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                  </div>
                </div>
                
                <div className="text-center">
                <button 
                  type="submit" 
                  disabled={loading}
                    className="bg-blue-600 text-white py-4 px-8 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold text-lg"
                >
                    {loading ? 'Getting Quote...' : 'Get Instant Quote'}
                </button>
              </div>
            </form>
          </div>
          </div>
        </section>

        {/* Popular Routes */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-8">Popular Air Freight Routes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularRoutes.map((route, index) => (
                <div 
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      origin: route.from,
                      destination: route.to
                    }))
                  }}
                >
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{route.from} → {route.to}</div>
                    <div className="text-sm text-gray-600 mt-2">{route.route}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Results */}
        {quotes.length > 0 && (
          <section className="py-16">
            <div className="max-w-5xl mx-auto px-4">
              <h3 className="text-2xl font-bold text-center mb-8">Your Air Freight Quote</h3>
              {quotes.map((quote, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 mb-6 border-l-4 border-blue-500">
                  {/* Quote ID and Metadata */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="text-sm font-mono text-gray-500">Quote ID: {quote.metadata?.quoteId || 'SKY' + Date.now().toString(36).toUpperCase()}</span>
                      <div className="text-xs text-gray-400 mt-1">
                        Valid until: {quote.metadata?.validUntil ? new Date(quote.metadata.validUntil).toLocaleDateString() : 'Next 24 hours'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        (quote.reliability || 0.9) > 0.9 ? 'bg-green-100 text-green-800' : 
                        (quote.reliability || 0.9) > 0.8 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {Math.round((quote.reliability || 0.9) * 100)}% Reliable
                      </div>
                      <div className="text-xs text-gray-500">{quote.serviceType || 'Standard Service'}</div>
                    </div>
                  </div>

                  {/* Main Quote Information */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">${quote.price}</div>
                      <div className="text-sm text-gray-600">Per KG</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{quote.transit_time}</div>
                      <div className="text-sm text-gray-600">Transit Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${quote.total_cost}</div>
                      <div className="text-sm text-gray-600">Total Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold">{quote.carrier}</div>
                      <div className="text-sm text-gray-600">Carrier</div>
                    </div>
                  </div>

                  {/* Additional Services */}
                  {quote.additionalServices && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Included Services:</h4>
                      <div className="flex flex-wrap gap-2">
                        {quote.additionalServices.map((service, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Accuracy Indicators */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Accuracy Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Last Updated:</span>
                        <div className="font-medium">{quote.lastUpdated ? new Date(quote.lastUpdated).toLocaleTimeString() : 'Just now'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Data Source:</span>
                        <div className="font-medium">{quote.source === 'airline' ? 'Direct Airline' : quote.source === 'forwarder' ? 'Freight Forwarder' : 'Market Data'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Market Rank:</span>
                        <div className="font-medium">#{quote.marketRank || Math.floor(Math.random() * 5) + 1} of 10</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Confidence:</span>
                        <div className="font-medium">{Math.round((quote.reliability || 0.9) * 100)}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="text-xs text-gray-500 mb-6 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <strong>Important:</strong> {quote.metadata?.disclaimer || 'Prices are subject to change and may vary based on final cargo details. Final rates will be confirmed upon booking.'}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold transition-colors">
                      Book This Quote
                    </button>
                    <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold transition-colors">
                      Request Detailed Quote
                    </button>
                    <button className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-semibold transition-colors">
                      Compare Alternatives
                    </button>
                  </div>
                </div>
              ))}

              {/* Alternative Quotes */}
              {quotes[0]?.alternatives && quotes[0].alternatives.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4">Alternative Options</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {quotes[0].alternatives.map((alt, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">{alt.carrier}</div>
                            <div className="text-sm text-gray-600">${alt.price}/kg • {alt.transitTime}</div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Features Section */}
        <section id="services" className="py-16 bg-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">Why Choose SkyRate</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-xl font-bold mb-4">SkyRate</h4>
                <p className="text-gray-400">Professional air freight services connecting China to the world.</p>
              </div>
              <div>
                <h5 className="font-semibold mb-4">Services</h5>
                <ul className="space-y-2 text-gray-400">
                  <li>Air Freight</li>
                  <li>Express Delivery</li>
                  <li>Customs Clearance</li>
                  <li>Door to Door</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-4">Destinations</h5>
                <ul className="space-y-2 text-gray-400">
                  <li>North America</li>
                  <li>Europe</li>
                  <li>Southeast Asia</li>
                  <li>Middle East</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-4">Contact</h5>
                <ul className="space-y-2 text-gray-400">
                  <li>Email: info@skyrate.info</li>
                  <li>Tel: +86 400-123-4567</li>
                  <li>24/7 Support</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 SkyRate. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 