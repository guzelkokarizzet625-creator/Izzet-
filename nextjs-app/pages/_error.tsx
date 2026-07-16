import React from 'react';

interface ErrorProps {
  statusCode?: number;
}

function ErrorPage({ statusCode }: ErrorProps) {
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
      <h1 style={{ color: '#d4af37', fontSize: '3rem', margin: '0 0 10px 0' }}>
        {statusCode ? `${statusCode}` : 'Hata'}
      </h1>
      <p style={{ fontSize: '1rem', color: '#a0aec0', margin: '0 0 20px 0' }}>
        {statusCode 
          ? `Sunucuda ${statusCode} kodlu bir hata oluştu.` 
          : 'İstemci tarafında bir hata oluştu.'}
      </p>
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

ErrorPage.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
