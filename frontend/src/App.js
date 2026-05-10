import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import ExpertList from './pages/ExpertList';
import ExpertDetail from './pages/ExpertDetail';
import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          ⚡ <span>Expert<b style={{color:'var(--primary)'}}>Connect</b></span>
        </div>
        <div className="navbar-links">
          <NavLink to="/" end className={({isActive}) => `nav-link${isActive?' active':''}`}>Experts</NavLink>
          <NavLink to="/my-bookings" className={({isActive}) => `nav-link${isActive?' active':''}`}>My Bookings</NavLink>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<ExpertList />} />
            <Route path="/experts/:id" element={<ExpertDetail />} />
            <Route path="/book/:id" element={<BookingForm />} />
            <Route path="/my-bookings" element={<MyBookings />} />
          </Routes>
        </div>
      </BrowserRouter>
    </SocketProvider>
  );
}
