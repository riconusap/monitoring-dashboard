// src/types/index.ts

export interface User {
    id: number;
    username: string;
    email: string;
    role?: string;
    lastLogin?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: User;
    expiresIn: number;
}

// Application definition
export interface Application {
    id: number;
    name: string;
    description: string;
    url: string;
    status: 'healthy' | 'warning' | 'critical' | 'down';
    lastChecked?: Date;
    responseTime?: number;
    hasApi?: boolean;
    category: string;
    icon?: string;
    color?: string;
}

export interface ConcurrentUsersData {
    count: number;
    timestamp: string;
}

export interface UptimeData {
    uptime: string;
    lastDown: string;
    timestamp: string;
}

export interface TicketData {
    total: number;
    open: number;
    closed: number;
    timestamp: string;
}

// Application specific stats
export interface ApplicationStats {
    applicationId: number;
    applicationName: string;
    concurrentUsers: ConcurrentUsersData;
    uptime: UptimeData;
    tickets: TicketData;
    status: 'healthy' | 'warning' | 'critical';
    lastUpdated: string;
}

export interface DashboardStats {
    applications: ApplicationStats[];
    summary: {
        totalApplications: number;
        healthyApps: number;
        warningApps: number;
        criticalApps: number;
        totalUsers: number;
        totalTickets: number;
    };
}

export interface FAQ {
    id: number;
    question: string;
    answer: string;
    category: string;
    createdAt: string;
    updatedAt?: string;
}

export interface APIResponse<T> {
    data: T;
    message?: string;
    status: number;
}

export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}