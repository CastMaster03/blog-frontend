import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <div style={{ padding: '1rem' }}>
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
