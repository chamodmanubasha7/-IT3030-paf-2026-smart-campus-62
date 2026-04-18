import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import ResourceList from './pages/ResourceList';
import ResourceForm from './pages/ResourceForm';
import ResourceDetail from './pages/ResourceDetail';

/**
 * Main application component with routing and layout.
 */
export default function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#f1f5f9' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
          },
        }}
      />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/" element={<ResourceList />} />
            <Route path="/resources/new" element={<ResourceForm />} />
            <Route path="/resources/type/:type" element={<ResourceList />} />
            <Route path="/resources/:id" element={<ResourceDetail />} />
            <Route path="/resources/:id/edit" element={<ResourceForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
