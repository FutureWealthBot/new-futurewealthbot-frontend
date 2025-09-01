import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Analysis from "./Analysis";

import Alerts from "./Alerts";

import Simulator from "./Simulator";

import Settings from "./Settings";

import Subscription from "./Subscription";

import Admin from "./Admin";

import Charts from "./Charts";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Analysis: Analysis,
    
    Alerts: Alerts,
    
    Simulator: Simulator,
    
    Settings: Settings,
    
    Subscription: Subscription,
    
    Admin: Admin,
    
    Charts: Charts,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Analysis" element={<Analysis />} />
                
                <Route path="/Alerts" element={<Alerts />} />
                
                <Route path="/Simulator" element={<Simulator />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Subscription" element={<Subscription />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/Charts" element={<Charts />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}