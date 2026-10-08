# NAS Vision

## 环境变量

复制 `.env.example` 为 `.env`，按需修改认证密钥、数据目录和网络配置。

```bash
cp .env.example .env
```

## 开发

安装项目依赖。

```bash
pnpm install --frozen-lockfile
```

创建数据目录并执行数据库迁移。

```bash
mkdir -p data
pnpm db:migrate
```

启动开发服务。

```bash
pnpm dev
```

## 构建

构建应用镜像，按需修改 `NEXT_PUBLIC_BASE_PATH` 路径前缀。

```bash
docker build -t nas-vision:latest .
```

构建数据库迁移镜像。

```bash
docker build -f Dockerfile.migrate -t nas-vision:migrate-latest .
```

## Docker Run 启动

执行数据库迁移，成功后再启动应用。

```bash
docker run --rm -v "$(pwd)/docker/data:/app/data" nas-vision:migrate-latest
```

启动应用，映射端口 3000 并挂载数据目录。

```bash
docker run -d --name nas-vision --restart unless-stopped --env-file .env -p 3000:3000 -v "$(pwd)/docker/data:/app/data" -v "$(pwd)/docker/uploads:/app/public/static/uploads" nas-vision:latest
```

## Docker Compose 启动

使用本地构建的镜像启动。

```bash
docker compose --env-file .env -f docker/docker-compose.local.yml up -d
```

使用 GHCR 镜像启动，需先配置已有网络名称和固定 IP。

```bash
docker compose --env-file .env -f docker/docker-compose.yml up -d --pull always
```
