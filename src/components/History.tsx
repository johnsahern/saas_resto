
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, RefreshCw, Package, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useHistoryData } from '@/hooks/useHistoryData';
import { HistoryOrdersList } from './history/HistoryOrdersList';
import { HistoryStockMovements } from './history/HistoryStockMovements';
import { HistoryStats } from './history/HistoryStats';

export const History: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { orders, stockMovements, loading, error, refreshData } = useHistoryData(selectedDate);

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(0)} FCFA`;
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalOrders = orders.length;
  const stockAdditions = stockMovements.filter(m => m.type === 'addition').length;
  const stockWithdrawals = stockMovements.filter(m => m.type === 'withdrawal').length;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      console.log('Date selected:', date);
      setSelectedDate(date);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Historique
          </h2>
          <p className="text-emerald-600">
            Historique complet des commandes et mouvements de stock pour le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal border-emerald-200",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: fr }) : "Sélectionner une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <Button
            onClick={refreshData}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Actualiser
          </Button>
        </div>
      </div>

      <HistoryStats
        totalRevenue={totalRevenue}
        totalOrders={totalOrders}
        stockAdditions={stockAdditions}
        stockWithdrawals={stockWithdrawals}
      />

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Commandes ({totalOrders})
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Mouvements de stock ({stockMovements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <HistoryOrdersList orders={orders} loading={loading} />
        </TabsContent>

        <TabsContent value="stock">
          <HistoryStockMovements movements={stockMovements} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
