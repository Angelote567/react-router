import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Application entry point
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Authentication context provider */}
    <AuthProvider>
      {/* Shopping cart context provider */}
      <CartProvider>
        {/* React Router configuration */}
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
