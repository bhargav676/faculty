import React from 'react'
import Dashboard from './components/Dashboard'

function App() {
  const rootStyle = {
    backgroundColor: '#0f172a', // Slate 900
    backgroundImage: `
      radial-gradient(circle at 15% 50%, rgba(56, 189, 248, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 85% 30%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 50% 80%, rgba(52, 211, 153, 0.05) 0%, transparent 60%)
    `,
    minHeight: '100vh', 
    width: '100vw',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '20px', 
    margin: 0,
    boxSizing: 'border-box'
  };

  return (
    <div style={rootStyle}>
      <Dashboard />
    </div>
  )
}

export default App
