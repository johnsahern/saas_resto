
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRestaurantTables } from '@/hooks/useRestaurantData';
import { useOrderForm } from '@/hooks/useOrderForm';
import { useOrderFormValidation } from '@/hooks/useOrderFormValidation';
import { OrderCustomerForm } from './OrderCustomerForm';
import { OrderItemsFormWithMenu } from './OrderItemsFormWithMenu';
import { OrderTotal } from './OrderTotal';
import { OrderNotesForm } from './OrderNotesForm';
import { OrderFormActions } from './OrderFormActions';

interface NewOrderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const NewOrderForm: React.FC<NewOrderFormProps> = ({ onSuccess, onCancel }) => {
  const { tables } = useRestaurantTables();
  const {
    loading,
    orderData,
    items,
    setOrderData,
    setItems,
    submitOrder
  } = useOrderForm();

  const { isFormValid, getTotalAmount } = useOrderFormValidation({
    orderData,
    items
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitOrder(onSuccess);
  };

  const handleNotesChange = (notes: string) => {
    setOrderData({ ...orderData, notes });
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-emerald-800">Nouvelle commande</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <OrderCustomerForm
            customerName={orderData.customerName}
            tableId={orderData.tableId}
            tables={tables}
            onCustomerNameChange={(name) => setOrderData({...orderData, customerName: name})}
            onTableIdChange={(tableId) => setOrderData({...orderData, tableId})}
          />

          <OrderItemsFormWithMenu
            items={items}
            onItemsChange={setItems}
          />

          <OrderNotesForm
            notes={orderData.notes}
            onNotesChange={handleNotesChange}
          />

          <OrderTotal totalAmount={getTotalAmount} />

          <OrderFormActions
            loading={loading}
            isFormValid={isFormValid}
            onCancel={onCancel}
          />
        </form>
      </CardContent>
    </Card>
  );
};
