# STAGE 1: Build ứng dụng React với môi trường UAT
FROM node:20-alpine AS build
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code
COPY . .

# Chạy lệnh build-uat của bạn để tạo folder /dist
RUN npm run build-uat

# STAGE 2: Serve các file tĩnh đã build bằng Nginx
FROM nginx:1.23-alpine

# Copy kết quả từ stage 'build' vào thư mục mặc định của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy file cấu hình Nginx của bạn vào container
# (File này nên nằm trong thư mục project frontend)
COPY default.conf /etc/nginx/conf.d/default.conf
# Mở port 80 để Nginx có thể nhận request
EXPOSE 80

# Lệnh để khởi chạy Nginx
CMD ["nginx", "-g", "daemon off;"]