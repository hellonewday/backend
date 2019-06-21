# vnesports
VN eSports Web production code for back-end
# Hướng dẫn sử dụng
```javascript
git clone https://github.com/hellonewday/vnesports
```
```nodejs
npm install
```
```javascript
npm start
```
Server host at: http://localhost:8888
##
# Các route đã có
1. User
- GET /users
- GET /users/:id
- POST /users/register
   + email (required)
   + password (required)
   + nickname
   + level
   + created
   + avatarUrl
 - POST /users/login
   + email
   + password
 - PATCH /users/:id
 2. News - tin tức chính thống
 - GET /news
 - GET /news/:id
