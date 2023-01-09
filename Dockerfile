FROM node:18-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
EXPOSE 8081
WORKDIR /app
COPY web .
RUN cd frontend && npm install && npm run build
RUN cd backend && npm install && npm run build
CMD cd backend && npm start
