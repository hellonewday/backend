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
  Chú ý: /users/login trả về 1 token và 1 message. Dùng token đó để sử dụng trong các tính năng ở phần body.
 - PATCH /users/:id
 2. News - tin tức chính thống
 - GET /news
 - GET /news/:id
 - POST /news
   + token (required)
   + title (required)
   + imageUrl (required)
   + subtitle (required)
   + content (required)
   + created
   + tags [Array]
   
   
