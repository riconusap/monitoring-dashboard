<template>
  <DashboardLayout>
    <template #monitoring>
      <div class="dashboard-content">
        <!-- Summary Statistics -->
        <el-row
          :gutter="24"
          class="summary-row"
        >
          <el-col
            :xs="12"
            :sm="6"
            :md="6"
            :lg="6"
          >
            <el-card class="summary-card">
              <el-statistic
                title="Total Applications"
                :value="applications.length"
                :prefix-icon="Cpu"
              />
            </el-card>
          </el-col>
          <el-col
            :xs="12"
            :sm="6"
            :md="6"
            :lg="6"
          >
            <el-card class="summary-card healthy">
              <el-statistic
                title="Healthy"
                :value="healthyCount"
                :prefix-icon="CircleCheckFilled"
                value-style="color: #67C23A"
              />
            </el-card>
          </el-col>
          <el-col
            :xs="12"
            :sm="6"
            :md="6"
            :lg="6"
          >
            <el-card class="summary-card warning">
              <el-statistic
                title="Warning"
                :value="warningCount"
                :prefix-icon="WarningFilled"
                value-style="color: #E6A23C"
              />
            </el-card>
          </el-col>
          <el-col
            :xs="12"
            :sm="6"
            :md="6"
            :lg="6"
          >
            <el-card class="summary-card critical">
              <el-statistic
                title="Critical"
                :value="criticalCount"
                :prefix-icon="CircleCloseFilled"
                value-style="color: #F56C6C"
              />
            </el-card>
          </el-col>
        </el-row>

        <!-- Filters and Actions -->
        <el-card
          class="filters-card"
          shadow="never"
        >
          <div class="filters-content">
            <div class="filter-group">
              <el-text class="filter-label">Filter by Status:</el-text>
              <el-radio-group
                v-model="statusFilter"
                size="default"
              >
                <el-radio-button label="all">
                  All ({{ applications.length }})
                </el-radio-button>
                <el-radio-button label="healthy">
                  <el-icon class="status-icon healthy">
                    <CircleCheckFilled />
                  </el-icon>
                  Healthy ({{ healthyCount }})
                </el-radio-button>
                <el-radio-button label="warning">
                  <el-icon class="status-icon warning">
                    <WarningFilled />
                  </el-icon>
                  Warning ({{ warningCount }})
                </el-radio-button>
                <el-radio-button label="critical">
                  <el-icon class="status-icon critical">
                    <CircleCloseFilled />
                  </el-icon>
                  Critical ({{ criticalCount }})
                </el-radio-button>
              </el-radio-group>
            </div>

            <div class="actions-group">
              <el-space>
                <el-button
                  type="primary"
                  :icon="Refresh"
                  @click="refreshAll"
                  :loading="isRefreshing"
                >
                  Refresh All
                </el-button>
                <el-button
                  :icon="Download"
                  @click="exportData"
                >
                  Export
                </el-button>
                <!-- <el-button :icon="Setting" @click="openSettings">
                  Settings
                </el-button> -->
              </el-space>
            </div>
          </div>
        </el-card>

        <!-- Applications Grid -->
        <div class="applications-grid">
          <el-card
            v-for="app in filteredApplications"
            :key="app.id"
            class="application-card"
            :class="`status-${app.status}`"
            shadow="hover"
          >
            <!-- App Header -->
            <template #header>
              <div class="app-header">
                <div class="app-info">
                  <el-avatar
                    :size="48"
                    class="app-icon"
                    :style="{ backgroundColor: app.color + '20', color: app.color }"
                  >
                    {{ app.icon }}
                  </el-avatar>
                  <div class="app-details">
                    <h3 class="app-name">{{ app.name }}</h3>
                    <el-text
                      class="app-description"
                      type="info"
                    >{{ app.description }}</el-text>
                    <div class="app-status">
                      <el-tag
                        :type="getTagType(app.status)"
                        size="small"
                        :icon="getStatusIcon(app.status)"
                      >
                        {{ getStatusText(app.status) }}
                      </el-tag>
                      <el-tag
                        size="small"
                        type="info"
                      >{{ app.category }}</el-tag>
                    </div>
                  </div>
                </div>

                <div class="app-actions">
                  <el-space>
                    <el-tooltip
                      content="Open Application"
                      placement="top"
                    >
                      <el-button
                        :icon="Link"
                        circle
                        size="small"
                        @click="openApplication(app.url)"
                      />
                    </el-tooltip>
                    <el-tooltip
                      content="Refresh Stats"
                      placement="top"
                    >
                      <el-button
                        :icon="Refresh"
                        circle
                        size="small"
                        @click="refreshAppStats(app.id)"
                      />
                    </el-tooltip>
                    <el-tooltip
                      content="View Details"
                      placement="top"
                    >
                      <el-button
                        :icon="View"
                        circle
                        size="small"
                        type="primary"
                        @click="viewDetails(app)"
                      />
                    </el-tooltip>
                  </el-space>
                </div>
              </div>
            </template>

            <!-- App Stats -->
            <div class="stats-section">
              <el-row :gutter="16">
                <el-col :span="8">
                  <div class="stat-item">
                    <el-icon
                      class="stat-icon users"
                      :size="20"
                    >
                      <User />
                    </el-icon>
                    <div class="stat-content">
                      <el-text class="stat-value">{{ app.stats.activeUsers }}</el-text>
                      <el-text
                        class="stat-label"
                        size="small"
                        type="info"
                      >Active Users</el-text>
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat-item">
                    <el-icon
                      class="stat-icon uptime"
                      :size="20"
                    >
                      <Timer />
                    </el-icon>
                    <div class="stat-content">
                      <el-text class="stat-value">{{ app.stats.uptime }}</el-text>
                      <el-text
                        class="stat-label"
                        size="small"
                        type="info"
                      >Uptime</el-text>
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat-item">
                    <el-icon
                      class="stat-icon tickets"
                      :size="20"
                    >
                      <Tickets />
                    </el-icon>
                    <div class="stat-content">
                      <el-text class="stat-value">{{ app.stats.tickets }}</el-text>
                      <el-text
                        class="stat-label"
                        size="small"
                        type="info"
                      >Open Tickets</el-text>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>

            <!-- App Footer -->
            <div class="app-footer">
              <el-space>
                <el-icon :size="14">
                  <Clock />
                </el-icon>
                <el-text
                  size="small"
                  type="info"
                >Last updated: {{ app.lastUpdated }}</el-text>
              </el-space>
            </div>
          </el-card>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredApplications.length === 0"
          class="empty-state"
        >
          <el-empty
            :image-size="120"
            description="No applications match the current filter"
          >
            <el-button
              type="primary"
              @click="statusFilter = 'all'"
            >
              Show All Applications
            </el-button>
          </el-empty>
        </div>
      </div>

      <!-- Application Details Drawer -->
      <el-drawer
        v-model="detailsDrawerVisible"
        :title="selectedApp?.name"
        size="50%"
        direction="rtl"
      >
        <div
          v-if="selectedApp"
          class="app-details-content"
        >
          <el-descriptions
            :column="1"
            border
          >
            <el-descriptions-item label="Application Name">
              {{ selectedApp.name }}
            </el-descriptions-item>
            <el-descriptions-item label="Description">
              {{ selectedApp.description }}
            </el-descriptions-item>
            <el-descriptions-item label="Status">
              <el-tag
                :type="getTagType(selectedApp.status)"
                :icon="getStatusIcon(selectedApp.status)"
              >
                {{ getStatusText(selectedApp.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Category">
              <el-tag type="info">{{ selectedApp.category }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="URL">
              <el-link
                :href="selectedApp.url"
                target="_blank"
                :icon="Link"
              >
                {{ selectedApp.url }}
              </el-link>
            </el-descriptions-item>
          </el-descriptions>

          <el-divider>Performance Metrics</el-divider>

          <el-row :gutter="16">
            <el-col :span="8">
              <el-card>
                <el-statistic
                  title="Active Users"
                  :value="selectedApp.stats.activeUsers"
                  :prefix-icon="User"
                />
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card>
                <el-statistic
                  title="Uptime"
                  :value="selectedApp.stats.uptime"
                  :prefix-icon="Timer"
                />
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card>
                <el-statistic
                  title="Open Tickets"
                  :value="selectedApp.stats.tickets"
                  :prefix-icon="Tickets"
                />
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-drawer>

      <!-- Application Monitoring Modal -->
      <el-dialog
        v-model="monitoringModalVisible"
        :title="`Monitoring - ${currentMonitoringApp?.name || 'Application'}`"
        :before-close="closeMonitoringModal"
        class="monitoring-modal"
        center
        :lock-scroll="true"
        fullscreen
      >
        <div
          v-if="currentMonitoringApp"
          class="monitoring-content"
        >
          <!-- Application Header -->
          <el-card
            class="app-header-card"
            shadow="never"
          >
            <div class="monitoring-header">
              <div class="app-info">
                <el-avatar
                  :size="64"
                  :style="{ backgroundColor: currentMonitoringApp.color + '20', color: currentMonitoringApp.color }"
                >
                  {{ currentMonitoringApp.icon }}
                </el-avatar>
                <div class="app-details">
                  <h2>{{ currentMonitoringApp.name }}</h2>
                  <el-text type="info">{{ currentMonitoringApp.description }}</el-text>
                  <div class="app-meta">
                    <el-tag
                      :type="getTagType(currentMonitoringApp.status)"
                      :icon="getStatusIcon(currentMonitoringApp.status)"
                    >
                      {{ getStatusText(currentMonitoringApp.status) }}
                    </el-tag>
                    <el-tag type="info">{{ currentMonitoringApp.category }}</el-tag>
                    <el-text
                      size="small"
                      type="info"
                    >
                      <el-icon>
                        <Clock />
                      </el-icon>
                      Last updated: {{ getCurrentTime() }}
                    </el-text>
                  </div>
                </div>
              </div>
              <div class="monitoring-actions">
                <el-space>
                  <el-button
                    type="primary"
                    :icon="Link"
                    @click="openInNewTab"
                  >
                    Open in New Tab
                  </el-button>
                  <el-button
                    :icon="Refresh"
                    @click="refreshMonitoring"
                    :loading="isMonitoringRefreshing"
                  >
                    Refresh
                  </el-button>
                  <el-button
                    :icon="Download"
                    @click="exportMonitoringData"
                  >
                    Export Data
                  </el-button>
                </el-space>
              </div>
            </div>
          </el-card>

          <!-- Real-time Stats -->
          <el-row
            :gutter="24"
            class="stats-row"
          >
            <el-col
              :xs="24"
              :sm="12"
              :md="6"
            >
              <el-card class="stat-card">
                <el-statistic
                  title="Active Users"
                  :value="currentMonitoringApp.stats.activeUsers"
                  :value-style="{ color: '#3f8600' }"
                  :prefix-icon="User"
                >
                  <template #suffix>
                    <span class="stat-change positive">+12%</span>
                  </template>
                </el-statistic>
              </el-card>
            </el-col>
            <el-col
              :xs="24"
              :sm="12"
              :md="6"
            >
              <el-card class="stat-card">
                <el-statistic
                  title="Response Time"
                  :value="245"
                  suffix="ms"
                  :value-style="{ color: '#cf1322' }"
                  :prefix-icon="Timer"
                >
                  <template #suffix>
                    <span class="stat-change negative">+8%</span>
                  </template>
                </el-statistic>
              </el-card>
            </el-col>
            <el-col
              :xs="24"
              :sm="12"
              :md="6"
            >
              <el-card class="stat-card">
                <el-statistic
                  title="Uptime"
                  :value="currentMonitoringApp.stats.uptime"
                  :value-style="{ color: '#3f8600' }"
                  :prefix-icon="CircleCheckFilled"
                />
              </el-card>
            </el-col>
            <el-col
              :xs="24"
              :sm="12"
              :md="6"
            >
              <el-card class="stat-card">
                <el-statistic
                  title="Open Issues"
                  :value="currentMonitoringApp.stats.tickets"
                  :value-style="{ color: '#cf1322' }"
                  :prefix-icon="WarningFilled"
                />
              </el-card>
            </el-col>
          </el-row>

          <!-- Application iframe -->
          <el-card class="monitoring-iframe-card">
            <template #header>
              <div class="iframe-header">
                <el-text class="iframe-title">Application Monitor</el-text>
                <div class="iframe-controls">
                  <el-button-group size="small">
                    <el-button
                      :icon="Refresh"
                      @click="refreshIframe"
                    >Refresh</el-button>
                    <el-button
                      :icon="View"
                      @click="toggleFullscreen"
                    >Fullscreen</el-button>
                  </el-button-group>
                </div>
              </div>
            </template>

            <div
              class="iframe-container"
              :class="{ 'fullscreen': isFullscreen }"
            >
              <div
                v-if="isIframeLoading"
                class="iframe-loading"
              >
                <el-loading-icon class="is-loading" />
                <el-text>Loading application...</el-text>
              </div>
              <iframe
                ref="monitoringIframe"
                :src="currentMonitoringApp.url"
                frameborder="0"
                class="monitoring-iframe"
                @load="onIframeLoad"
                @error="onIframeError"
              ></iframe>
            </div>
          </el-card>

          <!-- Performance Metrics -->
          <el-card class="metrics-card">
            <template #header>
              <el-text class="section-title">Performance Metrics</el-text>
            </template>

            <el-row :gutter="16">
              <el-col :span="12">
                <div class="metric-item">
                  <div class="metric-header">
                    <el-icon class="metric-icon">
                      <Cpu />
                    </el-icon>
                    <span>CPU Usage</span>
                  </div>
                  <el-progress
                    :percentage="75"
                    :color="getProgressColor(75)"
                  />
                </div>
              </el-col>
              <el-col :span="12">
                <div class="metric-item">
                  <div class="metric-header">
                    <el-icon class="metric-icon">
                      <Monitor />
                    </el-icon>
                    <span>Memory Usage</span>
                  </div>
                  <el-progress
                    :percentage="45"
                    :color="getProgressColor(45)"
                  />
                </div>
              </el-col>
            </el-row>

            <el-row
              :gutter="16"
              style="margin-top: 16px;"
            >
              <el-col :span="12">
                <div class="metric-item">
                  <div class="metric-header">
                    <el-icon class="metric-icon">
                      <Connection />
                    </el-icon>
                    <span>Network I/O</span>
                  </div>
                  <el-progress
                    :percentage="60"
                    :color="getProgressColor(60)"
                  />
                </div>
              </el-col>
              <el-col :span="12">
                <div class="metric-item">
                  <div class="metric-header">
                    <el-icon class="metric-icon">
                      <Document />
                    </el-icon>
                    <span>Disk Usage</span>
                  </div>
                  <el-progress
                    :percentage="30"
                    :color="getProgressColor(30)"
                  />
                </div>
              </el-col>
            </el-row>
          </el-card>
        </div>
      </el-dialog>
    </template>
  </DashboardLayout>
</template>

<script lang="ts">
import { ref, computed, defineComponent } from "vue";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import {
  Monitor,
  Bell,
  UserFilled,
  User,
  Setting,
  SwitchButton,
  Cpu,
  CircleCheckFilled,
  WarningFilled,
  CircleCloseFilled,
  Refresh,
  Download,
  Link,
  View,
  Timer,
  Tickets,
  Clock,
  Connection,
  Document,
  Reading,
  Search,
  Expand,
  Fold,
  House,
  Flag,
  Tools,
  QuestionFilled,
  Share,
  Calendar,
  Star
} from "@element-plus/icons-vue";
import DashboardLayout from "@/components/dashboard/DashboardLayout.vue";

interface AppStats {
  activeUsers: string;
  uptime: string;
  tickets: number;
}

interface Application {
  id: number;
  name: string;
  description: string;
  url: string;
  status: "healthy" | "warning" | "critical";
  category: string;
  icon: string;
  color: string;
  stats: AppStats;
  lastUpdated: string;
  hasApi?: boolean;
}

export default defineComponent({
  name: "DashboardView",
  components: {
    DashboardLayout,
    Monitor,
    Bell,
    UserFilled,
    User,
    Setting,
    SwitchButton,
    Cpu,
    CircleCheckFilled,
    WarningFilled,
    CircleCloseFilled,
    Refresh,
    Download,
    Link,
    View,
    Timer,
    Tickets,
    Clock,
    Connection,
    Document,
    Reading,
    Search,
    Expand,
    Fold,
    House,
    Flag,
    Tools,
    QuestionFilled,
    Share,
    Calendar,
    Star
  },
  setup() {
    // Reactive state
    const statusFilter = ref<string>("all");
    const isRefreshing = ref<boolean>(false);
    const detailsDrawerVisible = ref<boolean>(false);
    const selectedApp = ref<Application | null>(null);
    const applications = ref<Application[]>([
      {
        id: 1,
        name: "E-Commerce Platform",
        description:
          "Main e-commerce application handling customer orders and inventory",
        url: "https://siiteung.kabayan.id/",
        status: "healthy",
        category: "Business",
        icon: "🛒",
        color: "#3b82f6",
        stats: {
          activeUsers: "1,245",
          uptime: "99.9%",
          tickets: 3,
        },
        lastUpdated: "2 min ago",
        hasApi: true,
      },
      {
        id: 2,
        name: "CRM System",
        description: "Customer relationship management and sales tracking",
        url: "https://example.com/crm",
        status: "warning",
        category: "Sales",
        icon: "👥",
        color: "#f59e0b",
        stats: {
          activeUsers: "89",
          uptime: "98.5%",
          tickets: 7,
        },
        lastUpdated: "5 min ago",
        hasApi: true,
      },
      {
        id: 3,
        name: "Analytics Dashboard",
        description: "Business intelligence and reporting platform",
        url: "https://example.com/analytics",
        status: "healthy",
        category: "Analytics",
        icon: "📊",
        color: "#10b981",
        stats: {
          activeUsers: "156",
          uptime: "99.2%",
          tickets: 1,
        },
        lastUpdated: "1 min ago",
        hasApi: false,
      },
      {
        id: 4,
        name: "Payment Gateway",
        description: "Financial transactions processing and payment handling",
        url: "https://example.com/payments",
        status: "critical",
        category: "Finance",
        icon: "💳",
        color: "#ef4444",
        stats: {
          activeUsers: "2,103",
          uptime: "97.1%",
          tickets: 12,
        },
        lastUpdated: "30 sec ago",
        hasApi: true,
      },
    ]);

    // Monitoring Modal state
    const monitoringModalVisible = ref<boolean>(false);
    const currentMonitoringApp = ref<Application | null>(null);
    const isMonitoringRefreshing = ref<boolean>(false);
    const isIframeLoading = ref<boolean>(true);
    const isFullscreen = ref<boolean>(false);

    // Knowledge Base state
    const sidebarCollapsed = ref<boolean>(false);
    const searchQuery = ref<string>('');
    const activeMenuItem = ref<string>('overview');
    const currentSection = ref<string>('');
    const currentArticle = ref<string>('');
    const selectedAppId = ref<number | null>(null);
    const favorites = ref<string[]>([]);
    const isLoadingApps = ref<boolean>(false);

    // Knowledge Base applications (reuse the same data structure)
    const kbApplications = computed(() => applications.value);

    // Computed properties
    const filteredApplications = computed(() => {
      if (statusFilter.value === "all") {
        return applications.value;
      }
      return applications.value.filter(
        (app) => app.status === statusFilter.value
      );
    });

    const healthyCount = computed(() => {
      return applications.value.filter((app) => app.status === "healthy")
        .length;
    });

    const warningCount = computed(() => {
      return applications.value.filter((app) => app.status === "warning")
        .length;
    });

    const criticalCount = computed(() => {
      return applications.value.filter((app) => app.status === "critical")
        .length;
    });

    // Knowledge Base computed properties
    const selectedKbApp = computed(() => 
      kbApplications.value.find((app: Application) => app.id === selectedAppId.value)
    );

    const isFavorite = computed((): boolean => {
      if (!selectedAppId.value || !activeMenuItem.value) return false
      const favoriteKey = `${selectedAppId.value}-${activeMenuItem.value}`
      return favorites.value.includes(favoriteKey)
    });

    const currentArticleData = computed(() => {
      return {
        title: 'Sample Article',
        author: 'System',
        lastUpdated: 'Today',
        readTime: 5,
        views: 100,
        tags: ['sample'],
        content: '<p>This is a sample article content.</p>'
      }
    });

    // Methods
    const handleUserAction = (command: string) => {
      if (command === "logout") {
        logout();
      } else if (command === "profile") {
        ElMessage.info("Profile page coming soon!");
      } else if (command === "settings") {
        openSettings();
      }
    };

    const logout = () => {
      ElMessageBox.confirm(
        "Are you sure you want to logout?",
        "Confirm Logout",
        {
          confirmButtonText: "Yes, Logout",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      )
        .then(() => {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          ElMessage.success("Logged out successfully!");
          // Note: Router navigation would need to be handled by parent component or router composable
        })
        .catch(() => {
          ElMessage.info("Logout cancelled");
        });
    };

    const refreshAll = async () => {
      isRefreshing.value = true;
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        ElMessage.success("All applications refreshed successfully!");
      } catch (error) {
        ElMessage.error("Failed to refresh applications");
      } finally {
        isRefreshing.value = false;
      }
    };

    const refreshAppStats = async (appId: number) => {
      const loading = ElLoading.service({
        target: `.application-card:nth-child(${appId})`,
        text: "Refreshing...",
      });

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        ElMessage.success("Application stats refreshed!");
      } catch (error) {
        ElMessage.error("Failed to refresh stats");
      } finally {
        loading.close();
      }
    };

    const openApplication = (url: string) => {
      // Find the application by URL to get full details
      const app = applications.value.find((a) => a.url === url);
      if (app) {
        currentMonitoringApp.value = app;
        monitoringModalVisible.value = true;
        isIframeLoading.value = true;
        ElMessage.success(`Opening ${app.name} monitoring panel`);
      } else {
        ElMessage.error("Application not found");
      }
    };

    const viewDetails = (app: Application) => {
      selectedApp.value = app;
      detailsDrawerVisible.value = true;
    };

    const exportData = () => {
      ElMessage.info("Export functionality coming soon!");
    };

    const openSettings = () => {
      ElMessage.info("Settings panel coming soon!");
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case "healthy":
          return "Healthy";
        case "warning":
          return "Warning";
        case "critical":
          return "Critical";
        default:
          return "Unknown";
      }
    };

    const getTagType = (status: string) => {
      switch (status) {
        case "healthy":
          return "success";
        case "warning":
          return "warning";
        case "critical":
          return "danger";
        default:
          return "info";
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "healthy":
          return CircleCheckFilled;
        case "warning":
          return WarningFilled;
        case "critical":
          return CircleCloseFilled;
        default:
          return null;
      }
    };

    // Monitoring Modal Methods
    const closeMonitoringModal = () => {
      monitoringModalVisible.value = false;
      currentMonitoringApp.value = null;
      isIframeLoading.value = true;
      isFullscreen.value = false;
    };

    const openInNewTab = () => {
      if (currentMonitoringApp.value) {
        window.open(currentMonitoringApp.value.url, "_blank");
        ElMessage.info(`Opening ${currentMonitoringApp.value.name} in new tab`);
      }
    };

    const refreshMonitoring = () => {
      isMonitoringRefreshing.value = true;
      isIframeLoading.value = true;

      // Refresh iframe would need ref access
      setTimeout(() => {
        isMonitoringRefreshing.value = false;
        ElMessage.success("Monitoring data refreshed");
      }, 2000);
    };

    const exportMonitoringData = () => {
      ElMessage.info("Exporting monitoring data...");
      // Simulate export
      setTimeout(() => {
        ElMessage.success("Monitoring data exported successfully");
      }, 1500);
    };

    const refreshIframe = () => {
      isIframeLoading.value = true;
      // Refresh iframe would need ref access
    };

    const toggleFullscreen = () => {
      isFullscreen.value = !isFullscreen.value;
      if (isFullscreen.value) {
        ElMessage.info("Switched to fullscreen mode");
      } else {
        ElMessage.info("Exited fullscreen mode");
      }
    };

    const onIframeLoad = () => {
      isIframeLoading.value = false;
    };

    const onIframeError = () => {
      isIframeLoading.value = false;
      ElMessage.error("Failed to load application");
    };

    const getCurrentTime = () => {
      return new Date().toLocaleTimeString();
    };

    const getProgressColor = (percentage: number) => {
      if (percentage < 50) return "#67c23a";
      if (percentage < 80) return "#e6a23c";
      return "#f56c6c";
    };

    // Knowledge Base Methods
    const onTabChange = (tabName: string) => {
      console.log('Tab changed to:', tabName);
    };

    const toggleSidebar = (): void => {
      sidebarCollapsed.value = !sidebarCollapsed.value;
    };

    const onSearch = (): void => {
      console.log('Searching for:', searchQuery.value, 'in app:', selectedAppId.value);
    };

    const onMenuSelect = (menuItem: string): void => {
      activeMenuItem.value = menuItem;
    };

    const onAppChange = (appId: number): void => {
      selectedAppId.value = appId;
      activeMenuItem.value = 'overview';
    };

    const toggleFavorite = (): void => {
      if (!selectedAppId.value || !activeMenuItem.value) return;
      
      const favoriteKey = `${selectedAppId.value}-${activeMenuItem.value}`;
      const index = favorites.value.indexOf(favoriteKey);
      
      if (index > -1) {
        favorites.value.splice(index, 1);
        ElMessage.success('Removed from favorites');
      } else {
        favorites.value.push(favoriteKey);
        ElMessage.success('Added to favorites');
      }
    };

    const shareCurrentPage = (): void => {
      if (!selectedAppId.value || !activeMenuItem.value) return;
      
      const url = `${window.location.origin}/dashboard/knowledgebase`;
      navigator.clipboard.writeText(url);
      ElMessage.success('Page link copied to clipboard!');
    };

    const getAppStatusType = (status: string | undefined): string => {
      switch (status) {
        case 'healthy': return 'success';
        case 'warning': return 'warning'; 
        case 'critical': return 'danger';
        default: return 'info';
      }
    };

    return {
      // State
      statusFilter,
      isRefreshing,
      detailsDrawerVisible,
      selectedApp,
      applications,
      monitoringModalVisible,
      currentMonitoringApp,
      isMonitoringRefreshing,
      isIframeLoading,
      isFullscreen,
      // Computed
      filteredApplications,
      healthyCount,
      warningCount,
      criticalCount,
      // Methods
      handleUserAction,
      logout,
      refreshAll,
      refreshAppStats,
      openApplication,
      viewDetails,
      exportData,
      openSettings,
      getStatusText,
      getTagType,
      getStatusIcon,
      closeMonitoringModal,
      openInNewTab,
      refreshMonitoring,
      exportMonitoringData,
      refreshIframe,
      toggleFullscreen,
      onIframeLoad,
      onIframeError,
      getCurrentTime,
      getProgressColor,
      // Knowledge Base State
      sidebarCollapsed,
      searchQuery,
      activeMenuItem,
      currentSection,
      currentArticle,
      selectedAppId,
      favorites,
      isLoadingApps,
      kbApplications,
      selectedKbApp,
      isFavorite,
      currentArticleData,
      // Knowledge Base Methods
      onTabChange,
      toggleSidebar,
      onSearch,
      onMenuSelect,
      onAppChange,
      toggleFavorite,
      shareCurrentPage,
      getAppStatusType,
      // Icons
      Monitor,
      Bell,
      UserFilled,
      User,
      Setting,
      SwitchButton,
      Cpu,
      CircleCheckFilled,
      WarningFilled,
      CircleCloseFilled,
      Refresh,
      Download,
      Link,
      View,
      Timer,
      Tickets,
      Clock,
      Connection,
      Document,
      Reading,
      Search,
      Expand,
      Fold,
      House,
      Flag,
      Tools,
      QuestionFilled,
      Share,
      Calendar,
      Star
    };
  },
});
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: #f0f2f5;
}

.dashboard-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  color: #409eff;
}

