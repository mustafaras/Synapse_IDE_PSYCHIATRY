import React from 'react';
import { Folder, Plus } from 'lucide-react';

interface EmptyStateProps {
  onNewFile: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNewFile }) => {
  return (
    <div
      style={{
        padding: '40px 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      {}
      <div
        style={{
          fontSize: '48px',
          opacity: 0.3,
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.1))',
          borderRadius: '50%',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
  <Folder size={48} color="#00A6D7" />
      </div>

      {}
      <div>
        <p
          style={{
            margin: '0 0 8px 0',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          No files found
        </p>
        <p
          style={{
            margin: '0 0 20px 0',
            fontSize: '12px',
            opacity: 0.7,
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          Create your first file to get started
        </p>
      </div>

      {}
      <button
        onClick={onNewFile}
        style={{
          padding: '10px 16px',
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '6px',
          color: '#00A6D7',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(10px)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background =
            'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.15))';
          e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background =
            'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))';
          e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <Plus size={16} />
        Create New File
      </button>
    </div>
  );
};
