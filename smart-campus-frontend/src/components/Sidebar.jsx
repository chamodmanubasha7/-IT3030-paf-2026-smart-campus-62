import { NavLink } from 'react-router-dom';
import { 
  HiOutlineCube, 
  HiOutlineViewGrid, 
  HiOutlinePlusCircle,
  HiOutlineCog,
  HiOutlineCalendar,
  HiOutlineTicket
} from 'react-icons/hi';

/**
 * Sidebar navigation component for the Smart Campus Hub.
 */
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏛️</div>
        <h1>
          Smart Campus
          <span>Operations Hub</span>
        </h1>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Resource Management</div>
        
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <HiOutlineViewGrid />
          All Resources
        </NavLink>

        <NavLink 
          to="/resources/new" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <HiOutlinePlusCircle />
          Add Resource
        </NavLink>

        <div className="sidebar-section-title">Categories</div>

        <NavLink 
          to="/resources/type/LECTURE_HALL" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <HiOutlineCube />
          Lecture Halls
        </NavLink>

        <NavLink 
          to="/resources/type/LAB" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <HiOutlineCube />
          Labs
        </NavLink>

        <NavLink 
          to="/resources/type/MEETING_ROOM" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <HiOutlineCube />
          Meeting Rooms
        </NavLink>

        <NavLink 
          to="/resources/type/PROJECTOR" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <HiOutlineCog />
          Projectors
        </NavLink>

        <div className="sidebar-section-title">Booking Management</div>
        
        <NavLink 
          to="/bookings" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <HiOutlineCalendar />
          All Bookings
        </NavLink>

        <NavLink 
          to="/bookings/create" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <HiOutlinePlusCircle />
          Create Booking
        </NavLink>

        <div className="sidebar-section-title">Ticket Management</div>
        
        <NavLink 
          to="/tickets" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <HiOutlineTicket />
          All Tickets
        </NavLink>

        <NavLink 
          to="/tickets/create" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <HiOutlinePlusCircle />
          Create Ticket
        </NavLink>
      </nav>
    </aside>
  );
}
