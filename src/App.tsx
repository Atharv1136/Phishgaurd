import React, { useState, useEffect } from 'react';
import { Shield, Link, Mail, History, Sun, Moon, AlertTriangle, CheckCircle, Flag } from 'lucide-react';
import { scanUrl, scanEmail, reportUrl } from './services/phishingDetection';

interface ScanHistoryItem {
  type: string;
  target: string;
  result: string;
  date: string;
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState('url');
  const [showSafetyPrecautions, setShowSafetyPrecautions] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [scanResult, setScanResult] = useState<{ isSafe: boolean; risk: string; reasons: string[] } | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([
    { type: 'URL', target: 'example.com', result: 'Safe', date: '2024-03-15' },
    { type: 'Email', target: 'test@example.com', result: 'Suspicious', date: '2024-03-14' },
  ]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleUrlScan = async () => {
    if (!urlInput.trim()) return;
    
    setIsScanning(true);
    try {
      const result = await scanUrl(urlInput);
      setScanResult(result);

      // Add to history
      setScanHistory(prev => [{
        type: 'URL',
        target: urlInput,
        result: result.isSafe ? 'Safe' : `Suspicious (${result.risk} risk)`,
        date: new Date().toISOString().split('T')[0]
      }, ...prev]);
    } catch (error) {
      console.error('Error scanning URL:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleEmailScan = () => {
    if (!emailInput.trim()) return;

    const result = scanEmail(emailInput);
    setScanResult(result);

    // Add to history
    setScanHistory(prev => [{
      type: 'Email',
      target: emailInput.substring(0, 30) + '...',
      result: result.isSafe ? 'Safe' : `Suspicious (${result.risk} risk)`,
      date: new Date().toISOString().split('T')[0]
    }, ...prev]);
  };

  const handleReport = () => {
    if (!urlInput.trim()) return;
    
    reportUrl(urlInput);
    setScanResult(prev => prev ? {
      ...prev,
      isSafe: false,
      risk: 'high',
      reasons: [...prev.reasons, 'URL has been reported by users'],
      reported: true
    } : null);
  };

  if (showIntro) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}
           style={{
             backgroundImage: 'url(https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&q=80)',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundAttachment: 'fixed'
           }}>
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            {isDarkMode ? <Sun className="w-6 h-6 text-white" /> : <Moon className="w-6 h-6 text-white" />}
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-screen backdrop-blur-sm bg-black/30">
          <Shield className="w-32 h-32 text-blue-400 animate-bounce mb-4" />
          <h1 className="text-4xl font-bold mb-4 text-white">PhishGuard</h1>
          <p className="text-xl text-white">PhishGuard: Because Every Click Should Be Safe</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}
      style={{
        backgroundImage: 'url(https://wallpapers.com/images/high/blue-and-pink-background-2560-x-1600-y98tgv6swg93h11l.webp?auto=format&fit=crop&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6 bg-black/30 backdrop-blur-sm p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">PhishGuard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-green-500/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-green-300 text-sm font-medium">Active</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              {isDarkMode ? <Sun className="w-6 h-6 text-white" /> : <Moon className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        <div className="mb-6 flex space-x-2 bg-black/30 backdrop-blur-sm p-2 rounded-lg">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'url'
                ? 'bg-blue-600 text-white'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Link className="w-5 h-5" />
            <span>URL Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'email'
                ? 'bg-blue-600 text-white'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Mail className="w-5 h-5" />
            <span>Email Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <History className="w-5 h-5" />
            <span>History</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-lg transition-colors ${activeTab === 'url' ? 'block' : 'hidden'}`}>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Enter URL to scan</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleUrlScan}
                disabled={isScanning}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scanning...
                  </span>
                ) : 'Scan'}
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Flag className="w-4 h-4" />
                <span>Report</span>
              </button>
            </div>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-lg transition-colors ${activeTab === 'email' ? 'block' : 'hidden'}`}>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Email Headers Analysis</label>
            <textarea
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Paste email headers here..."
              className="w-full h-32 px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button 
              onClick={handleEmailScan}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Scan Email
            </button>
          </div>

          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-lg transition-colors ${activeTab === 'history' ? 'block' : 'hidden'}`}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Scan History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {scanHistory.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.target}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full ${
                          item.result.includes('Safe') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {item.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {scanResult && (
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-lg transition-colors">
              <div className="flex items-start space-x-4">
                {scanResult.isSafe ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {scanResult.isSafe ? 'Safe to proceed' : `Suspicious (${scanResult.risk} risk)`}
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {scanResult.reasons && scanResult.reasons.map((reason, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowSafetyPrecautions(!showSafetyPrecautions)}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Safety Precautions
        </button>

        {showSafetyPrecautions && (
          <div className="mt-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-lg transition-colors">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Stay Safe from Phishing Attacks</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-900 dark:text-white">
              <li>Verify the sender's email address and domain.</li>
              <li>Look for suspicious URLs and links.</li>
              <li>Check for SSL certificates (https).</li>
              <li>Never share personal information unless you are certain of the website's legitimacy.</li>
              <li>Be wary of urgent or threatening emails.</li>
              <li>Keep your software updated.</li>
              <li>Use strong passwords.</li>
              <li>Enable two-factor authentication.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}


