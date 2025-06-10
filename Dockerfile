# Use the official Nginx image as the base
FROM nginx:alpine

# Copy the application files to the Nginx html directory
COPY index.html /usr/share/nginx/html/
COPY TicTacToe.js /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Nginx runs by default, no need to specify CMD
