import { ref, computed, onMounted, watch, type Component } from 'vue'
import { ElMessage } from 'element-plus'
import { useDashboardStore } from '@/stores/dashboard'
import type { Application } from '@/types'
import {
  Flag, Document, Tools, Monitor, Warning, Setting, Star
} from '@element-plus/icons-vue'

// Types
export interface QuickLink {
  id: number
  title: string
  description: string
  icon: Component
  section: string
}

export interface Category {
  id: number
  name: string
  children: Category[]
  depth?: number
}

export interface KnowledgebaseApplication {
  app_id: number
  name: string
  category_list: Category[]
  article_list: KnowledgebaseArticle[]
}

export interface KnowledgebaseArticle {
  id: number
  category_id: number
  title: string
  author: string
  updated_at: string
  updated_by: string
  created_at: string
  created_by: string
  content?: string
  read_time?: number
  views?: number
  tags?: string[]
}

export interface Article {
  title: string
  author: string
  lastUpdated: string
  readTime: number
  views: number
  tags: string[]
  content: string
  appId?: number
}

export interface MenuMap {
  section: string
  article: string
}

export const useKnowledgebase = () => {
  // Stores
  const dashboardStore = useDashboardStore()

  // Reactive state
  const sidebarCollapsed = ref<boolean>(false)
  const searchQuery = ref<string>('')
  const activeMenuItem = ref<string>('overview')
  const currentSection = ref<string>('')
  const currentArticle = ref<string>('')
  const selectedAppId = ref<number | null>(null)
  const favorites = ref<string[]>([])
  const isLoadingApps = ref<boolean>(true)
  const expandedCategories = ref<Set<number>>(new Set())

  // Knowledge base data structure (data dummy lengkap)
  const knowledgebaseApps = ref<KnowledgebaseApplication[]>([
    {
      app_id: 1,
      name: "SiCantik 2025",
      category_list: [
        {
          id: 1,
          name: "Authentication",
          children: [
            {
              id: 10,
              name: "Login Issues",
              children: []
            },
            {
              id: 11,
              name: "Password Reset",
              children: []
            },
            {
              id: 12,
              name: "Session Management",
              children: []
            }
          ]
        },
        {
          id: 2,
          name: "Kendala Transaksi",
          children: [
            {
              id: 3,
              name: "Template Form",
              children: [
                {
                  id: 4,
                  name: "Gagal Simpan Form",
                  children: []
                },
                {
                  id: 5,
                  name: "Form Validation Error",
                  children: []
                }
              ]
            },
            {
              id: 6,
              name: "Payment Processing",
              children: [
                {
                  id: 7,
                  name: "Payment Gateway Error",
                  children: []
                },
                {
                  id: 8,
                  name: "Transaction Timeout",
                  children: []
                }
              ]
            }
          ]
        },
        {
          id: 9,
          name: "System Integration",
          children: [
            {
              id: 13,
              name: "API Integration",
              children: []
            },
            {
              id: 14,
              name: "Database Connectivity",
              children: []
            }
          ]
        }
      ],
      article_list: [
        {
          id: 1,
          category_id: 4,
          title: "Troubleshooting Gagal Simpan Form",
          author: "admin",
          updated_at: "2025-09-20T10:00:00Z",
          updated_by: "admin",
          created_at: "2025-09-15T08:00:00Z",
          created_by: "admin",
          content: `
            <h2>Troubleshooting Template Form - Gagal Simpan Form</h2>
            <p>Panduan mengatasi masalah gagal simpan form pada template SiCantik 2025.</p>
            
            <h3>🚨 Gejala Masalah</h3>
            <ul>
              <li>Form tidak tersimpan setelah klik submit</li>
              <li>Muncul error "Failed to save form"</li>
              <li>Data hilang setelah refresh halaman</li>
              <li>Loading indicator terus berjalan</li>
            </ul>
            
            <h3>🔍 Penyebab Umum</h3>
            <ol>
              <li><strong>Validasi form gagal</strong> - Field required tidak diisi</li>
              <li><strong>Session timeout</strong> - User login sudah expired</li>
              <li><strong>Database connection error</strong> - Koneksi ke database terputus</li>
              <li><strong>File upload terlalu besar</strong> - Ukuran file melebihi limit</li>
              <li><strong>CSRF token expired</strong> - Security token tidak valid</li>
            </ol>
            
            <h3>🛠️ Solusi Step-by-Step</h3>
            
            <h4>1. Cek Validasi Form</h4>
            <pre><code>// Check required fields
const requiredFields = document.querySelectorAll('[required]');
requiredFields.forEach(field => {
  if (!field.value) {
    console.log('Missing required field:', field.name);
    field.style.border = '2px solid red';
  }
});
</code></pre>
            
            <h4>2. Verifikasi Session Status</h4>
            <pre><code>// Verify user session
fetch('/api/check-session')
  .then(response => response.json())
  .then(data => {
    if (!data.valid) {
      alert('Session expired. Redirecting to login...');
      window.location.href = '/login';
    }
  })
  .catch(error => console.error('Session check failed:', error));
</code></pre>
            
            <h4>3. Test Database Connection</h4>
            <pre><code># Database health check
mysql -u username -p -h localhost -e "SELECT 1 as test_connection"

# Check connection pool
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Connections';
</code></pre>
            
            <h4>4. Validate File Upload Size</h4>
            <pre><code>// Check file size before upload
const fileInput = document.getElementById('fileUpload');
const maxSize = 5 * 1024 * 1024; // 5MB

fileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file && file.size > maxSize) {
    alert('File terlalu besar. Maksimal 5MB');
    e.target.value = '';
    return false;
  }
});
</code></pre>
            
            <h4>5. CSRF Token Refresh</h4>
            <pre><code>// Refresh CSRF token
fetch('/api/csrf-token')
  .then(response => response.json())
  .then(data => {
    document.querySelector('meta[name="csrf-token"]')
      .setAttribute('content', data.token);
  });
</code></pre>
            
            <div class="alert alert-info">
              <h4>💡 Tips Pencegahan</h4>
              <ul>
                <li>Selalu simpan draft secara berkala (auto-save)</li>
                <li>Gunakan browser yang update (Chrome 90+)</li>
                <li>Clear cache browser secara rutin</li>
                <li>Pastikan koneksi internet stabil</li>
                <li>Implementasikan retry mechanism untuk form submission</li>
              </ul>
            </div>
            
            <div class="alert alert-warning">
              <h4>⚠️ Catatan Penting</h4>
              <p>Jika masalah terus berlanjut setelah mengikuti langkah-langkah di atas, 
              hubungi tim IT support dengan informasi:</p>
              <ul>
                <li>Browser dan versi yang digunakan</li>
                <li>Waktu terjadinya error</li>
                <li>Screenshot error message</li>
                <li>Data yang coba disimpan</li>
              </ul>
            </div>
          `,
          read_time: 8,
          views: 156,
          tags: ["troubleshooting", "form", "template", "sicantik", "save-error"]
        },
        {
          id: 2,
          category_id: 10,
          title: "Mengatasi Masalah Login Authentication",
          author: "admin",
          updated_at: "2025-09-18T15:30:00Z",
          updated_by: "admin", 
          created_at: "2025-09-10T09:00:00Z",
          created_by: "admin",
          content: `
            <h2>Troubleshooting Login Authentication - SiCantik 2025</h2>
            <p>Panduan lengkap mengatasi masalah login dan authentication pada SiCantik 2025.</p>
            
            <h3>🔐 Jenis Masalah Login</h3>
            <ul>
              <li>Username/password tidak diterima</li>
              <li>Error "Invalid credentials"</li>
              <li>Login berhasil tapi langsung logout</li>
              <li>Session timeout terlalu cepat</li>
              <li>Captcha tidak muncul atau error</li>
            </ul>
            
            <h3>🔧 Langkah Troubleshooting</h3>
            
            <h4>1. Verifikasi Kredensial Dasar</h4>
            <ol>
              <li>Pastikan username dan password benar</li>
              <li>Cek CAPS LOCK tidak aktif</li>
              <li>Perhatikan case sensitivity pada password</li>
              <li>Coba copy-paste password untuk memastikan</li>
            </ol>
            
            <h4>2. Cek Status User di Database</h4>
            <pre><code>-- Query untuk cek status user
SELECT 
  username, 
  status, 
  last_login, 
  failed_attempts,
  locked_until
FROM users 
WHERE username = 'nama_user';

-- Reset failed attempts jika perlu
UPDATE users 
SET failed_attempts = 0, locked_until = NULL 
WHERE username = 'nama_user';
</code></pre>
            
            <h4>3. Konfigurasi Session PHP</h4>
            <pre><code>// session_config.php
ini_set('session.gc_maxlifetime', 7200); // 2 hours
ini_set('session.cookie_lifetime', 7200);
ini_set('session.cookie_secure', 1); // HTTPS only
ini_set('session.cookie_httponly', 1); // Prevent XSS

session_start();

// Check session health
if (!isset($_SESSION['user_id'])) {
    header('Location: /login');
    exit();
}
</code></pre>
            
            <h4>4. Clear Browser Data</h4>
            <ul>
              <li>Clear cookies untuk domain aplikasi</li>
              <li>Clear local storage dan session storage</li>
              <li>Disable browser extensions</li>
              <li>Try incognito/private mode</li>
              <li>Restart browser completely</li>
            </ul>
            
            <h4>5. Troubleshoot LDAP/Active Directory</h4>
            <pre><code># Test LDAP connection
ldapsearch -x -H ldap://your-domain-controller.com \
  -D "CN=service-account,OU=Service Accounts,DC=domain,DC=com" \
  -W -b "DC=domain,DC=com" \
  "(sAMAccountName=username)"

# Check LDAP logs
tail -f /var/log/auth.log | grep ldap
</code></pre>
            
            <div class="alert alert-danger">
              <h4>🚨 Security Alert</h4>
              <p>Jika terjadi multiple failed login attempts:</p>
              <ul>
                <li>Account akan ter-lock otomatis selama 30 menit</li>
                <li>Check log security untuk potential brute force attack</li>
                <li>Implementasikan rate limiting dan captcha</li>
                <li>Monitor suspicious IP addresses</li>
              </ul>
            </div>
            
            <div class="alert alert-info">
              <h4>📞 Kontak Support</h4>
              <p>Jika masalah persisten, hubungi:</p>
              <ul>
                <li><strong>IT Helpdesk:</strong> ext. 1234</li>
                <li><strong>Email:</strong> it-support@sicantik.go.id</li>
                <li><strong>Admin System:</strong> admin@sicantik.go.id</li>
              </ul>
            </div>
          `,
          read_time: 12,
          views: 289,
          tags: ["authentication", "login", "security", "sicantik", "ldap"]
        },
        {
          id: 3,
          category_id: 5,
          title: "Mengatasi Form Validation Error",
          author: "developer",
          updated_at: "2025-09-19T14:20:00Z",
          updated_by: "developer",
          created_at: "2025-09-12T11:30:00Z",
          created_by: "developer",
          content: `
            <h2>Form Validation Error - SiCantik 2025</h2>
            <p>Panduan mengatasi berbagai jenis error validasi form pada SiCantik 2025.</p>
            
            <h3>⚠️ Jenis Validation Error</h3>
            <ul>
              <li>Required field validation</li>
              <li>Format email/phone tidak valid</li>
              <li>Date range validation error</li>
              <li>File type restriction</li>
              <li>Custom business rule validation</li>
            </ul>
            
            <h3>🛠️ Solusi Berdasarkan Jenis Error</h3>
            
            <h4>1. Required Field Validation</h4>
            <pre><code>// Client-side validation
function validateRequiredFields() {
  const requiredFields = document.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      showFieldError(field, 'Field ini wajib diisi');
      isValid = false;
    } else {
      clearFieldError(field);
    }
  });
  
  return isValid;
}

function showFieldError(field, message) {
  field.classList.add('error');
  const errorDiv = field.parentNode.querySelector('.error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
  }
}
</code></pre>
            
            <h4>2. Email & Phone Validation</h4>
            <pre><code>// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  if (!emailRegex.test(email)) {
    return 'Format email tidak valid';
  }
  return null;
}

// Phone validation (Indonesia format)
const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;

function validatePhone(phone) {
  if (!phoneRegex.test(phone)) {
    return 'Format nomor telepon tidak valid (contoh: 081234567890)';
  }
  return null;
}
</code></pre>
            
            <h4>3. Date Range Validation</h4>
            <pre><code>function validateDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  if (start > end) {
    return 'Tanggal mulai tidak boleh lebih dari tanggal selesai';
  }
  
  if (start < now) {
    return 'Tanggal mulai tidak boleh kurang dari hari ini';
  }
  
  return null;
}
</code></pre>
            
            <h4>4. File Upload Validation</h4>
            <pre><code>function validateFileUpload(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxSize = 2 * 1024 * 1024; // 2MB
  
  if (!allowedTypes.includes(file.type)) {
    return 'Tipe file tidak diizinkan. Gunakan JPG, PNG, atau PDF';
  }
  
  if (file.size > maxSize) {
    return 'Ukuran file maksimal 2MB';
  }
  
  return null;
}
</code></pre>
            
            <div class="alert alert-success">
              <h4>✅ Best Practices</h4>
              <ul>
                <li>Implementasikan real-time validation</li>
                <li>Berikan error message yang jelas dan spesifik</li>
                <li>Gunakan consistent validation di client dan server</li>
                <li>Highlight field yang error dengan visual indicator</li>
                <li>Provide contoh format yang benar</li>
              </ul>
            </div>
          `,
          read_time: 6,
          views: 134,
          tags: ["validation", "form", "javascript", "sicantik", "error-handling"]
        },
        {
          id: 4,
          category_id: 7,
          title: "Payment Gateway Error Resolution",
          author: "finance_admin",
          updated_at: "2025-09-17T09:15:00Z",
          updated_by: "finance_admin",
          created_at: "2025-09-08T16:45:00Z",
          created_by: "finance_admin",
          content: `
            <h2>Payment Gateway Error - SiCantik 2025</h2>
            <p>Panduan mengatasi masalah payment gateway dan transaction processing.</p>
            
            <h3>💳 Jenis Payment Error</h3>
            <ul>
              <li>Gateway timeout error</li>
              <li>Insufficient funds</li>
              <li>Card declined</li>
              <li>Invalid merchant configuration</li>
              <li>Network connectivity issues</li>
            </ul>
            
            <h3>🔧 Troubleshooting Steps</h3>
            
            <h4>1. Check Gateway Status</h4>
            <pre><code>// Test gateway connectivity
curl -X POST https://api.payment-gateway.com/status \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"

// Response should be:
{
  "status": "operational",
  "timestamp": "2025-09-20T10:00:00Z"
}
</code></pre>
            
            <h4>2. Validate Transaction Data</h4>
            <pre><code>function validatePaymentData(data) {
  const errors = [];
  
  // Amount validation
  if (!data.amount || data.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  
  // Currency validation
  if (!data.currency || data.currency !== 'IDR') {
    errors.push('Invalid currency. Only IDR supported');
  }
  
  // Card validation
  if (!data.card_number || data.card_number.length < 13) {
    errors.push('Invalid card number');
  }
  
  return errors;
}
</code></pre>
            
            <h4>3. Implement Retry Logic</h4>
            <pre><code>async function processPayment(paymentData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${getAuthToken()}\`
        },
        body: JSON.stringify(paymentData)
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      if (response.status === 400) {
        // Client error, don't retry
        throw new Error('Invalid payment data');
      }
      
    } catch (error) {
      console.log(\`Payment attempt \${attempt} failed:, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}
</code></pre>
            
            <div class="alert alert-warning">
              <h4>⚠️ Error Code Reference</h4>
              <ul>
                <li><code>PG001</code> - Gateway timeout (retry after 30 seconds)</li>
                <li><code>PG002</code> - Insufficient funds (inform user)</li>
                <li><code>PG003</code> - Card declined (check with bank)</li>
                <li><code>PG004</code> - Invalid merchant ID (contact support)</li>
                <li><code>PG005</code> - Transaction limit exceeded</li>
              </ul>
            </div>
          `,
          read_time: 10,
          views: 87,
          tags: ["payment", "gateway", "transaction", "error", "finance"]
        },
        {
          id: 5,
          category_id: 13,
          title: "API Integration Troubleshooting",
          author: "system_admin",
          updated_at: "2025-09-16T13:40:00Z",
          updated_by: "system_admin",
          created_at: "2025-09-05T10:20:00Z",
          created_by: "system_admin",
          content: `
            <h2>API Integration Issues - SiCantik 2025</h2>
            <p>Panduan troubleshooting untuk masalah integrasi API eksternal.</p>
            
            <h3>🔌 Common API Issues</h3>
            <ul>
              <li>Authentication failures</li>
              <li>Rate limit exceeded</li>
              <li>Endpoint not found (404)</li>
              <li>Request timeout</li>
              <li>Invalid response format</li>
            </ul>
            
            <h3>🛠️ Debugging Steps</h3>
            
            <h4>1. Check API Credentials</h4>
            <pre><code>// Test API authentication
const testAuth = async () => {
  try {
    const response = await fetch('https://api.external-service.com/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: process.env.API_KEY,
        secret: process.env.API_SECRET
      })
    });
    
    if (response.status === 401) {
      console.error('Invalid credentials');
      return false;
    }
    
    const data = await response.json();
    console.log('Auth successful:', data);
    return true;
    
  } catch (error) {
    console.error('Auth failed:', error);
    return false;
  }
};
</code></pre>
            
            <h4>2. Monitor Rate Limits</h4>
            <pre><code>class APIRateLimiter {
  constructor(requestsPerMinute = 60) {
    this.requestsPerMinute = requestsPerMinute;
    this.requests = [];
  }
  
  async canMakeRequest() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove old requests
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    
    if (this.requests.length >= this.requestsPerMinute) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = oldestRequest + 60000 - now;
      
      console.log(\`Rate limit hit. Waiting \${waitTime}ms\`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
    return true;
  }
}
</code></pre>
            
            <h4>3. Implement Circuit Breaker</h4>
            <pre><code>class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }
  
  async call(apiFunction) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await apiFunction();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
</code></pre>
            
            <div class="alert alert-info">
              <h4>📊 Monitoring & Logging</h4>
              <ul>
                <li>Log semua API request/response</li>
                <li>Monitor response time dan error rate</li>
                <li>Set up alerting untuk API failures</li>
                <li>Implement health check endpoints</li>
              </ul>
            </div>
          `,
          read_time: 15,
          views: 203,
          tags: ["api", "integration", "monitoring", "debugging", "system"]
        }
      ]
    },
    {
      app_id: 2,
      name: "SIMPEG Enterprise",
      category_list: [
        {
          id: 20,
          name: "User Management",
          children: [
            {
              id: 21,
              name: "Employee Registration",
              children: []
            },
            {
              id: 22,
              name: "Role & Permissions",
              children: []
            }
          ]
        },
        {
          id: 23,
          name: "Payroll System",
          children: [
            {
              id: 24,
              name: "Salary Calculation",
              children: []
            },
            {
              id: 25,
              name: "Tax Processing",
              children: []
            }
          ]
        },
        {
          id: 26,
          name: "Reporting",
          children: [
            {
              id: 27,
              name: "Monthly Reports",
              children: []
            },
            {
              id: 28,
              name: "Analytics Dashboard",
              children: []
            }
          ]
        }
      ],
      article_list: [
        {
          id: 10,
          category_id: 21,
          title: "Panduan Registrasi Employee Baru",
          author: "hr_admin",
          updated_at: "2025-09-19T08:30:00Z",
          updated_by: "hr_admin",
          created_at: "2025-09-01T14:15:00Z",
          created_by: "hr_admin",
          content: `
            <h2>Employee Registration - SIMPEG Enterprise</h2>
            <p>Panduan lengkap untuk mendaftarkan employee baru dalam sistem SIMPEG.</p>
            
            <h3>📝 Persyaratan Registrasi</h3>
            <ul>
              <li>Data personal lengkap (KTP, NPWP)</li>
              <li>Foto formal 4x6</li>
              <li>CV dan dokumen pendukung</li>
              <li>Kontrak kerja yang sudah ditandatangani</li>
            </ul>
            
            <h3>⚙️ Langkah Registrasi</h3>
            <ol>
              <li>Login sebagai HR Admin</li>
              <li>Masuk ke menu "Employee Management"</li>
              <li>Klik "Add New Employee"</li>
              <li>Isi form registrasi lengkap</li>
              <li>Upload dokumen pendukung</li>
              <li>Verify data dan submit</li>
            </ol>
            
            <div class="alert alert-warning">
              <h4>⚠️ Validasi Data</h4>
              <p>Pastikan semua data sudah benar sebelum submit, karena beberapa field tidak bisa diubah setelah approval.</p>
            </div>
          `,
          read_time: 5,
          views: 145,
          tags: ["employee", "registration", "hr", "simpeg"]
        },
        {
          id: 11,
          category_id: 24,
          title: "Troubleshooting Salary Calculation Error",
          author: "finance_admin",
          updated_at: "2025-09-18T16:20:00Z",
          updated_by: "finance_admin",
          created_at: "2025-09-03T09:30:00Z",
          created_by: "finance_admin",
          content: `
            <h2>Salary Calculation Issues - SIMPEG</h2>
            <p>Panduan mengatasi masalah perhitungan gaji pada sistem SIMPEG Enterprise.</p>
            
            <h3>🧮 Common Calculation Errors</h3>
            <ul>
              <li>Overtime calculation mismatch</li>
              <li>Tax deduction incorrect</li>
              <li>Allowance not included</li>
              <li>Proration error for new employees</li>
            </ul>
            
            <h3>🔧 Troubleshooting Steps</h3>
            <h4>1. Verify Master Data</h4>
            <pre><code>-- Check employee salary configuration
SELECT 
  employee_id,
  basic_salary,
  allowances,
  tax_rate,
  effective_date
FROM salary_config 
WHERE employee_id = 'EMP001'
ORDER BY effective_date DESC;
</code></pre>
            
            <h4>2. Recalculate Manually</h4>
            <pre><code>-- Manual salary calculation query
SELECT 
  e.employee_id,
  e.name,
  sc.basic_salary,
  (SELECT SUM(amount) FROM allowances WHERE employee_id = e.employee_id) as total_allowances,
  (SELECT SUM(hours * rate) FROM overtime WHERE employee_id = e.employee_id AND month = '2025-09') as overtime_pay,
  (sc.basic_salary * 0.15) as tax_deduction
FROM employees e
JOIN salary_config sc ON e.employee_id = sc.employee_id
WHERE e.employee_id = 'EMP001';
</code></pre>
            
            <div class="alert alert-info">
              <h4>💡 Prevention Tips</h4>
              <ul>
                <li>Regular audit of salary master data</li>
                <li>Automated validation rules</li>
                <li>Monthly reconciliation process</li>
              </ul>
            </div>
          `,
          read_time: 8,
          views: 98,
          tags: ["salary", "calculation", "payroll", "finance", "troubleshooting"]
        }
      ]
    },
    {
      app_id: 3,
      name: "E-Office Portal",
      category_list: [
        {
          id: 30,
          name: "Document Management",
          children: [
            {
              id: 31,
              name: "File Upload",
              children: []
            },
            {
              id: 32,
              name: "Document Approval",
              children: []
            },
            {
              id: 33,
              name: "Archive & Storage",
              children: []
            }
          ]
        },
        {
          id: 34,
          name: "Workflow Management",
          children: [
            {
              id: 35,
              name: "Approval Process",
              children: []
            },
            {
              id: 36,
              name: "Task Assignment",
              children: []
            }
          ]
        }
      ],
      article_list: [
        {
          id: 20,
          category_id: 31,
          title: "File Upload Issues Resolution",
          author: "system_admin",
          updated_at: "2025-09-20T11:45:00Z",
          updated_by: "system_admin",
          created_at: "2025-09-14T13:20:00Z",
          created_by: "system_admin",
          content: `
            <h2>File Upload Troubleshooting - E-Office</h2>
            <p>Panduan mengatasi masalah upload file pada E-Office Portal.</p>
            
            <h3>📁 Common Upload Issues</h3>
            <ul>
              <li>File size too large</li>
              <li>Unsupported file format</li>
              <li>Upload timeout</li>
              <li>Corrupted file detection</li>
              <li>Network interruption</li>
            </ul>
            
            <h3>🛠️ Solutions</h3>
            
            <h4>1. Check File Size Limits</h4>
            <pre><code>// Client-side file size validation
function validateFileSize(file, maxSizeMB = 10) {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  
  if (file.size > maxSize) {
    alert(\`File terlalu besar. Maksimal \${maxSizeMB}MB\`);
    return false;
  }
  return true;
}

// Server-side PHP configuration
// php.ini settings:
// upload_max_filesize = 10M
// post_max_size = 10M
// max_execution_time = 300
</code></pre>
            
            <h4>2. Implement Chunked Upload</h4>
            <pre><code>class ChunkedUploader {
  constructor(file, chunkSize = 1024 * 1024) { // 1MB chunks
    this.file = file;
    this.chunkSize = chunkSize;
    this.totalChunks = Math.ceil(file.size / chunkSize);
    this.currentChunk = 0;
  }
  
  async uploadChunk() {
    const start = this.currentChunk * this.chunkSize;
    const end = Math.min(start + this.chunkSize, this.file.size);
    const chunk = this.file.slice(start, end);
    
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', this.currentChunk);
    formData.append('totalChunks', this.totalChunks);
    formData.append('fileName', this.file.name);
    
    const response = await fetch('/api/upload/chunk', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      this.currentChunk++;
      return this.currentChunk < this.totalChunks;
    }
    
    throw new Error('Chunk upload failed');
  }
  
  async upload() {
    while (this.currentChunk < this.totalChunks) {
      const hasMoreChunks = await this.uploadChunk();
      if (!hasMoreChunks) break;
      
      // Update progress
      const progress = (this.currentChunk / this.totalChunks) * 100;
      this.onProgress(progress);
    }
    
    // Finalize upload
    await this.finalizeUpload();
  }
}
</code></pre>
            
            <div class="alert alert-success">
              <h4>✅ Best Practices</h4>
              <ul>
                <li>Implement file type validation</li>
                <li>Use virus scanning for uploaded files</li>
                <li>Provide clear error messages</li>
                <li>Show upload progress indicator</li>
                <li>Enable resume capability for large files</li>
              </ul>
            </div>
          `,
          read_time: 12,
          views: 167,
          tags: ["upload", "file", "document", "eoffice", "troubleshooting"]
        }
      ]
    }
  ])

  // Computed properties
  const applications = computed((): Application[] => {
    const storeApps = dashboardStore.applications
    
    // Fallback data jika store kosong
    if (!storeApps || storeApps.length === 0) {
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
          icon: '👥',
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
          icon: '📄',
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
          icon: '📋',
          color: '#f59e0b'
        }
      ]
    }
    
    return storeApps
  })

  const selectedApp = computed((): Application | undefined => 
    applications.value.find((app: Application) => app.id === selectedAppId.value)
  )

  const isFavorite = computed((): boolean => {
    if (!selectedAppId.value || !activeMenuItem.value) return false
    const favoriteKey = `${selectedAppId.value}-${activeMenuItem.value}`
    return favorites.value.includes(favoriteKey)
  })

  const currentArticleData = computed((): Article => {
    if (!selectedAppId.value || !activeMenuItem.value || activeMenuItem.value === 'overview') {
      return {
        title: 'Select an Application',
        author: 'System',
        lastUpdated: 'N/A',
        readTime: 0,
        views: 0,
        tags: [],
        content: '<p>Please select an application and article to view content.</p>'
      }
    }

    // Parse activeMenuItem untuk mendapatkan categoryId dan articleId
    const match = activeMenuItem.value.match(/category-(\d+)-article-(\d+)/)
    if (!match) {
      return {
        title: 'No Content Available',
        author: 'System',
        lastUpdated: 'N/A',
        readTime: 0,
        views: 0,
        tags: [],
        content: '<p>No content available for this selection.</p>'
      }
    }

    const categoryId = parseInt(match[1])
    const articleId = parseInt(match[2])
    
    const article = getArticleById(selectedAppId.value, articleId)
    if (!article) {
      return {
        title: 'Article Not Found',
        author: 'System',
        lastUpdated: 'N/A',
        readTime: 0,
        views: 0,
        tags: [],
        content: '<p>Article not found.</p>'
      }
    }

    return {
      title: article.title,
      author: article.author,
      lastUpdated: new Date(article.updated_at).toLocaleDateString('id-ID'),
      readTime: article.read_time || 5,
      views: article.views || 0,
      tags: article.tags || [],
      content: article.content || '<p>No content available.</p>',
      appId: selectedAppId.value
    }
  })

  const previousArticle = computed(() => null)
  const nextArticle = computed(() => null)

  // Helper functions untuk nested categories
  const flattenCategories = (categories: Category[]): Category[] => {
    const result: Category[] = []
    
    const flatten = (cats: Category[], depth = 0) => {
      cats.forEach(cat => {
        result.push({ ...cat, depth } as Category & { depth: number })
        if (cat.children && cat.children.length > 0) {
          flatten(cat.children, depth + 1)
        }
      })
    }
    
    flatten(categories)
    return result
  }

  const getCategoriesForApp = (appId: number): Category[] => {
    const app = knowledgebaseApps.value.find(app => app.app_id === appId)
    return app ? app.category_list : []
  }

  const getArticlesForCategory = (appId: number, categoryId: number): KnowledgebaseArticle[] => {
    const app = knowledgebaseApps.value.find(app => app.app_id === appId)
    if (!app) return []
    
    return app.article_list.filter(article => article.category_id === categoryId)
  }

  const getCategoryById = (appId: number, categoryId: number): Category | undefined => {
    const app = knowledgebaseApps.value.find(app => app.app_id === appId)
    if (!app) return undefined
    
    const findCategory = (categories: Category[]): Category | undefined => {
      for (const cat of categories) {
        if (cat.id === categoryId) return cat
        if (cat.children && cat.children.length > 0) {
          const found = findCategory(cat.children)
          if (found) return found
        }
      }
      return undefined
    }
    
    return findCategory(app.category_list)
  }

  const getArticleById = (appId: number, articleId: number): KnowledgebaseArticle | undefined => {
    const app = knowledgebaseApps.value.find(app => app.app_id === appId)
    if (!app) return undefined
    
    return app.article_list.find(article => article.id === articleId)
  }

  const getCategoryArticleCount = (appId: number, categoryId: number): number => {
    return getArticlesForCategory(appId, categoryId).length
  }

  // Navigation functions
  const navigateToSection = (section: string, articleKey?: string) => {
    currentSection.value = section
    currentArticle.value = articleKey || ''
    activeMenuItem.value = articleKey ? `${section}-${articleKey}` : section
    updateBreadcrumb()
  }

  // Helper function untuk auto-expand kategori parent
  const autoExpandCategory = (categoryId: number) => {
    // Auto-expand kategori ini dan parent-nya jika ada
    expandedCategories.value.add(categoryId)
    
    // Cari parent kategori dan expand juga
    if (selectedAppId.value) {
      const app = knowledgebaseApps.value.find(app => app.app_id === selectedAppId.value)
      if (app) {
        const findParentCategory = (categories: Category[], targetId: number): number | null => {
          for (const category of categories) {
            if (category.children) {
              for (const child of category.children) {
                if (child.id === targetId) {
                  return category.id
                }
                const grandParent = findParentCategory(child.children || [], targetId)
                if (grandParent) {
                  return grandParent
                }
              }
            }
          }
          return null
        }
        
        const parentId = findParentCategory(app.category_list, categoryId)
        if (parentId) {
          expandedCategories.value.add(parentId)
          // Recursively expand parent categories
          autoExpandCategory(parentId)
        }
      }
    }
  }

  const toggleCategory = (categoryId: number) => {
    if (expandedCategories.value.has(categoryId)) {
      expandedCategories.value.delete(categoryId)
    } else {
      expandedCategories.value.add(categoryId)
    }
  }

  const navigateToArticle = (categoryId: number, articleId: number) => {
    const category = getCategoryById(selectedAppId.value!, categoryId)
    const article = getArticleById(selectedAppId.value!, articleId)
    
    if (category && article) {
      currentSection.value = category.name
      currentArticle.value = article.title
      activeMenuItem.value = `category-${categoryId}-article-${articleId}`
      updateBreadcrumb()
      
      // Auto-expand kategori yang berisi artikel ini
      autoExpandCategory(categoryId)
    }
  }

  const onArticleSelect = (categoryId: number, articleId: number) => {
    navigateToArticle(categoryId, articleId)
  }

  // Basic functions
  const toggleSidebar = (): void => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const onSearch = (query: string): void => {
    searchQuery.value = query
    console.log('Searching for:', query)
    ElMessage.info(`Searching for: ${query}`)
  }

  const onMenuSelect = (menuItem: string): void => {
    activeMenuItem.value = menuItem
    updateBreadcrumb()
  }

  const onAppChange = (appId: number | null): void => {
    selectedAppId.value = appId
    activeMenuItem.value = 'overview'
    if (appId) {
      console.log('Selected app:', applications.value.find(app => app.id === appId))
    }
  }

  const selectApp = (appId: number): void => {
    selectedAppId.value = appId
    activeMenuItem.value = 'overview'
  }

  const updateBreadcrumb = (): void => {
    // Update breadcrumb logic here
  }

  const toggleFavorite = (): void => {
    if (!selectedAppId.value || !activeMenuItem.value) return
    
    const favoriteKey = `${selectedAppId.value}-${activeMenuItem.value}`
    const index = favorites.value.indexOf(favoriteKey)
    
    if (index > -1) {
      favorites.value.splice(index, 1)
      ElMessage.success('Removed from favorites')
    } else {
      favorites.value.push(favoriteKey)
      ElMessage.success('Added to favorites')
    }
    
    // Save to localStorage
    localStorage.setItem('knowledgebase-favorites', JSON.stringify(favorites.value))
  }

  const shareCurrentPage = (): void => {
    if (navigator.share) {
      navigator.share({
        title: 'Knowledge Base',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      ElMessage.success('URL copied to clipboard')
    }
  }

  const submitFeedback = (type: string): void => {
    ElMessage.success(`Thank you for your feedback! (${type})`)
  }

  const getAppStatusType = (status: string | undefined): string => {
    switch (status) {
      case 'healthy': return 'success'
      case 'warning': return 'warning'
      case 'critical': return 'danger'
      default: return 'info'
    }
  }

  const getAppArticleCount = (appId: number): number => {
    const app = knowledgebaseApps.value.find(app => app.app_id === appId)
    return app ? app.article_list.length : 0
  }

  const getAppQuickLinks = (): QuickLink[] => {
    return [
      {
        id: 1,
        title: 'Getting Started',
        description: 'Basic setup and configuration',
        icon: Flag,
        section: 'getting-started'
      },
      {
        id: 2,
        title: 'Troubleshooting',
        description: 'Common issues and solutions',
        icon: Tools,
        section: 'troubleshooting'
      }
    ]
  }

  // Watch for app changes
  watch(selectedAppId, (newAppId: number | null) => {
    if (newAppId) {
      currentSection.value = ''
      currentArticle.value = ''
      activeMenuItem.value = 'overview'
      updateBreadcrumb()
    }
  })

  // Load favorites from localStorage
  onMounted(() => {
    const savedFavorites = localStorage.getItem('knowledgebase-favorites')
    if (savedFavorites) {
      try {
        favorites.value = JSON.parse(savedFavorites)
      } catch (error) {
        console.error('Failed to parse favorites from localStorage:', error)
      }
    }
  })

  const initializeKnowledgebase = async (): Promise<void> => {
    try {
      await dashboardStore.loadApplications()
      console.log('Applications loaded:', dashboardStore.applications)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      ElMessage.error('Failed to load applications')
    } finally {
      isLoadingApps.value = false
    }
    
    updateBreadcrumb()
  }

  return {
    // State
    sidebarCollapsed,
    searchQuery,
    activeMenuItem,
    currentSection,
    currentArticle,
    selectedAppId,
    favorites,
    isLoadingApps,
    expandedCategories,
    knowledgebaseApps,
    // Computed
    applications,
    selectedApp,
    isFavorite,
    currentArticleData,
    previousArticle,
    nextArticle,
    // Methods
    toggleSidebar,
    onSearch,
    onMenuSelect,
    onAppChange,
    selectApp,
    navigateToSection,
    navigateToArticle,
    onArticleSelect,
    toggleCategory,
    updateBreadcrumb,
    toggleFavorite,
    shareCurrentPage,
    submitFeedback,
    getAppStatusType,
    getAppArticleCount,
    getCategoryArticleCount,
    getCategoriesForApp,
    getArticlesForCategory,
    getCategoryById,
    getArticleById,
    getAppQuickLinks,
    initializeKnowledgebase
  }
}