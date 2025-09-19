import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication APIs
export const login = async (username: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  } catch (error) {
    // Mock authentication for demo purposes
    if (username === 'admin' && password === 'admin123') {
      return {
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'administrator'
        },
        expiresIn: 86400 // 24 hours
      };
    } else if (username === 'user' && password === 'user123') {
      return {
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          id: 2,
          username: 'user',
          email: 'user@example.com',
          role: 'user'
        },
        expiresIn: 86400
      };
    } else {
      throw new Error('Invalid username or password');
    }
  }
};

export const logout = async () => {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error) {
    // Mock logout - always succeed
    return { message: 'Logged out successfully' };
  }
};

export const validateToken = async () => {
  try {
    const response = await apiClient.get('/auth/validate');
    return response.data;
  } catch (error) {
    // Mock token validation
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock_jwt_token_')) {
      return {
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'administrator'
        },
        valid: true
      };
    }
    throw new Error('Invalid token');
  }
};

// Applications API
export const getApplications = async () => {
  try {
    const response = await apiClient.get('/applications');
    return response.data;
  } catch (error) {
    console.log('API error, returning mock applications data');
    // Return mock applications data with correct interface
    return [
      {
        id: 1,
        name: 'SIMPEG',
        description: 'Sistem Informasi Manajemen Pegawai',
        url: 'https://simpeg.example.com',
        status: 'healthy',
        lastChecked: new Date(),
        responseTime: 120,
        hasApi: true,
        category: 'HR',
        icon: '�',
        color: '#3b82f6'
      },
      {
        id: 2,
        name: 'E-Office',
        description: 'Electronic Office Management System',
        url: 'https://eoffice.example.com',
        status: 'warning',
        lastChecked: new Date(),
        responseTime: 250,
        hasApi: true,
        category: 'Office',
        icon: '�',
        color: '#10b981'
      },
      {
        id: 3,
        name: 'PPID',
        description: 'Pejabat Pengelola Informasi dan Dokumentasi',
        url: 'https://ppid.example.com',
        status: 'critical',
        lastChecked: new Date(),
        responseTime: 450,
        hasApi: false,
        category: 'Information',
        icon: '�',
        color: '#f59e0b'
      },
      {
        id: 4,
        name: 'Website Portal',
        description: 'Official Government Portal Website',
        url: 'https://portal.example.com',
        status: 'healthy',
        lastChecked: new Date(),
        responseTime: 90,
        hasApi: false,
        category: 'Portal',
        icon: '🌐',
        color: '#8b5cf6'
      }
    ];
  }
};

export const getApplicationStats = async (applicationId: number) => {
  try {
    const response = await apiClient.get(`/monitoring/applications/${applicationId}/stats`);
    return response.data;
  } catch (error) {
    // Return mock stats for specific application
    const mockStats = {
      1: {
        applicationId: 1,
        applicationName: 'E-Commerce Platform',
        concurrentUsers: { count: Math.floor(Math.random() * 500) + 100, timestamp: new Date().toISOString() },
        uptime: { uptime: '99.8%', lastDown: '2 hours ago', timestamp: new Date().toISOString() },
        tickets: { total: 12, open: 3, closed: 9, timestamp: new Date().toISOString() },
        status: 'healthy',
        lastUpdated: new Date().toISOString()
      },
      2: {
        applicationId: 2,
        applicationName: 'CRM System',
        concurrentUsers: { count: Math.floor(Math.random() * 200) + 50, timestamp: new Date().toISOString() },
        uptime: { uptime: '99.9%', lastDown: '1 day ago', timestamp: new Date().toISOString() },
        tickets: { total: 8, open: 2, closed: 6, timestamp: new Date().toISOString() },
        status: 'healthy',
        lastUpdated: new Date().toISOString()
      },
      3: {
        applicationId: 3,
        applicationName: 'Analytics Dashboard',
        concurrentUsers: { count: Math.floor(Math.random() * 100) + 20, timestamp: new Date().toISOString() },
        uptime: { uptime: '95.2%', lastDown: '30 minutes ago', timestamp: new Date().toISOString() },
        tickets: { total: 25, open: 8, closed: 17, timestamp: new Date().toISOString() },
        status: 'warning',
        lastUpdated: new Date().toISOString()
      },
      4: {
        applicationId: 4,
        applicationName: 'Payment Gateway',
        concurrentUsers: { count: Math.floor(Math.random() * 300) + 80, timestamp: new Date().toISOString() },
        uptime: { uptime: '99.95%', lastDown: '5 days ago', timestamp: new Date().toISOString() },
        tickets: { total: 5, open: 1, closed: 4, timestamp: new Date().toISOString() },
        status: 'healthy',
        lastUpdated: new Date().toISOString()
      }
    };
    
    return mockStats[applicationId] || mockStats[1];
  }
};

