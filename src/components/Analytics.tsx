import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Euro,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAnalytics } from '@/hooks/useAnalytics';

export const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  console.log('Période sélectionnée:', selectedPeriod);
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const { analyticsData, loading, error } = useAnalytics(selectedPeriod);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-emerald-600">Chargement des analyses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <p className="text-red-600">Erreur lors du chargement des analyses</p>
            <p className="text-sm text-red-500 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Analyses avancées
          </h2>
          <p className="text-emerald-600">Tableaux de bord et rapports détaillés</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48 border-emerald-200">
              <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-white border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Chiffre d'affaires</p>
                <p className="text-xl font-bold text-emerald-800">{analyticsData.totalRevenue.toFixed(0)} FCFA</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+{analyticsData.growthRate.toFixed(1)}%</span>
                </div>
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
                <p className="text-xl font-bold text-emerald-800">{analyticsData.totalOrders}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+8%</span>
                </div>
              </div>
              <div className="p-2 rounded-full bg-blue-500">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Ticket moyen</p>
                <p className="text-xl font-bold text-emerald-800">{analyticsData.averageTicket.toFixed(0)} FCFA</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+4%</span>
                </div>
              </div>
              <div className="p-2 rounded-full bg-teal-500">
                <Euro className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Satisfaction</p>
                <p className="text-xl font-bold text-emerald-800">{analyticsData.customerSatisfaction}/5</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+0.2</span>
                </div>
              </div>
              <div className="p-2 rounded-full bg-yellow-500">
                <Users className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Nouveaux clients</p>
                <p className="text-xl font-bold text-emerald-800">{analyticsData.newCustomers}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+15%</span>
                </div>
              </div>
              <div className="p-2 rounded-full bg-purple-500">
                <Users className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Croissance</p>
                <p className="text-xl font-bold text-emerald-800">{analyticsData.growthRate.toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+2%</span>
                </div>
              </div>
              <div className="p-2 rounded-full bg-green-500">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des ventes */}
        <Card className="bg-white border-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-800">Évolution hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f0fdf4', 
                    border: '1px solid #10b981',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    name === 'ventes' ? `${value} FCFA` : value,
                    name === 'ventes' ? 'Ventes' : 'Commandes'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="ventes" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition des plats populaires */}
        <Card className="bg-white border-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-800">Plats les plus populaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.dishPopularity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.dishPopularity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Évolution mensuelle */}
        <Card className="bg-white border-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-800">Évolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f0fdf4', 
                    border: '1px solid #10b981',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value} FCFA`, 'Revenus']}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Affluence par créneaux horaires */}
        <Card className="bg-white border-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-800">Affluence par créneaux</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.timeSlotData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="slot" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f0fdf4', 
                    border: '1px solid #10b981',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="orders" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights et recommandations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800">Insights de performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-emerald-700">
                <strong>Revenus totaux:</strong> {analyticsData.totalRevenue.toFixed(0)} FCFA sur la période
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-emerald-700">
                <strong>Commandes totales:</strong> {analyticsData.totalOrders} commandes traitées
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm text-emerald-700">
                <strong>Ticket moyen:</strong> {analyticsData.averageTicket.toFixed(0)} FCFA par commande
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p className="text-sm text-emerald-700">
                <strong>Croissance:</strong> +{analyticsData.growthRate.toFixed(1)}% par rapport à la période précédente
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Recommandations basées sur les données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-blue-700">
                Optimiser les créneaux horaires de forte affluence
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <p className="text-sm text-blue-700">
                Développer les plats les plus populaires
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <p className="text-sm text-blue-700">
                Analyser les tendances de croissance mensuelle
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <p className="text-sm text-blue-700">
                Maintenir la satisfaction client élevée
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
