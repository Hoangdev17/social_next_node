# Mini Social App

Đây là một dự án ứng dụng mạng xã hội mini được xây dựng với **Next.js** và các tính năng realtime cơ bản bao gồm **nhắn tin**, **like**, **comment**, **tạo bài viết**, và **follow**.

## Chức năng chính

- **Nhắn tin realtime**: Người dùng có thể gửi và nhận tin nhắn với nhau ngay lập tức.
- **Like và Comment**: Người dùng có thể like và comment dưới các bài viết.
- **Tạo bài viết**: Người dùng có thể tạo bài viết và chia sẻ với mọi người.
- **Follow người dùng**: Người dùng có thể theo dõi những người khác và nhận thông báo khi họ đăng bài mới.
- **Realtime Updates**: Tất cả các hoạt động (tin nhắn, like, comment, v.v.) đều được cập nhật realtime mà không cần phải tải lại trang.

## Cài đặt

Trước khi bắt đầu, hãy đảm bảo rằng bạn đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 14.x hoặc mới hơn).

### 1. Cài đặt các phụ thuộc

Clone dự án về máy của bạn và cài đặt các phụ thuộc:

```bash
git clone <repository_url>
cd <project_folder>
npm install
# Hoặc nếu bạn dùng Yarn:
# yarn install
# Hoặc nếu bạn dùng PNPM:
# pnpm install
```

### 2. Cấu hình môi trường

Đảm bảo rằng bạn đã cấu hình các biến môi trường cần thiết trong file `.env.local` (nếu có). Ví dụ:

```
NEXT_PUBLIC_API_URL=<your_api_url>
NEXT_PUBLIC_SOCKET_URL=<your_socket_url>
```

### 3. Chạy server phát triển

Chạy server phát triển bằng cách sử dụng một trong các lệnh sau:

```bash
npm run dev
# Hoặc nếu bạn dùng Yarn:
# yarn dev
# Hoặc nếu bạn dùng PNPM:
# pnpm dev
```

Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000) để xem kết quả.

## Cấu trúc dự án

Dự án này được cấu trúc như sau:

```
/pages
  /api
    - các API cho việc gửi tin nhắn, tạo bài viết, và follow
  - các trang như trang chính, trang cá nhân, và trang đăng nhập
/components
  - các component giao diện như bài viết, nhắn tin, nút like, comment
/lib
  - các hàm và thư viện giúp kết nối với backend và socket
/public
  - các tệp hình ảnh và tài nguyên tĩnh
/styles
  - các file CSS hoặc SCSS cho giao diện
```

## Công nghệ sử dụng

- **Next.js**: Framework React cho ứng dụng SSR (Server-side Rendering) và SSG (Static Site Generation).
- **Socket.io**: Dùng cho tính năng realtime, giúp truyền tải các thông báo, tin nhắn và cập nhật trạng thái mà không cần tải lại trang.
- **Prisma (hoặc MongoDB)**: Dùng cho việc quản lý cơ sở dữ liệu và lưu trữ thông tin người dùng, bài viết, tin nhắn, v.v.
- **React**: Thư viện giao diện chính cho việc xây dựng UI.
- **Tailwind CSS**: Framework CSS giúp phát triển giao diện nhanh chóng.

## Các chức năng realtime

- **Nhắn tin**: Sử dụng Socket.io để tạo kênh nhắn tin realtime giữa các người dùng.
- **Follow và Bài viết**: Khi người dùng follow hoặc tạo bài viết mới, hệ thống sẽ tự động cập nhật thông qua websocket cho tất cả người dùng liên quan.

## Cách sử dụng

- Đăng nhập vào ứng dụng với tài khoản của bạn hoặc sử dụng tính năng đăng ký.
- Tạo bài viết mới, like hoặc comment bài viết của người khác.
- Nhắn tin trực tiếp với bạn bè qua chức năng chat realtime.
- Theo dõi các người dùng khác để nhận các cập nhật mới nhất từ họ.

## Học thêm

Để tìm hiểu thêm về Next.js, hãy tham khảo các tài liệu sau:

- [Next.js Documentation](https://nextjs.org/docs) - Tìm hiểu các tính năng và API của Next.js.
- [Learn Next.js](https://nextjs.org/learn) - Một tutorial tương tác để giúp bạn học Next.js từ cơ bản đến nâng cao.
- [Socket.io Documentation](https://socket.io/docs/) - Tìm hiểu cách sử dụng Socket.io để xây dựng các ứng dụng realtime.

## Deploy

Ứng dụng có thể được triển khai dễ dàng trên **Vercel**. Để triển khai lên Vercel, chỉ cần kết nối với GitHub và làm theo các hướng dẫn để deploy.

- Để tìm hiểu chi tiết về việc triển khai, xem tài liệu [Vercel Deployment](https://nextjs.org/docs/deployment).

---

Hy vọng README này giúp bạn hiểu rõ hơn về dự án và cách triển khai nó. Nếu có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ!
