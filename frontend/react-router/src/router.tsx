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

// Guards
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // públicas
      { index: true, element: <Home /> },
      { path: "products/:productId", element: <ProductDetail /> },
      { path: "cart", element: <Cart /> },

      // auth
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },

      // usuario logueado
      {
        path: "orders",
        element: (
          <ProtectedRoute>
            <MyOrder />
          </ProtectedRoute>
        ),
      },

      // admin
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

      // fallback
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);