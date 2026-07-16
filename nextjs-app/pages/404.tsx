import React from 'react';

export default function Custom404() {
  return (
    <div style={{ 
      backgroundColor: '#070b19', 
      color: '#f5f5f7', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#d4af37', fontSize: '3rem', margin: '0 0 10px 0' }}>404</h1>
      <p style={{ fontSize: '1rem', color: '#a0aec0', margin: '0 0 20px 0' }}>Aradığınız sayfa bulunamadı.</p>
      <a href="/" style={{ 
        color: '#070b19', 
        backgroundColor: '#d4af37', 
        padding: '10px 20px', 
        borderRadius: '8px', 
        textDecoration: 'none', 
        fontSize: '0.875rem',
        fontWeight: 'bold'
      }}>
        Ana Sayfaya Dön
      </a>
    </div>
  );
}
