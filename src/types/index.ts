export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'customer';
  preferences: {
    notifications: boolean;
    promotions: boolean;
    emailReminders: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // en jours
  features: string[];
  isActive: boolean;
  trialDays?: number;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: 'active' | 'expired' | 'cancelled' | 'trial' | 'suspended';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  trialEndDate?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  failureReason?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId?: string;
  type: 'renewal_reminder' | 'payment_failed' | 'subscription_expired' | 'welcome' | 'promotion' | 'trial_ending';
  title: string;
  message: string;
  isRead: boolean;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
}

export interface DashboardStats {
  totalCustomers: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  monthlyRevenue: number;
  churnRate: number;
  newSignups: number;
  expiringSubscriptions: number;
  failedPayments: number;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}