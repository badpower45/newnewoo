# 📡 API Endpoints Documentation

## Base URL
```
Development: http://localhost:3001/api
Production:  https://your-domain.com/api
```

---

## 🔐 Authentication

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Ahmed Mohamed",
  "email": "ahmed@example.com",
  "password": "password123"
}

Response 200:
{
  "auth": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Ahmed Mohamed",
    "email": "ahmed@example.com",
    "role": "customer"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "password123"
}

Response 200:
{
  "auth": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Ahmed Mohamed",
    "email": "ahmed@example.com",
    "role": "customer",
    "loyaltyPoints": 150
  }
}
```

---

## 🛍️ Products

### Get All Products (with Branch Filter)
```http
GET /api/products?branchId=1&category=Dairy&search=milk

Response 200:
{
  "message": "success",
  "data": [
    {
      "id": "1",
      "name": "Almarai Full Fat Milk",
      "description": "Fresh milk from Almarai",
      "category": "Dairy",
      "price": 48.95,
      "discount_price": 45.00,
      "stock_quantity": 100,
      "is_available": true,
      "image": "https://...",
      "barcode": "1234567890",
      "rating": 4.5,
      "reviews": 120,
      "is_organic": false,
      "is_new": false,
      "weight": "1.00 Liter"
    }
  ]
}
```

### Get Single Product
```http
GET /api/products/:id?branchId=1

Response 200:
{
  "message": "success",
  "data": {
    "id": "1",
    "name": "Almarai Full Fat Milk",
    "price": 48.95,
    ...
  }
}
```

### Get Product by Barcode
```http
GET /api/products/barcode/:barcode?branchId=1

Response 200:
{
  "message": "success",
  "data": { ... }
}
```

### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "id": "new-product-1",
  "name": "New Product",
  "description": "Product description",
  "category": "Snacks",
  "image": "https://...",
  "barcode": "9876543210",
  "is_organic": false,
  "weight": "250g",
  "branches": [
    {
      "branchId": 1,
      "price": 25.99,
      "discount_price": 22.99,
      "stock_quantity": 50
    }
  ]
}

Response 200:
{
  "message": "Product created successfully"
}
```

### Upload Products (Excel - Admin Only)
```http
POST /api/products/upload
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

file: [Excel File]

Response 200:
{
  "message": "Products uploaded successfully",
  "inserted": 45,
  "errors": []
}
```

### Delete Product (Admin Only)
```http
DELETE /api/products/:id
Authorization: Bearer {jwt_token}

Response 200:
{
  "message": "Product deleted successfully"
}
```

---

## 🛒 Cart

### Get Cart
```http
GET /api/cart?userId=1

Response 200:
{
  "message": "success",
  "data": [
    {
      "id": "1",
      "cartId": 5,
      "name": "Almarai Milk",
      "image": "https://...",
      "quantity": 2
    }
  ]
}
```

### Add to Cart
```http
POST /api/cart/add
Content-Type: application/json

{
  "userId": 1,
  "productId": "1",
  "quantity": 2
}

Response 200:
{
  "message": "added",
  "id": 5
}
```

### Update Cart Item
```http
POST /api/cart/update
Content-Type: application/json

{
  "userId": 1,
  "productId": "1",
  "quantity": 5
}

Response 200:
{
  "message": "updated"
}
```

### Remove from Cart
```http
DELETE /api/cart/remove/:productId
Content-Type: application/json

{
  "userId": 1
}

Response 200:
{
  "message": "deleted",
  "rowCount": 1
}
```

### Clear Cart
```http
DELETE /api/cart/clear
Content-Type: application/json

{
  "userId": 1
}

Response 200:
{
  "message": "cleared",
  "rowCount": 3
}
```

---

## 📋 Orders

### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "userId": 1,
  "branchId": 1,
  "total": 150.50,
  "items": [
    {
      "id": "1",
      "name": "Almarai Milk",
      "price": 48.95,
      "quantity": 2
    }
  ]
}

Response 200:
{
  "message": "Order created",
  "orderId": 42,
  "pointsEarned": 150
}
```

### Get Orders
```http
GET /api/orders?userId=1
Authorization: Bearer {jwt_token}

Response 200:
{
  "message": "success",
  "data": [
    {
      "id": 42,
      "userId": 1,
      "branchId": 1,
      "total": 150.50,
      "items": [...],
      "date": "2025-11-28T10:30:00Z",
      "status": "pending"
    }
  ]
}
```

### Update Order Status (Admin Only)
```http
PUT /api/orders/:id/status
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "status": "shipped"
}

Response 200:
{
  "message": "success",
  "rowCount": 1
}
```

---

## 👥 Users (Admin Only)

### Get All Users
```http
GET /api/users
Authorization: Bearer {jwt_token}

Response 200:
{
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "Ahmed Mohamed",
      "email": "ahmed@example.com",
      "role": "customer",
      "loyaltyPoints": 150
    }
  ]
}
```

### Create Employee
```http
POST /api/users
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "Sara Ali",
  "email": "sara@company.com",
  "password": "employee123",
  "role": "employee"
}

Response 200:
{
  "message": "User created successfully",
  "userId": 15
}
```

### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer {jwt_token}

Response 200:
{
  "message": "deleted",
  "rowCount": 1
}
```

---

## 💬 Chat

