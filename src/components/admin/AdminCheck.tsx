import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

const AdminCheck = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/check');
        const data = await response.json();

        if (!data.hasAdmin && location.pathname !== '/admin/setup') {
          navigate('/admin/setup');
        } else if (data.hasAdmin && location.pathname === '/admin/setup') {
          navigate('/admin/login');
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro ao verificar admin:', error);
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminCheck; 