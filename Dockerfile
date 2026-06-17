FROM node:22-alpine

WORKDIR /app

COPY server.js ./
COPY index.html styles.css app.js budget-data.js ./

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5173

EXPOSE 5173

CMD ["node", "server.js"]
