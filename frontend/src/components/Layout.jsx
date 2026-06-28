import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 1. Global Shared Top Navigation Bar */}
      <NavBar />
      
      <div className="main-body" style={{ display: 'flex', flex: 1 }}>
        {/* 2. Global Shared Sidebar */}
        <Sidebar />
        
        {/* 3. Dynamic Center Stage where Member pages load */}
        <main className="content-stage" style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa' }}>
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default Layout;