### Create Conversation
```http
POST /api/chat/conversations
Content-Type: application/json

{
  "customerId": 1,
  "customerName": "Ahmed Mohamed"
}

Response 200:
{
  "message": "Conversation created",
  "conversationId": 5
}
```

### Get All Conversations (Admin Only)
```http
GET /api/chat/conversations?status=active&agentId=2
Authorization: Bearer {jwt_token}

Response 200:
{
  "conversations": [
    {
      "id": 5,
      "customerId": 1,
      "customerName": "Ahmed Mohamed",
      "agentId": 2,
      "status": "active",
      "createdAt": "2025-11-28T10:00:00Z",
      "lastMessageAt": "2025-11-28T10:30:00Z"
    }
  ]
}
```

### Get Conversation with Messages
```http
GET /api/chat/conversations/:id

Response 200:
{
  "conversation": {
    "id": 5,
    "customerId": 1,
    "customerName": "Ahmed Mohamed",
    "agentId": 2,
    "status": "active"
  },
  "messages": [
    {
      "id": 10,
      "conversationId": 5,
      "senderId": 1,
      "senderType": "customer",
      "message": "Hello, I need help",
      "timestamp": "2025-11-28T10:15:00Z",
      "isRead": true
    }
  ]
}
```

### Assign Conversation (Admin Only)
```http
PATCH /api/chat/conversations/:id/assign
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "agentId": 2
}

Response 200:
{
  "message": "Conversation assigned"
}
```

### Close Conversation (Admin Only)
```http
PATCH /api/chat/conversations/:id/close
Authorization: Bearer {jwt_token}

Response 200:
{
  "message": "Conversation closed"
}
```

### Send Message
```http
POST /api/chat/messages
Content-Type: application/json

{
  "conversationId": 5,
  "senderId": 1,
  "senderType": "customer",
  "message": "I need help with my order"
}

Response 200:
{
  "message": "Message sent",
  "messageId": 25
}
```

### Mark Messages as Read
```http
PATCH /api/chat/messages/read
Content-Type: application/json

{
  "conversationId": 5
}

Response 200:
{
  "message": "Messages marked as read"
}
```

---

## 🔌 Socket.IO Events

### Client → Server

#### Customer Join
```javascript
socket.emit('customer:join', {
  conversationId: 5,
  customerName: 'Ahmed Mohamed'
});
```

#### Agent Join
```javascript
socket.emit('agent:join', {
  agentId: 2,
  agentName: 'Sara Ali'
});
```

#### Send Message
```javascript
socket.emit('message:send', {
  conversationId: 5,
  senderId: 1,
  senderType: 'customer',
  message: 'Hello'
});
```

#### Typing Indicator
```javascript
socket.emit('typing:start', {
  conversationId: 5,
  userType: 'customer',
  userName: 'Ahmed'
});

socket.emit('typing:stop', {
  conversationId: 5,
  userType: 'customer'
});
```

#### Assign Conversation
```javascript
socket.emit('conversation:assign', {
  conversationId: 5,
  agentId: 2,
  agentName: 'Sara Ali'
});
```

#### Mark as Read
```javascript
socket.emit('messages:markRead', {
  conversationId: 5
});
```

### Server → Client

#### New Message
```javascript
socket.on('message:new', (data) => {
  console.log(data);
  // {
  //   id: 25,
  //   conversationId: 5,
  //   senderId: 1,
  //   senderType: 'customer',
  //   message: 'Hello',
  //   timestamp: '2025-11-28T10:30:00Z',
  //   isRead: false
  // }
});
```

#### Message Notification (Agents Only)
```javascript
socket.on('message:notification', (data) => {
  console.log(data);
  // {
  //   conversationId: 5,
  //   message: { ... }
  // }
});
```

#### Typing Indicator
```javascript
socket.on('typing:indicator', (data) => {
  console.log(data);
  // {
  //   userType: 'customer',
  //   userName: 'Ahmed',
  //   isTyping: true
  // }
});
```

#### Agent Online/Offline
```javascript
socket.on('agent:online', (data) => {
  // { agentId: 2, agentName: 'Sara' }
});

socket.on('agent:offline', (data) => {
  // { agentId: 2, agentName: 'Sara' }
});
```

#### Conversation Assigned
```javascript
socket.on('conversation:assigned', (data) => {
  // { conversationId: 5, agentId: 2, agentName: 'Sara' }
});
```

---

## 🔑 Authorization Headers

For protected routes, include JWT token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (Admin Only) |
| 404 | Not Found |
| 500 | Server Error |

---

## 🎯 Role-based Access

| Route | Customer | Employee | Manager | Owner/Admin |
|-------|----------|----------|---------|-------------|
| Auth | ✅ | ✅ | ✅ | ✅ |
| Products (Read) | ✅ | ✅ | ✅ | ✅ |
| Products (Write) | ❌ | ❌ | ✅ | ✅ |
| Cart | ✅ | ✅ | ✅ | ✅ |
| Orders (Own) | ✅ | ✅ | ✅ | ✅ |
| Orders (All) | ❌ | ✅ | ✅ | ✅ |
| Users | ❌ | ❌ | ✅ | ✅ |
| Chat (Customer) | ✅ | ✅ | ✅ | ✅ |
| Chat (Dashboard) | ❌ | ✅ | ✅ | ✅ |

---

**📝 Note:** All timestamps are in ISO 8601 format (UTC)
