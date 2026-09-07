import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useSelector((s) => s.auth);

  if (loading) return <div className="loader">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
