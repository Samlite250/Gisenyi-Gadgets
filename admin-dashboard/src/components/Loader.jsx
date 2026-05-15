import React from 'react';

const Loader = ({ message = "Loading Gisenyi Gadgets..." }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      gap: 20
    }}>
      <div className="loader-container">
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-logo">G</div>
      </div>
      <div style={{
        fontSize: 14,
        fontWeight: 700,
        color: 'var(--primary-blue)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        opacity: 0.8,
        animation: 'fadeInOut 2s infinite'
      }}>
        {message}
      </div>

      <style>{`
        .loader-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          alignItems: center;
          justifyContent: center;
        }

        .loader-logo {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--primary-blue), #60A5FA);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justifyContent: center;
          color: white;
          font-weight: 900;
          font-size: 24px;
          box-shadow: 0 10px 20px rgba(66, 133, 244, 0.3);
          z-index: 10;
          animation: logoFloat 2s ease-in-out infinite;
        }

        .loader-ring {
          position: absolute;
          border: 2px solid transparent;
          border-top-color: var(--primary-blue);
          border-radius: 50%;
          animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
        }

        .loader-ring:nth-child(1) {
          width: 80px;
          height: 80px;
          opacity: 0.3;
        }

        .loader-ring:nth-child(2) {
          width: 65px;
          height: 65px;
          animation-direction: reverse;
          animation-duration: 2s;
          opacity: 0.5;
        }

        .loader-ring:nth-child(3) {
          width: 100px;
          height: 100px;
          animation-duration: 3s;
          opacity: 0.1;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Loader;
