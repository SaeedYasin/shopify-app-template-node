FROM node:18-alpine

ARG VITE_HOST
ARG SHOPIFY_API_KEY
ARG VITE_APP_SLUG
ARG VITE_MP_TOKEN
ARG VITE_BS_TOKEN
ENV VITE_HOST=$VITE_HOST
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
ENV VITE_APP_SLUG=$VITE_APP_SLUG
ENV VITE_MP_TOKEN=$VITE_MP_TOKEN
ENV VITE_BS_TOKEN=$VITE_BS_TOKEN
EXPOSE 8081
WORKDIR /app
COPY package.json package.json
COPY web/frontend/package.json frontend/package.json
COPY web/backend/package.json backend/package.json
RUN npm --prefix ./frontend install
RUN npm --prefix ./backend install
COPY web/@types @types
COPY web/frontend frontend
RUN npm --prefix ./frontend run build
RUN npm --prefix ./frontend run upload
COPY web/backend backend
RUN npm --prefix ./backend run prepare
RUN npm --prefix ./backend run build
CMD cd backend && npm start
