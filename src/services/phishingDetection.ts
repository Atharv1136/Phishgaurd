interface ScanResult {
  isSafe: boolean;
  risk: 'low' | 'medium' | 'high';
  reasons: string[];
  reported?: boolean;
}

interface ReportedURL {
  url: string;
  reportCount: number;
  timestamp: number;
}

// Trusted domains whitelist
const trustedDomains = [
  // Social Media
  'google.com', 'youtube.com', 'instagram.com', 'facebook.com', 'twitter.com', 
  'linkedin.com', 'whatsapp.com', 'reddit.com', 'wikipedia.org', 'pinterest.com',
  
  // Educational
  'coursera.org', 'edx.org', 'khanacademy.org', 'ocw.mit.edu', 'udemy.com',
  'geeksforgeeks.org', 'freecodecamp.org', 'stackoverflow.com', 'w3schools.com',
  'developer.mozilla.org',
  
  // Shopping
  'amazon.com', 'flipkart.com', 'walmart.com', 'bestbuy.com', 'ebay.com',
  
  // News
  'bbc.com', 'reuters.com', 'nationalgeographic.com', 'nytimes.com', 'theguardian.com',
  
  // Health
  'mayoclinic.org', 'webmd.com', 'who.int', 'nih.gov',
  
  // Government
  'gov.in', 'usa.gov', 'gov.uk', 'unesco.org'
];

// Store reported URLs in localStorage
const getReportedUrls = (): ReportedURL[] => {
  const stored = localStorage.getItem('reportedUrls');
  return stored ? JSON.parse(stored) : [];
};

const saveReportedUrl = (url: string) => {
  const reported = getReportedUrls();
  const existing = reported.find(r => r.url === url);
  
  if (existing) {
    existing.reportCount++;
    existing.timestamp = Date.now();
  } else {
    reported.push({
      url,
      reportCount: 1,
      timestamp: Date.now()
    });
  }
  
  localStorage.setItem('reportedUrls', JSON.stringify(reported));
};

const isDomainTrusted = (domain: string): boolean => {
  return trustedDomains.some(trusted => {
    // Remove subdomains for comparison
    const domainParts = domain.split('.');
    const domainWithoutSubdomain = domainParts.slice(-2).join('.');
    return trusted.includes(domainWithoutSubdomain);
  });
};

const checkPhishTank = async (url: string): Promise<boolean> => {
  try {
    const reportedUrls = getReportedUrls();
    const isReported = reportedUrls.some(r => r.url === url);
    
    const suspiciousPatterns = [
      'login', 'signin', 'account', 'verify', 'secure', 'banking',
      'paypal', 'password', 'credential', 'wallet', 'crypto',
      'authenticate', 'verification', 'security', 'update', 'confirm'
    ];
    
    const urlLower = url.toLowerCase();
    const hasSuspiciousPattern = suspiciousPatterns.some(pattern => urlLower.includes(pattern));
    
    return isReported || hasSuspiciousPattern;
  } catch (error) {
    console.error('Error checking PhishTank:', error);
    return false;
  }
};

export const scanUrl = async (url: string): Promise<ScanResult> => {
  const reasons: string[] = [];
  let risk: 'low' | 'medium' | 'high' = 'low';
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();

    // Check if domain is trusted
    if (isDomainTrusted(domain)) {
      return {
        isSafe: true,
        risk: 'low',
        reasons: ['Domain is verified and trusted'],
        reported: false
      };
    }
    
    // Basic checks
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
      reasons.push('URL contains IP address instead of domain name');
      risk = 'high';
    }

    const suspiciousTerms = [
      'login', 'signin', 'account', 'verify', 'secure', 'banking',
      'support', 'help', 'service', 'update', 'confirm'
    ];
    
    if (suspiciousTerms.some(term => domain.includes(term))) {
      reasons.push('Domain contains suspicious terms');
      risk = 'medium';
    }

    if (domain.split('.').length > 3) {
      reasons.push('URL contains excessive subdomains');
      risk = 'medium';
    }

    if (urlObj.protocol !== 'https:') {
      reasons.push('Connection is not secure (HTTP)');
      risk = 'high';
    }

    if (url.includes('@') || url.includes('//')) {
      reasons.push('URL contains suspicious characters');
      risk = 'high';
    }

    // Check for typosquatting
    const similarToTrusted = trustedDomains.some(trusted => {
      const distance = levenshteinDistance(domain, trusted);
      return distance > 0 && distance <= 2; // Allow 2 character differences
    });
    
    if (similarToTrusted) {
      reasons.push('Domain is suspiciously similar to a trusted website (possible typosquatting)');
      risk = 'high';
    }

    // Check reported URLs
    const reportedUrls = getReportedUrls();
    const reported = reportedUrls.find(r => r.url === url);
    if (reported) {
      reasons.push(`This URL has been reported ${reported.reportCount} times by users`);
      risk = 'high';
    }

    // Check PhishTank
    const isPhishTankMatch = await checkPhishTank(url);
    if (isPhishTankMatch) {
      reasons.push('URL matches known phishing patterns');
      risk = 'high';
    }

  } catch (error) {
    reasons.push('Invalid URL format');
    risk = 'high';
  }

  return {
    isSafe: reasons.length === 0,
    risk,
    reasons: reasons.length > 0 ? reasons : ['No suspicious patterns detected'],
    reported: false
  };
};

// Helper function to calculate Levenshtein distance for typosquatting detection
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      );
    }
  }

  return matrix[b.length][a.length];
}

export const reportUrl = (url: string) => {
  saveReportedUrl(url);
};

export const scanEmail = (headers: string): ScanResult => {
  const reasons: string[] = [];
  let risk: 'low' | 'medium' | 'high' = 'low';

  // Check for common email phishing indicators
  const headers_lower = headers.toLowerCase();

  // Check for spoofed sender
  if (headers_lower.includes('return-path') && headers_lower.includes('from')) {
    const returnPathMatch = headers.match(/Return-Path:\s*<([^>]+)>/i);
    const fromMatch = headers.match(/From:\s*[^<]*<([^>]+)>/i);
    
    if (returnPathMatch && fromMatch && returnPathMatch[1] !== fromMatch[1]) {
      reasons.push('Sender address mismatch (possible spoofing)');
      risk = 'high';
    }
  }

  // Check for suspicious authentication results
  if (headers_lower.includes('authentication-results')) {
    if (headers_lower.includes('spf=fail') || headers_lower.includes('dkim=fail')) {
      reasons.push('Failed email authentication');
      risk = 'high';
    }
  }

  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-mailer=php',
    'x-php-script',
    'bulk',
    'spam'
  ];

  suspiciousHeaders.forEach(header => {
    if (headers_lower.includes(header)) {
      reasons.push('Suspicious email headers detected');
      risk = 'medium';
    }
  });

  // Check for multiple hops
  const receivedCount = (headers.match(/Received:/g) || []).length;
  if (receivedCount > 5) {
    reasons.push('Unusual number of mail server hops');
    risk = 'medium';
  }

  return {
    isSafe: reasons.length === 0,
    risk,
    reasons: reasons.length > 0 ? reasons : ['No suspicious patterns detected'],
    reported: false
  };
};