.header-left h1 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dashboard-main {
  padding: 24px;
}

.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
}

.summary-row {
  margin-bottom: 24px;
}

.summary-card {
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
}

.summary-card.healthy :deep(.el-statistic__head) {
  color: #67c23a;
}

.summary-card.warning :deep(.el-statistic__head) {
  color: #e6a23c;
}

.summary-card.critical :deep(.el-statistic__head) {
  color: #f56c6c;
}

.filters-card {
  margin-bottom: 24px;
  border: none;
}

.filters-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 600;
  color: #303133;
}

.status-icon {
  margin-right: 4px;
}

.status-icon.healthy {
  color: #67c23a;
}

.status-icon.warning {
  color: #e6a23c;
}

.status-icon.critical {
  color: #f56c6c;
}

.actions-group {
  display: flex;
  align-items: center;
}

.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 24px;
}

.application-card {
  transition: all 0.3s ease;
}

.application-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.1);
}

.status-healthy {
  border-left: 4px solid #67c23a;
}

.status-warning {
  border-left: 4px solid #e6a23c;
}

.status-critical {
  border-left: 4px solid #f56c6c;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.app-info {
  display: flex;
  gap: 16px;
  flex: 1;
}

.app-icon {
  flex-shrink: 0;
}

.app-details {
  flex: 1;
  min-width: 0;
}

