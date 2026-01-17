import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyOrder from "./pages/MyOrder";
import AdminProducts from "./pages/AdminProducts";
import CreateProduct from "./pages/CreateProduct";
import EditProduct from "./pages/EditProduct";

// Route guards
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";

// Application router configuration
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // Public routes
      { index: true, element: <Home /> },
      { path: "products/:productId", element: <ProductDetail /> },
      { path: "cart", element: <Cart /> },

      // Authentication routes
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },

      // Authenticated user routes
      {
        path: "orders",
        element: (
          <ProtectedRoute>
            <MyOrder />
          </ProtectedRoute>
        ),
      },

      // Admin-only routes
      {
        path: "admin/products",
        element: (
          <AdminProtectedRoute>
            <AdminProducts />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/products/new",
        element: (
          <AdminProtectedRoute>
            <CreateProduct />
          </AdminProtectedRoute>
        ),
      },
      {
        path: "admin/products/:productId/edit",
        element: (
          <AdminProtectedRoute>
            <EditProduct />
          </AdminProtectedRoute>
        ),
      },

      // Fallback route (redirect to home)
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
