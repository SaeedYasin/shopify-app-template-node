FROM node:18-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
EXPOSE 8081
WORKDIR /app
COPY web/frontend/package.json frontend/package.json
COPY web/backend/package.json backend/package.json
RUN npm --prefix ./frontend install
RUN npm --prefix ./backend install
COPY web/@types @types
COPY web/frontend frontend
RUN npm --prefix ./frontend run build
COPY web/backend backend
RUN npm --prefix ./backend run prepare
RUN npm --prefix ./backend run build
CMD cd backend && npm start
