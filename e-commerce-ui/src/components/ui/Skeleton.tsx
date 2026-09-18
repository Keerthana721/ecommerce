import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', width, height, circle = false, style }) => {
  const mergedStyle: React.CSSProperties = {
    width: width,
    height: height,
    borderRadius: circle ? '50%' : undefined,
    ...style,
  };

  return <div className={`skeleton ${className}`} style={mergedStyle} />;
};

export const SkeletonText: React.FC<{ lines?: number; className?: string; style?: React.CSSProperties }> = ({ lines = 1, className = '', style }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', ...style }} className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="skeleton-text"
          width={i === lines - 1 && lines > 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Skeleton className="skeleton-image" height="200px" />
      <SkeletonText lines={2} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <Skeleton width="60px" height="20px" />
        <Skeleton width="40px" height="32px" />
      </div>
    </div>
  );
};

export const SkeletonDetails: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
      <Skeleton height="450px" style={{ borderRadius: '12px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Skeleton width="30%" height="24px" />
        <Skeleton width="80%" height="40px" />
        <Skeleton width="150px" height="24px" />
        <Skeleton width="100px" height="32px" style={{ marginTop: '10px' }} />
        <SkeletonText lines={4} style={{ marginTop: '10px' }} />
        <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
          <Skeleton width="150px" height="45px" />
          <Skeleton width="150px" height="45px" />
        </div>
      </div>
    </div>
  );
};

