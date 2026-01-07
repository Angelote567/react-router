import Layout from "./components/Layout";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateProduct from "./pages/CreateProduct";
import AdminProducts from "./pages/AdminProducts";
import MyOrder from "./pages/MyOrder";
import EditProduct from "./pages/EditProduct";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";

export const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      // públicas
      { index: true, element: <Home /> },
      { path: "products/:productId", element: <ProductDetail /> },
      { path: "cart", element: <Cart /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },

      // usuario logueado
      { path: "orders", element: <ProtectedRoute><MyOrder /></ProtectedRoute> },

      // admin
      { path: "admin/products", element: <AdminProtectedRoute><AdminProducts /></AdminProtectedRoute> },
      { path: "admin/products/new", element: <AdminProtectedRoute><CreateProduct /></AdminProtectedRoute> },
      { path: "admin/products/:productId/edit", element: <AdminProtectedRoute><EditProduct /></AdminProtectedRoute> },
    ],
  },
];