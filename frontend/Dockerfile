FROM denoland/deno:1.36.1

WORKDIR /app

# Add a build argument
ARG BUILD_DATE

# Use the build argument to create a label
LABEL build_date=$BUILD_DATE

COPY deps.ts .
RUN deno cache deps.ts

COPY . .
RUN deno cache server.ts

COPY version.txt .

EXPOSE 80

CMD ["run", "--allow-net", "--allow-read", "--allow-write", "server.ts"]
