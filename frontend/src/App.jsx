import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/MockAuthContext';
import Navbar from './components/Navbar';
import TicketListPage from './components/TicketListPage';
import TicketDetailPage from './components/TicketDetailPage';
import TicketSubmissionForm from './components/TicketSubmissionForm';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<TicketListPage />} />
            <Route path="/new" element={<TicketSubmissionForm />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
