import { NavLink } from 'react-router-dom';
import { 
  HiOutlineCube, 
  HiOutlineViewGrid, 
  HiOutlinePlusCircle,
  HiOutlineCog
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
          Equipment
        </NavLink>
      </nav>
    </aside>
  );
}
