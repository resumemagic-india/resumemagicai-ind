import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle } from 'lucide-react';

interface DocumentPurchase {
  id: string;
  quantity: number;
  used_quantity: number;
  remaining_quantity: number;
  purchase_date: string;
}

interface UserDocumentPurchasesProps {
  purchases: DocumentPurchase[];
}

export const UserDocumentPurchases = ({ purchases }: UserDocumentPurchasesProps) => {
  // Filter to only active purchases (with remaining quantity)
  const activePurchases = purchases.filter(p => p.remaining_quantity > 0);
  const totalRemaining = activePurchases.reduce((total, p) => total + p.remaining_quantity, 0);
  
  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-amber-400" />
          Your Document Purchases
        </CardTitle>
        <CardDescription>
          You have {totalRemaining} document{totalRemaining !== 1 ? 's' : ''} remaining
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {activePurchases.length > 0 ? (
          <div className="space-y-3">
            {activePurchases.map(purchase => (
              <div key={purchase.id} className="bg-slate-800 p-3 rounded-md">
                <div className="flex justify-between text-sm">
                  <span>Purchase {new Date(purchase.purchase_date).toLocaleDateString()}</span>
                  <span className="text-amber-400 font-medium">
                    {purchase.remaining_quantity}/{purchase.quantity} remaining
                  </span>
                </div>
                <div className="mt-2 bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500" 
                    style={{ width: `${(purchase.remaining_quantity / purchase.quantity) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-6 text-center text-slate-400">
            <div>
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-500" />
              <p>No active document purchases</p>
              <p className="text-xs mt-1">Purchase documents from the Pricing page</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};