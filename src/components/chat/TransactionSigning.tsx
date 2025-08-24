// src/components/chat/TransactionSigning.tsx
'use client';

import React from 'react';
import { FiCreditCard, FiArrowRight, FiDollarSign, FiCheck, FiX } from 'react-icons/fi';
import { PreparedTransaction } from '@/lib/chatApi';

interface TransactionSigningProps {
  transaction: PreparedTransaction;
  onSign: (transactionId: string, signedTransaction: string) => void;
  onReject: (transactionId: string) => void;
  loading?: boolean;
}

const TransactionSigning: React.FC<TransactionSigningProps> = ({
  transaction,
  onSign,
  onReject,
  loading = false
}) => {
  const handleSign = async () => {
    try {
      // Here you would integrate with the wallet to sign the transaction
      // This is a placeholder - you'll need to integrate with @solana/wallet-adapter-react

      // For now, we'll just simulate signing
      const signedTransaction = transaction.unsigned_transaction; // Placeholder
      onSign(transaction.transaction_id, signedTransaction);
    } catch (error) {
      console.error('Failed to sign transaction:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 my-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-full bg-blue-100">
          <FiCreditCard className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2">Transaction Ready to Sign</h3>
          <p className="text-muted-foreground text-sm">
            Please review the transaction details and sign with your wallet.
          </p>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="space-y-3 mb-4">
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="text-sm font-medium text-foreground mb-2">Transaction Details</div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium capitalize">{transaction.transaction_type}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">From:</span>
              <span className="font-mono">{formatAddress(transaction.from_address)}</span>
            </div>

            {transaction.to_address && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To:</span>
                <span className="font-mono">{formatAddress(transaction.to_address)}</span>
              </div>
            )}

            {transaction.amount && transaction.token && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">
                  {transaction.amount} {transaction.token}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Fee Information */}
        <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <FiDollarSign className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            Network fee: {transaction.fee_estimate} SOL
          </span>
        </div>

        {/* Transfer Visualization (if applicable) */}
        {transaction.to_address && transaction.amount && (
          <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">From</div>
              <div className="font-mono text-sm">{formatAddress(transaction.from_address)}</div>
            </div>
            <div className="flex items-center gap-2">
              <FiArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="bg-primary/10 px-2 py-1 rounded text-sm font-medium">
                {transaction.amount} {transaction.token}
              </div>
              <FiArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">To</div>
              <div className="font-mono text-sm">{formatAddress(transaction.to_address)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSign}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex-1 justify-center"
        >
          <FiCheck className="h-4 w-4" />
          {loading ? 'Signing...' : 'Sign Transaction'}
        </button>
        <button
          onClick={() => onReject(transaction.transaction_id)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex-1 justify-center"
        >
          <FiX className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TransactionSigning;