.app-name {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-description {
  margin-bottom: 12px;
  line-height: 1.4;
}

.app-status {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.app-actions {
  flex-shrink: 0;
}

.stats-section {
  margin: 16px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: #f0f2f5;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-icon.users {
  color: #409eff;
}

.stat-icon.uptime {
  color: #67c23a;
}

.stat-icon.tickets {
  color: #e6a23c;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  display: block;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.app-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: white;
  border-radius: 8px;
}

.app-details-content {
  padding: 16px 0;
}

:deep(.el-header) {
  padding: 0;
}

:deep(.el-main) {
  padding: 0;
}

:deep(.el-radio-group .el-radio-button__inner) {
  min-width: auto;
  padding: 8px 16px;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: 16px;
  }

  .header-content {
    padding: 0 16px;
    flex-direction: column;
    height: auto;
    padding-top: 16px;
    padding-bottom: 16px;
    gap: 16px;
  }

  .header-left {
    justify-content: center;
  }

  .header-left h1 {
    font-size: 18px;
    text-align: center;
  }

  .filters-content {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .applications-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .app-header {
    flex-direction: column;
    gap: 16px;
  }

  .app-actions {
    align-self: flex-end;
  }
}

@media (max-width: 1200px) {
  .applications-grid {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  }
}

/* Monitoring Modal Styles */
.monitoring-modal :deep(.el-dialog) {
  height: 90vh;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  margin: 5vh auto !important;
}

.monitoring-modal :deep(.el-dialog__header) {
  flex-shrink: 0;
  padding: 20px 20px 10px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.monitoring-modal :deep(.el-dialog__body) {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  max-height: calc(90vh - 120px);
  min-height: 0;
}

.monitoring-modal :deep(.el-dialog__body)::-webkit-scrollbar {
  width: 6px;
}

.monitoring-modal :deep(.el-dialog__body)::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 3px;
}

.monitoring-modal :deep(.el-dialog__body)::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.monitoring-modal :deep(.el-dialog__body)::-webkit-scrollbar-thumb:hover {
  background: #a8abb2;
}

.monitoring-content {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 100%;
  overflow: scroll;
  max-height: 90vh;
}

.app-header-card {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.monitoring-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  max-width: 100%;
}

.monitoring-header .app-info {
  display: flex;
  gap: 16px;
  flex: 1;
}

.monitoring-header .app-details h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.monitoring-header .app-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.stats-row {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.stat-card {
  height: 100%;
  min-height: 120px;
  max-height: 150px;
}

.stat-change {
  font-size: 12px;
  margin-left: 8px;
}

.stat-change.positive {
  color: #67c23a;
}

.stat-change.negative {
  color: #f56c6c;
}

.monitoring-iframe-card {
  margin-bottom: 20px;
  flex-shrink: 0;
  max-width: 100%;
  overflow: hidden;
}

.iframe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.iframe-title {
  font-size: 16px;
  font-weight: 600;
}

.iframe-container {
  position: relative;
  width: 100%;
  height: 350px;
  max-height: 350px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  transition: all 0.3s ease;
}

.iframe-container.fullscreen {
  height: 100vh;
  max-height: 100vh;
}

.iframe-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 10;
}

.monitoring-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.metrics-card {
  flex-shrink: 0;
  max-width: 100%;
}

.metrics-card .section-title {
  font-size: 16px;
  font-weight: 600;
}

.metric-item {
  margin-bottom: 16px;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.metric-icon {
  color: #409eff;
}

/* Responsive Modal */
@media (max-width: 768px) {
  .monitoring-modal :deep(.el-dialog) {
    width: 95% !important;
    height: 95vh;
    max-height: 95vh;
    margin: 2.5vh auto !important;
  }

  .monitoring-modal :deep(.el-dialog__body) {
    padding: 16px;
    max-height: calc(95vh - 120px);
  }

  .monitoring-content {
    gap: 16px;
  }

  .monitoring-header {
    flex-direction: column;
    gap: 16px;
  }

  .monitoring-actions {
    align-self: stretch;
  }

  .stats-row {
    margin-bottom: 16px;
  }

  .stats-row .el-col {
    margin-bottom: 16px;
  }

  .iframe-container {
    height: 200px;
    max-height: 200px;
  }

  .iframe-container.fullscreen {
    height: 100vh;
    max-height: 100vh;
  }

  .iframe-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .app-header-card,
  .monitoring-iframe-card,
  .metrics-card {
    margin-bottom: 16px;
  }
}

/* Knowledge Base Styles */
.gitbook-layout {
  display: flex;
  height: 100%;
  min-height: calc(100vh - 240px);
  background: #fafbfc;
}

.gitbook-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 10;
}

.gitbook-sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: #f8f9fa;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.book-icon {
  color: var(--el-color-primary);
}

.app-selector {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.app-select {
  width: 100%;
}

.app-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.app-info {
  display: flex;
  flex-direction: column;
}

.app-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.app-desc {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 2px;
}

.sidebar-search {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.search-input {
  width: 100%;
}

.sidebar-content {
  height: calc(100% - 200px);
  overflow-y: auto;
  padding: 8px 0;
}

.kb-menu {
  border: none;
  background: transparent;
}

.gitbook-main {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.gitbook-main.expanded {
  margin-left: -220px;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: #fafbfc;
}

.content-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.welcome-content {
  padding: 64px 32px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.welcome-header {
  margin-bottom: 48px;
}

.welcome-icon {
  color: var(--el-color-primary);
  margin-bottom: 24px;
}

.welcome-header h1 {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
}

.welcome-header p {
  font-size: 18px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.app-overview {
  padding: 32px;
  max-width: 1000px;
  margin: 0 auto;
}

.overview-header {
  margin-bottom: 32px;
}

.app-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.app-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0;
}

.app-status-tag {
  font-size: 14px;
  padding: 8px 16px;
}

.app-description {
  font-size: 18px;
  color: var(--el-text-color-regular);
  margin: 0;
  line-height: 1.6;
}

.article-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
}

.article-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.article-meta {
  display: flex;
  gap: 24px;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-body {
  font-size: 16px;
  line-height: 1.7;
  color: var(--el-text-color-primary);
  margin-bottom: 32px;
}

.no-app-selected {
  padding: 40px 20px;
  text-align: center;
}
</style>