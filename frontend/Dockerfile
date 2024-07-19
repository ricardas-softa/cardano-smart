FROM denoland/deno:latest

WORKDIR /app

COPY . .

RUN deno cache server.ts

EXPOSE 80
ENV DENO_RUN_ARGS="--allow-net --allow-read --allow-write"

# Run the Deno application
CMD ["sh", "-c", "deno run $DENO_RUN_ARGS server.ts"]
