import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './Navbar';

const Layout = () => {
    return (
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Global Shared Top Navigation Bar */}
            <NavBar />

            <div className="main-body" style={{ display: 'flex', flex: 1 }}>
                {/* Dynamic Center Stage where target views mount */}
                <main className="content-stage" style={{ flex: 1, padding: '40px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;