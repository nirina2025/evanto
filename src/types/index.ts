export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'customer';
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
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  trialEndDate?: Date;
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
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'renewal_reminder' | 'payment_failed' | 'subscription_expired' | 'welcome' | 'promotion';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  totalCustomers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  churnRate: number;
  newSignups: number;
  expiringSubscriptions: number;
}