FROM node:22-alpine

WORKDIR /app

COPY src/server/server.js ./
COPY src/public ./public

ENV NODE_ENV=production
ENV APP_ROOT=/app
ENV HOST=0.0.0.0
ENV PORT=5173
ENV PUBLIC_ROOT=/app/public

EXPOSE 5173
EXPOSE 5443

CMD ["node", "server.js"]
