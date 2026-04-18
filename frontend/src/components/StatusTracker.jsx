import React from 'react';

const steps = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const StatusTracker = ({ status }) => {
  // If rejected, we show a special path
  if (status === 'REJECTED') {
    return (
      <div className="tracker-container">
         <div className="tracker-step completed"><div className="step-circle">1</div><span>OPEN</span></div>
         <div className="tracker-step rejected"><div className="step-circle">X</div><span style={{color: 'var(--status-rejected)'}}>REJECTED</span></div>
      </div>
    );
  }

  const currentIndex = steps.indexOf(status);

  return (
    <div className="tracker-container">
      {steps.map((s, idx) => {
        let className = "tracker-step";
        if (idx < currentIndex) className += " completed";
        if (idx === currentIndex) className += " active";
        
        return (
          <div key={s} className={className}>
            <div className="step-circle">{idx < currentIndex ? '✓' : idx + 1}</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.replace('_', ' ')}</span>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTracker;
