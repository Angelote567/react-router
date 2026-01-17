## Backend

El backend está desarrollado con FastAPI y desplegado en Render.

URL:
https://e-commerce-backend-oc32.onrender.com

Health check:
https://e-commerce-backend-oc32.onrender.com/health

Documentación Swagger:
https://e-commerce-backend-oc32.onrender.com/docs


En local:
Esto tengo que ejecutar para poner el backend en marcha:
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --reload-dir app