import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="app-container flex flex-col min-h-screen">
            {/* 1. Global Shared Top Navigation Bar */}
            <NavBar />

            <div className="main-body flex flex-1">
                {/* 2. Global Shared Sidebar */}
                <Sidebar />

                {/* 3. Dynamic Center Stage where Member pages load */}
                <main className="content-stage flex-1 p-5 bg-[#f8f9fa]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;