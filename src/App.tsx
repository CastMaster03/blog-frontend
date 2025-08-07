import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import MainLayout from './MainLayout';
import AdminBlogs from './pages/admin/AdminBlogs';
import Login from './pages/auth/LoginReg';
import ProtectedRoute from './components/ProtectedRoute';
import BlogPage from './pages/blog/BlogPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route path="/blogs" element={<ProtectedRoute><BlogPage /></ProtectedRoute>} />

          <Route
            path="/blog-master"
            element={
              <ProtectedRoute>
                <ProtectedAdminRoute>
                  <AdminBlogs />
                </ProtectedAdminRoute>
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
