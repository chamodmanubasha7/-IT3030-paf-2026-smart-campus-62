import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import ResourceList from './pages/ResourceList';
import ResourceForm from './pages/ResourceForm';
import ResourceDetail from './pages/ResourceDetail';
import BookingList from './pages/BookingList';
import BookingForm from './pages/BookingForm';
import TicketList from './pages/TicketList';
import TicketForm from './pages/TicketForm';

/**
 * Main application component with routing and layout.
 */
function AppContent() {
  const location = useLocation();
  const isFormPage = location.pathname.includes('/bookings/create') ||
                      location.pathname.match(/^\/bookings\/\d+/) ||
                      location.pathname.includes('/tickets/create') ||
                      location.pathname.match(/^\/tickets\/\d+/) ||
                      location.pathname.includes('/resources/new') ||
                      location.pathname.match(/^\/resources\/\d+$/);

  return (
    <>
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
        <main className={`main-content ${isFormPage ? 'form-page' : ''}`}>
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/" element={<ResourceList />} />
            <Route path="/resources/new" element={<ResourceForm />} />
            <Route path="/resources/type/:type" element={<ResourceList />} />
            <Route path="/resources/:id" element={<ResourceDetail />} />
            <Route path="/resources/:id/edit" element={<ResourceForm />} />
            
            {/* Booking Routes */}
            <Route path="/bookings" element={<BookingList />} />
            <Route path="/bookings/create" element={<BookingForm />} />
            <Route path="/bookings/:id" element={<BookingForm />} />
            <Route path="/bookings/:id/edit" element={<BookingForm />} />
            <Route path="/bookings/create/:resourceId" element={<BookingForm />} />
            
            {/* Ticket Routes */}
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/tickets/create" element={<TicketForm />} />
            <Route path="/tickets/:id" element={<TicketForm />} />
            <Route path="/tickets/:id/edit" element={<TicketForm />} />
            <Route path="/tickets/create/:resourceId" element={<TicketForm />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
