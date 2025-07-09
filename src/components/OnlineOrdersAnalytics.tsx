import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Calendar, TrendingUp, Euro } from 'lucide-react';
import { useOnlineAnalytics } from '@/hooks/useOnlineAnalytics';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { OnlineOrdersStats } from './online-orders/OnlineOrdersStats';

export const OnlineOrdersAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('week');
  const { analyticsData, loading, error } = useOnlineAnalytics(selectedPeriod);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="text-center text-red-600">Erreur: {error}</div>
    );
  }

  const { totalRevenue, totalOrders, averageTicket, salesData, monthlyData, dishPopularity, timeSlotData, growthRate } = analyticsData;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Analyses – Commandes en ligne
          </h2>
          <p className="text-emerald-600">Indicateurs et rapports exclusivement basés sur les commandes en ligne.</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
            <SelectTrigger className="w-40 border-emerald-200">
              <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded flex items-center">
            <Download className="w-4 h-4 mr-2" /> Exporter
          </button>
        </div>
      </div>

      {/* KPI simples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Chiffre d'affaires</p>
                <p className="text-xl font-bold text-emerald-800">{totalRevenue.toFixed(0)} FCFA</p>
              </div>
              <div className="p-2 rounded-full bg-emerald-500">
                <Euro className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Commandes</p>
                <p className="text-xl font-bold text-emerald-800">{totalOrders}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-500/20">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Ticket moyen</p>
                <p className="text-xl font-bold text-emerald-800">{averageTicket.toFixed(0)} FCFA</p>
              </div>
              <div className="p-2 rounded-full bg-yellow-500/20">
                <TrendingUp className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats détaillées */}
      <OnlineOrdersStats
        totalOrders={totalOrders}
        pendingOrders={0}
        inProgressOrders={0}
        deliveredOrders={0}
        totalRevenue={totalRevenue}
      />

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventes quotidiennes */}
        <Card className="bg-white border-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-800">Évolution hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #10b981', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="ventes" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popularité des plats */}
        <Card className="bg-white border-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-800">Plats les plus populaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dishPopularity}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {dishPopularity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Évolution mensuelle et Affluence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-800">Évolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #10b981', borderRadius: '8px' }} />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-800">Affluence par créneaux</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeSlotData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="slot" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #10b981', borderRadius: '8px' }} />
                <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnlineOrdersAnalytics;
