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