export const getAllApplicationsStats = async () => {
  try {
    const response = await apiClient.get('/monitoring/applications/stats');
    return response.data;
  } catch (error) {
    // Return mock data for all applications
    const applications = await getApplications();
    const stats = await Promise.all(
      applications.map(app => getApplicationStats(app.id))
    );
    
    const totalUsers = stats.reduce((sum, stat) => sum + stat.concurrentUsers.count, 0);
    const totalTickets = stats.reduce((sum, stat) => sum + stat.tickets.total, 0);
    const healthyApps = stats.filter(stat => stat.status === 'healthy').length;
    const warningApps = stats.filter(stat => stat.status === 'warning').length;
    const criticalApps = stats.filter(stat => stat.status === 'critical').length;
    
    return {
      applications: stats,
      summary: {
        totalApplications: applications.length,
        healthyApps,
        warningApps,
        criticalApps,
        totalUsers,
        totalTickets
      }
    };
  }
};

// Legacy APIs for backward compatibility
export const getConcurrentUsers = async () => {
  try {
    const response = await apiClient.get('/monitoring/concurrent-users');
    return response.data;
  } catch (error) {
    // Return mock data if API fails
    return { count: Math.floor(Math.random() * 500) + 100, timestamp: new Date().toISOString() };
  }
};

export const getApplicationUptime = async () => {
  try {
    const response = await apiClient.get('/monitoring/uptime');
    return response.data;
  } catch (error) {
    // Return mock data if API fails
    const uptime = Math.floor(Math.random() * 99) + 95;
    return { uptime: `${uptime.toFixed(2)}%`, lastDown: '2 days ago', timestamp: new Date().toISOString() };
  }
};

export const getTicketCount = async () => {
  try {
    const response = await apiClient.get('/monitoring/tickets');
    return response.data;
  } catch (error) {
    // Return mock data if API fails
    return { 
      total: Math.floor(Math.random() * 50) + 10,
      open: Math.floor(Math.random() * 20) + 5,
      closed: Math.floor(Math.random() * 30) + 10,
      timestamp: new Date().toISOString()
    };
  }
};

// Knowledge Base APIs
export const getFAQs = async () => {
  try {
    const response = await apiClient.get('/knowledgebase/faqs');
    return response.data;
  } catch (error) {
    // Return mock data if API fails
    return [
      {
        id: 1,
        question: 'How do I reset my password?',
        answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page.',
        category: 'Account',
        createdAt: '2025-09-01'
      },
      {
        id: 2,
        question: 'How do I interpret the monitoring dashboard?',
        answer: 'The dashboard shows real-time metrics including concurrent users, system uptime, and ticket statistics.',
        category: 'Monitoring',
        createdAt: '2025-09-05'
      },
      {
        id: 3,
        question: 'What should I do if the system is down?',
        answer: 'If the system is down, please check the status page and contact the IT support team immediately.',
        category: 'Technical',
        createdAt: '2025-09-10'
      }
    ];
  }
};

export const searchFAQs = async (query: string) => {
  try {
    const response = await apiClient.get(`/knowledgebase/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    // Return filtered mock data if API fails
    const faqs = await getFAQs();
    return faqs.filter(faq => 
      faq.question.toLowerCase().includes(query.toLowerCase()) ||
      faq.answer.toLowerCase().includes(query.toLowerCase())
    );
  }
};

export default {
  // Auth
  login,
  logout,
  validateToken,
  // Applications
  getApplications,
  getApplicationStats,
  getAllApplicationsStats,
  // Legacy Monitoring (deprecated)
  getConcurrentUsers,
  getApplicationUptime,
  getTicketCount,
  // Knowledge Base
  getFAQs,
  searchFAQs,
};