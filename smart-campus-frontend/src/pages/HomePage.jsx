import { Link } from 'react-router-dom';
import { HiOutlinePlusCircle, HiOutlineCube, HiOutlineLocationMarker, HiOutlineUsers } from 'react-icons/hi';

/**
 * Home page component with Add Resources button and navigation
 */
export default function HomePage() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Smart Campus Operations Hub</h1>
          <p className="hero-subtitle">
            Manage campus facilities, resources, and equipment efficiently
          </p>
          
          {/* Add Resources Button */}
          <Link to="/resources/new" className="btn btn-primary btn-large">
            <HiOutlinePlusCircle />
            Add Resources
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Resource Management</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <HiOutlineCube />
            </div>
            <h3 className="feature-title">Browse Resources</h3>
            <p className="feature-description">
              View all campus facilities, equipment, and rooms in one place
            </p>
            <Link to="/resources" className="btn btn-secondary">
              View All Resources
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <HiOutlinePlusCircle />
            </div>
            <h3 className="feature-title">Add New Resource</h3>
            <p className="feature-description">
              Register new facilities, equipment, or campus resources
            </p>
            <Link to="/resources/new" className="btn btn-primary">
              Add Resource
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <HiOutlineLocationMarker />
            </div>
            <h3 className="feature-title">Manage Locations</h3>
            <p className="feature-description">
              Organize resources by building, floor, and location
            </p>
            <Link to="/resources" className="btn btn-secondary">
              Browse Locations
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <HiOutlineUsers />
            </div>
            <h3 className="feature-title">Track Status</h3>
            <p className="feature-description">
              Monitor resource availability and maintenance status
            </p>
            <Link to="/resources" className="btn btn-secondary">
              Check Status
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <h2 className="section-title">Quick Access</h2>
        <div className="stats-row">
          <Link to="/resources?type=LECTURE_HALL" className="quick-stat-card">
            <div className="quick-stat-icon">🏫</div>
            <div className="quick-stat-info">
              <div className="quick-stat-title">Lecture Halls</div>
              <div className="quick-stat-desc">View all halls</div>
            </div>
          </Link>

          <Link to="/resources?type=LAB" className="quick-stat-card">
            <div className="quick-stat-icon">🔬</div>
            <div className="quick-stat-info">
              <div className="quick-stat-title">Laboratories</div>
              <div className="quick-stat-desc">Browse labs</div>
            </div>
          </Link>

          <Link to="/resources?type=MEETING_ROOM" className="quick-stat-card">
            <div className="quick-stat-icon">🏢</div>
            <div className="quick-stat-info">
              <div className="quick-stat-title">Meeting Rooms</div>
              <div className="quick-stat-desc">Book rooms</div>
            </div>
          </Link>

          <Link to="/resources?type=COMPUTER" className="quick-stat-card">
            <div className="quick-stat-icon">💻</div>
            <div className="quick-stat-info">
              <div className="quick-stat-title">Computers</div>
              <div className="quick-stat-desc">Check availability</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
