import './App.css'
import { SidebarProvider } from './components/ui/sidebar'
import { AppSidebar } from "@/components/components/Sidebar/app-sidebar";
import Main from "@/Main/Main"
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Register } from './components/components/Auth/Register';
import { Login } from './components/components/Auth/Login';
import { useAuth } from './context/AuthContext';
import { CreateRoadmap } from './Main/components/Roadmap/CreateRoadmap';
import Dashboard from './Main/components/Roadmap/Dashboard';

// Composant pour protéger les routes nécessitant une authentification
const ProtectedRoute = () => {
  const { isAuthenticated, checkingAuth } = useAuth();

  // Pendant la vérification d'authentification, afficher un indicateur de chargement
  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center h-screen m-auto">
        <p className="text-xl font-medium">Vérification de l'authentification...</p>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Sinon, afficher le contenu protégé
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <SidebarProvider>
        <AppSidebar />
        <Routes>
          {/* Routes protégées */}
          <Route element={<ProtectedRoute />}>
            {/* Page d'accueil et tableau de bord */}
            <Route path="/" element={<Main />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Route pour afficher une roadmap spécifique */}
            <Route path="/roadmap/:slug" element={<Main />} />
            
            {/* Route pour créer une nouvelle roadmap */}
            <Route path="/create-roadmap" element={<CreateRoadmap />} />

          </Route>
          
          {/* Routes publiques */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Route par défaut - redirection vers la page d'accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SidebarProvider>
    </Router>
  )
}

export default App
