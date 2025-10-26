// src/components/chat/ActionProposal.tsx
'use client';

import React, { useState } from 'react';
import { FiAlertTriangle, FiDollarSign, FiCheck, FiX } from 'react-icons/fi';
import { ProposedAction } from '@/lib/chatApi';

interface ActionProposalProps {
  action: ProposedAction;
  onApprove: (actionId: string, modifiedParams?: Record<string, unknown>) => void;
  onReject: (actionId: string) => void;
  loading?: boolean;
}

const ActionProposal: React.FC<ActionProposalProps> = ({
  action,
  onApprove,
  onReject,
  loading = false
}) => {
  const [modifiedParams, setModifiedParams] = useState<Record<string, unknown>>({});

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const handleApprove = () => {
    onApprove(action.action_id, Object.keys(modifiedParams).length > 0 ? modifiedParams : undefined);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 my-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-full bg-primary/10">
          <FiAlertTriangle className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2">Action Required</h3>
          <p className="text-muted-foreground text-sm">{action.intent_description}</p>
        </div>
        <div className="text-xs bg-secondary px-2 py-1 rounded">
          {Math.round(action.confidence_score * 100)}% confident
        </div>
      </div>

      {/* Proposed Actions */}
      <div className="space-y-3 mb-4">
        <h4 className="font-medium text-sm text-foreground">Proposed Actions:</h4>
        {action.endpoints_to_call.map((endpoint, index) => (
          <div key={index} className={`border rounded-lg p-3 ${getRiskColor(endpoint.risk_level)}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs">{endpoint.method}</span>
              <span className="font-medium text-sm">{endpoint.description}</span>
            </div>
            <div className="text-xs opacity-75">
              Endpoint: {endpoint.endpoint}
            </div>

            {/* Editable parameters for high-risk actions */}
            {endpoint.risk_level === 'high' && endpoint.params && (
              <div className="mt-2 space-y-2">
                <div className="text-xs font-medium">Parameters (editable):</div>
                {Object.entries(endpoint.params).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs w-20">{key}:</span>
                    <input
                      type="text"
                      defaultValue={String(value)}
                      onChange={(e) => setModifiedParams(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                      className="text-xs px-2 py-1 border rounded flex-1 bg-background"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Warnings */}
      {action.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <FiAlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-800 text-sm mb-1">Warnings:</div>
              <ul className="text-yellow-700 text-xs space-y-1">
                {action.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Cost */}
      <div className="flex items-center gap-2 mb-4 p-2 bg-secondary rounded">
        <FiDollarSign className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">Estimated cost: {action.estimated_cost} SOL</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex-1 justify-center"
        >
          <FiCheck className="h-4 w-4" />
          {loading ? 'Processing...' : 'Approve & Execute'}
        </button>
        <button
          onClick={() => onReject(action.action_id)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex-1 justify-center"
        >
          <FiX className="h-4 w-4" />
          Reject
        </button>
      </div>
    </div>
  );
};

export default ActionProposal;
