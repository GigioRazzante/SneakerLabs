// src/components/Header.jsx
import React from 'react';

const Header = () => {
  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: 'black', fontSize: '1.5rem', fontWeight: 'bold' }}>Sneak</span>
        <span style={{ color: '#FF9D00', fontSize: '1.5rem', fontWeight: 'bold' }}>Lab</span>
      </div>
    </div>
  );
};

export default Header;