import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DashboardStats, User, Subscription, Payment } from '../types';
import { Users, Crown, DollarSign, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    monthlyRevenue: 0,
    churnRate: 0,
    newSignups: 0,
    expiringSubscriptions: 0,
    failedPayments: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role === 'admin') {
      loadAdminDashboard();
    } else {
      loadCustomerDashboard();
    }
  }, [user]);

  const loadAdminDashboard = async () => {
    try {
      // Charger les statistiques
      const [usersSnapshot, subscriptionsSnapshot, paymentsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'customer'))),
        getDocs(collection(db, 'subscriptions')),
        getDocs(collection(db, 'payments'))
      ]);

      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const subscriptions = subscriptionsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Subscription[];
      const payments = paymentsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Payment[];

      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const trialSubscriptions = subscriptions.filter(s => s.status === 'trial').length;
      const monthlyRevenue = payments
        .filter(p => p.status === 'completed' && isCurrentMonth(p.createdAt))
        .reduce((sum, p) => sum + p.amount, 0);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newSignups = users.filter(u => u.createdAt && u.createdAt >= thirtyDaysAgo).length;

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const expiringSubscriptions = subscriptions.filter(s => 
        s.status === 'active' && s.endDate && s.endDate <= nextWeek
      ).length;

      const failedPayments = payments.filter(p => 
        p.status === 'failed' && isCurrentMonth(p.createdAt)
      ).length;

      setStats({
        totalCustomers: users.length,
        activeSubscriptions,
        trialSubscriptions,
        monthlyRevenue,
        churnRate: 0, // À calculer selon la logique métier
        newSignups,
        expiringSubscriptions,
        failedPayments
      });

      // Activité récente
      const recentSubs = subscriptions
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);
      
      setRecentActivity(recentSubs);

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDashboard = async () => {
    try {
      // Charger les données du client
      const [subscriptionsSnapshot, paymentsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'subscriptions'), where('userId', '==', user.id))),
        getDocs(query(collection(db, 'payments'), where('userId', '==', user.id), orderBy('createdAt', 'desc'), limit(5)))
      ]);

      const subscriptions = subscriptionsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Subscription[];

      const payments = paymentsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Payment[];

      setRecentActivity(payments);

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard client:', error);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentMonth = (date: Date) => {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user.role === 'customer') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bienvenue, {user.name}</h1>
          <p className="text-gray-600 mt-1">Gérez votre abonnement et vos préférences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Statut abonnement</p>
                <p className="text-2xl font-bold text-green-600">Actif</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Crown className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prochaine facturation</p>
                <p className="text-2xl font-bold text-gray-900">15 Jan</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Montant mensuel</p>
                <p className="text-2xl font-bold text-purple-600">29,99 €</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des paiements</h3>
          <div className="space-y-3">
            {recentActivity.map((payment: Payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{payment.amount} €</p>
                  <p className="text-sm text-gray-600">{payment.createdAt.toLocaleDateString('fr-FR')}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                  payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {payment.status === 'completed' ? 'Payé' :
                   payment.status === 'failed' ? 'Échec' : 'En attente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de votre plateforme</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Abonnements Actifs</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Crown className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Mensuels</p>
              <p className="text-2xl font-bold text-purple-600">{stats.monthlyRevenue.toLocaleString()} €</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nouveaux Clients</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.newSignups}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertes */}
      {(stats.expiringSubscriptions > 0 || stats.failedPayments > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.expiringSubscriptions > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Abonnements expirant</h3>
                  <p className="text-sm text-yellow-700">{stats.expiringSubscriptions} abonnements expirent dans les 7 prochains jours</p>
                </div>
              </div>
            </div>
          )}

          {stats.failedPayments > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Paiements échoués</h3>
                  <p className="text-sm text-red-700">{stats.failedPayments} paiements ont échoué ce mois-ci</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activité récente */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
        <div className="space-y-3">
          {recentActivity.map((subscription: Subscription) => (
            <div key={subscription.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Nouvel abonnement {subscription.planName}</p>
                <p className="text-sm text-gray-600">{subscription.createdAt.toLocaleDateString('fr-FR')}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                subscription.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {subscription.status === 'active' ? 'Actif' :
                 subscription.status === 'trial' ? 'Essai' : subscription.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};