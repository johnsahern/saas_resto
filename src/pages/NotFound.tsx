import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log(
      "🚫 404 Error: Route non trouvée:",
      location.pathname,
      "État auth:",
      { isAuthenticated }
    );
  }, [location.pathname, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page non trouvée</p>
        <Link 
          to={isAuthenticated ? "/dashboard" : "/"} 
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Retour à {isAuthenticated ? "l'accueil" : "la connexion"}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
