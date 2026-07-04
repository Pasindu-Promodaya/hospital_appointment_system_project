import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function Layout() {
    return (
        <div className="flex flex-col min-h-screen w-screen bg-slate-50">
            {/* Global Top Navigation Bar */}
            <NavBar />

            {/* Dynamic Main Page Content Area */}
            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    );
}