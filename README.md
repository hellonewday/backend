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
Chạy MongoDB Compass Community, mongodb://localhost:27017

Nodejs server host at: http://localhost:8888

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
 - POST /news/create
   + token (required)
   + title (required)
   + imageUrl (required)
   + subtitle (required)
   + content (required)
   + created
   + tags [Array]
   + likes
   + shared
   + comments 
  - POST /news/:newsId/comment: token (required), content (required), likes.
  3. Forum - tin tức cộng đồng
  - GET /forums
  - GET /forums/:id
  - POST /forums/create: token (required), title (required), imageUrl, subtitle, content (required), created,likes,shared,comments
  - POST /forums/:forumId/comment: token (required), content (required), likes.
   
