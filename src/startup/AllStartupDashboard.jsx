import React, { useState } from 'react';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, Filter, MapPin, TrendingUp, DollarSign, Users, Award } from 'lucide-react';

export default function AllStartupDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [rankingMetric, setRankingMetric] = useState('overall');
  
  const topStartups = [
    { id: 1, name: "TechInnovate PH", industry: "FinTech", score: 92, growth: 24 },
    { id: 2, name: "Green Solutions", industry: "CleanTech", score: 88, growth: 18 },
    { id: 3, name: "Health Connect", industry: "HealthTech", score: 85, growth: 22 },
    { id: 4, name: "AgriTech PH", industry: "AgTech", score: 81, growth: 15 },
    { id: 5, name: "EdTech Solutions", industry: "EdTech", score: 79, growth: 19 }
  ];
  
  const industryData = [
    { name: 'FinTech', value: 28, color: '#0088FE' },
    { name: 'HealthTech', value: 22, color: '#00C49F' },
    { name: 'EdTech', value: 18, color: '#FFBB28' },
    { name: 'CleanTech', value: 15, color: '#FF8042' },
    { name: 'AgTech', value: 17, color: '#8884d8' }
  ];
  
  const growthData = [
    { name: 'Jan', FinTech: 12, HealthTech: 8, EdTech: 5 },
    { name: 'Feb', FinTech: 15, HealthTech: 10, EdTech: 7 },
    { name: 'Mar', FinTech: 18, HealthTech: 12, EdTech: 9 },
    { name: 'Apr', FinTech: 22, HealthTech: 15, EdTech: 12 },
    { name: 'May', FinTech: 25, HealthTech: 18, EdTech: 14 },
    { name: 'Jun', FinTech: 29, HealthTech: 22, EdTech: 16 }
  ];
  
  const fundingData = [
    { name: 'Seed', value: 45 },
    { name: 'Series A', value: 28 },
    { name: 'Series B', value: 15 },
    { name: 'Series C+', value: 12 }
  ];

  const locationData = [
    { name: 'Metro Manila', value: 58 },
    { name: 'Cebu', value: 15 },
    { name: 'Davao', value: 8 },
    { name: 'Iloilo', value: 6 },
    { name: 'Other', value: 13 }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">StartupSphere Philippines</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search startups..." 
                className="pl-8 pr-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            </div>
            <button className="flex items-center bg-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-500">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow p-6">
        {/* Dashboard stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow flex items-center">
            <div className="p-3 bg-indigo-100 rounded-full mr-4">
              <TrendingUp className="h-6 w-6 text-indigo-700" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Startups</p>
              <p className="text-xl font-bold">648</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <DollarSign className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Funding</p>
              <p className="text-xl font-bold">₱3.2B</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <MapPin className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Startup Hubs</p>
              <p className="text-xl font-bold">12 Regions</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full mr-4">
              <Users className="h-6 w-6 text-yellow-700" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Employment Created</p>
              <p className="text-xl font-bold">18.5K Jobs</p>
            </div>
          </div>
        </div>
        
        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('rankings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rankings' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rankings
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reports
            </button>
          </nav>
        </div>
        
        {/* Dashboard content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top startups */}
            <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Top Performing Startups</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select className="text-sm border rounded p-1">
                    <option>Overall Score</option>
                    <option>Growth Rate</option>
                    <option>Funding</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Startup</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topStartups.map((startup, index) => (
                      <tr key={startup.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-700 font-medium">{index + 1}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{startup.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {startup.industry}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{startup.score}/100</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-green-600">+{startup.growth}%</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Industry breakdown */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Industry Breakdown</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={industryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Growth trend */}
            <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Growth Trends by Industry</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="FinTech" stroke="#0088FE" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="HealthTech" stroke="#00C49F" />
                    <Line type="monotone" dataKey="EdTech" stroke="#FFBB28" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Funding stages */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Funding Stages</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fundingData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {fundingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'rankings' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Startup Rankings</h2>
              <div className="flex space-x-4">
                <select 
                  className="border rounded p-2 text-sm"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                >
                  <option value="All">All Industries</option>
                  <option value="FinTech">FinTech</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="EdTech">EdTech</option>
                  <option value="CleanTech">CleanTech</option>
                  <option value="AgTech">AgTech</option>
                </select>
                <select 
                  className="border rounded p-2 text-sm"
                  value={rankingMetric}
                  onChange={(e) => setRankingMetric(e.target.value)}
                >
                  <option value="overall">Overall Score</option>
                  <option value="growth">Growth Score</option>
                  <option value="investment">Investment Score</option>
                  <option value="ecosystem">Ecosystem Score</option>
                  <option value="engagement">Engagement Score</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Startup</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ecosystem Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement Score</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Sample ranking data */}
                  {Array(10).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{i + 1}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Startup {String.fromCharCode(65 + i)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {['FinTech', 'HealthTech', 'EdTech', 'CleanTech', 'AgTech'][i % 5]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{Math.round(95 - i * 1.5)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{Math.round(90 - i * Math.random() * 5)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{Math.round(92 - i * Math.random() * 4)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{Math.round(88 - i * Math.random() * 6)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{Math.round(85 - i * Math.random() * 7)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Geographical Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={locationData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label
                    >
                      {locationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Funding by Industry (₱M)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'FinTech', funding: 850 },
                      { name: 'HealthTech', funding: 620 },
                      { name: 'EdTech', funding: 450 },
                      { name: 'CleanTech', funding: 380 },
                      { name: 'AgTech', funding: 280 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="funding" fill="#8884d8">
                      {industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Employment Generation by Industry</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'FinTech', jobs: 4800 },
                      { name: 'HealthTech', jobs: 3900 },
                      { name: 'EdTech', jobs: 3200 },
                      { name: 'CleanTech', jobs: 2800 },
                      { name: 'AgTech', jobs: 3800 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="jobs" fill="#8884d8">
                      {industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Survival Rate by Industry</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'FinTech', rate: 68 },
                      { name: 'HealthTech', rate: 72 },
                      { name: 'EdTech', rate: 65 },
                      { name: 'CleanTech', rate: 70 },
                      { name: 'AgTech', rate: 62 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#8884d8">
                      {industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Startup Ecosystem Reports</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Annual Ecosystem Report', 'Funding Landscape', 'Industry Analysis', 'Regional Performance', 'Employment Impact', 'Government Support Analysis'].map((report, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-indigo-50 cursor-pointer">
                    <h3 className="font-medium mb-2">{report}</h3>
                    <p className="text-sm text-gray-500">Last updated: {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index % 6]} 2025</p>
                    <button className="mt-2 text-indigo-600 text-sm font-medium">Download PDF</button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Custom Report Builder</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <select className="w-full border rounded p-2">
                    <option>All Industries</option>
                    <option>FinTech</option>
                    <option>HealthTech</option>
                    <option>EdTech</option>
                    <option>CleanTech</option>
                    <option>AgTech</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <select className="w-full border rounded p-2">
                    <option>All Regions</option>
                    <option>Metro Manila</option>
                    <option>Cebu</option>
                    <option>Davao</option>
                    <option>Iloilo</option>
                    <option>Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                  <select className="w-full border rounded p-2">
                    <option>2025 (YTD)</option>
                    <option>2024</option>
                    <option>2023</option>
                    <option>Last 3 Years</option>
                    <option>Last 5 Years</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Metrics to Include</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {[
                    'Growth Rate', 'Funding Amount', 'Survival Rate', 
                    'Employment Data', 'Investment Rounds', 'Foreign Investment',
                    'Government Support', 'Mentorship Data', 'Public-Private Partnerships'
                  ].map((metric, index) => (
                    <div key={index} className="flex items-center">
                      <input type="checkbox" id={`metric-${index}`} className="mr-2" />
                      <label htmlFor={`metric-${index}`} className="text-sm">{metric}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500">
                  Generate Custom Report
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white p-4 border-t">
        <div className="text-center text-sm text-gray-500">
          © 2025 StartupSphere Philippines | Supporting DTI, DICT, and DOST
        </div>
      </footer>
    </div>
  );
}