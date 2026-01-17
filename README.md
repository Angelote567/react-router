**Full-Stack E-Commerce Application**

Project overview:
This project is a small full-stack e-commerce application built with FastAPI for the backend and React + TypeScript for the frontend.The application allows users to:

- Browse a product catalog
- Search products by text
- View product details
- Add products to a shopping cart
- Register and log in
- Validate the cart before checkout
- Place orders with stock deduction
- View their order history
- (Optional) Manage products through an admin panel

The goal of the project is to practice building a complete web application with a backend REST API and a frontend SPA that communicate correctly with each other.

**Development process (starting from the Heroes example)**

This project was developed starting from one of the example projects provided on the PDU platform, specifically the Heroes example.
That example was used only as a starting point and reference structure. From there, the project was modified step by step until it met all the requirements of the assignment.

Main changes made from the original example:
- The Heroes domain was replaced with an e-commerce domain (products, users, orders).
- New database models were created: User, Product, Order, and OrderItem.
- JWT authentication was implemented for user login and protected routes.
- A shopping cart and checkout flow were added.
- Order creation now deducts product stock.
- A complete React + TypeScript frontend was built to consume the backend API.
- An optional admin panel was added to manage products.
All required features were implemented by adapting and extending the original example.

**Design / architecture decisions**

- Order vs OrderItem (database modelling):
    Orders are split into two tables:
    - Order: stores general order information (user, total, currency, status, date).
    - OrderItem: stores each product inside an order (product, quantity, unit price).

    This models a real e-commerce scenario where one order can contain multiple products and allows storing the price at the time of purchase.

- Checkout validation separated from order creation:
    The endpoint /checkout/validate only checks whether the cart can be purchased (product exists, valid quantity, enough stock).
    It does not modify the database.
    Stock is deducted only when the order is actually created in POST /orders.

- Clear error feedback from the backend:
    When checkout validation fails, the backend returns detailed error information (for example: out of stock or invalid quantity).
    This allows the frontend to show meaningful messages to the user.

- Authentication and route protection:
    JWT authentication is used for login.
    The frontend protects routes using ProtectedRoute and AdminProtectedRoute components so only authenticated users (or admins) can access certain pages.

- Admin product management (extra feature):
    An optional admin user can create, edit and delete products through the frontend.
    Admin access is determined by an is_admin flag on the user.

- Password validation:
    During registration, passwords must have a minimum length.
    Very long passwords are rejected to keep password handling safe and reasonable.


**Run the project locally:**

Backend
1) cd backend
2) source venv/bin/activate
3) uvicorn app.main:app --reload --reload-dir app

The backend will be available at:

http://127.0.0.1:8000

Frontend
1) cd frontend
2) npm install
3) npm run dev

The frontend will be available at:

http://localhost:5173

**Live demo**

Frontend
https://react-router-nmg5vfc31-angelote567s-projects.vercel.app/

Backend API
https://e-commerce-backend-oc32.onrender.com

API documentation (Swagger)
https://e-commerce-backend-oc32.onrender.com/docs

**Users to try the application**
Admin user (product management)
- Email: admin@admin.es
- Password: 123456

Normal user (orders and cart)
- Email: usuario@usuario.es
- Password: 123456