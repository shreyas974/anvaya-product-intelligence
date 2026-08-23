# ANVAYA API Contract

## 1. Overview

This document defines the API contract between the ANVAYA Frontend, Backend, and AI services.

Base URL:

    http://127.0.0.1:8000

API Version:

    /api/v1

All API changes must be agreed upon by the relevant frontend, backend, and AI team members before implementation.

---

## 2. Authentication

ANVAYA uses Supabase Authentication.

Protected endpoints require a Supabase access token using the HTTP Bearer scheme.

Request header:

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Get Current User

    GET /api/v1/auth/me

Authentication:

    Required

Successful response:

    200 OK

Response:

    {
        "status": "success",
        "user": {
            "...": "Supabase JWT claims"
        }
    }

Missing or invalid authentication:

    401 Unauthorized

---

## 3. Health Check

### Health

    GET /api/v1/health

Authentication:

    Not required

Successful response:

    200 OK

Response:

    {
        "status": "success",
        "message": "ANVAYA Backend is running"
    }

---

## 4. Products

### Get All Products

    GET /api/v1/products

Authentication:

    Not required

Successful response:

    200 OK

Response:

    [
        {
            "id": 1,
            "name": "...",
            "description": "...",
            "price": 0
        }
    ]

---

### Get Product

    GET /api/v1/products/{product_id}

Authentication:

    Not required

Path parameter:

    product_id: integer

Successful response:

    200 OK

If the product does not exist:

    404 Not Found

---

### Create Product

    POST /api/v1/products

Authentication:

    Not required

Request body:

    ProductCreate

Successful response:

    201 Created

Response:

    ProductResponse

---

### Update Product

    PUT /api/v1/products/{product_id}

Authentication:

    Not required

Path parameter:

    product_id: integer

Request body:

    ProductUpdate

Successful response:

    200 OK

If the product does not exist:

    404 Not Found

---

### Delete Product

    DELETE /api/v1/products/{product_id}

Authentication:

    Not required

Path parameter:

    product_id: integer

Successful response:

    204 No Content

If the product does not exist:

    404 Not Found

---

## 5. Error Responses

The backend uses HTTP status codes to communicate errors.

Common status codes:

    200 OK
    201 Created
    204 No Content
    400 Bad Request
    401 Unauthorized
    403 Forbidden
    404 Not Found
    422 Unprocessable Entity
    500 Internal Server Error

Authentication errors return:

    401 Unauthorized

Authorization failures will return:

    403 Forbidden

Resource-not-found errors return:

    404 Not Found

Validation failures return:

    422 Unprocessable Entity

---

## 6. API Design Rules

1. All new REST APIs must use the `/api/v1/` prefix.
2. Request and response schemas must be explicitly defined.
3. Authentication requirements must be documented for every protected endpoint.
4. HTTP status codes must accurately represent the result.
5. Secrets must never be included in API responses.
6. Supabase service-role keys must never be exposed to the frontend.
7. Breaking API changes require agreement between the affected teams.
8. Frontend and AI integrations must use the documented API contract.

---

## 7. Current API Status

Implemented endpoints:

    GET    /api/v1/health
    GET    /api/v1/auth/me
    GET    /api/v1/products
    GET    /api/v1/products/{product_id}
    POST   /api/v1/products
    PUT    /api/v1/products/{product_id}
    DELETE /api/v1/products/{product_id}

---

## 8. Planned API Areas

The following API areas will be added as backend development continues:

    Authorization and roles
    File uploads
    PDF processing
    CSV processing
    Excel processing
    Validation
    Data normalization
    Processing jobs
    AI extraction
    Evidence traceability
    Review workflows

These endpoints will be added to this contract before frontend or AI integration.

---

## 9. Ownership

Backend:

    Syeda

Frontend/Backend API agreement:

    Syeda + Syed

Supabase configuration:

    Syeda

AI integration:

    Backend + AI team

This document is the shared contract for communication between the Frontend, Backend, and AI components of ANVAYA.
