import { NavLink, Outlet } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

export default function Layout() {
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  return (
    <div className="layout">
      <header className="header">
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Home
          </NavLink>

          <NavLink to="/cart" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Carrito ({totalItems})
          </NavLink>

          <NavLink to="/orders" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Mis pedidos
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin/products"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Admin
            </NavLink>
          )}

          <div className="spacer" />

          {isAuthenticated ? (
            <>
              <span className="user-pill">{user?.email}</span>
              <button className="nav-link logout-button" onClick={logout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Iniciar sesión
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Registrarse
              </NavLink>
            </>
          )}
        </nav>
      </header>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
