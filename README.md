# 自动挡拖拽式开发平台软件

## 项目简介

**自动挡拖拽式开发平台软件** 是一套以“AI 普及化、开发民主化”为核心理念打造的可视化、低代码 AI 应用构建平台。

平台通过图形化拖拽组件的方式，使用户无需具备深厚的算法或工程背景，即可快速完成从数据预处理、模型训练、模型评估到服务部署的完整 AI 应用构建流程，大幅降低 AI 技术使用门槛，加速企业智能化转型落地。

平台内置丰富的预训练模型库与自动化参数调优工具，广泛适用于工业质检、智能安防、语音交互、文档识别等应用场景。

---

## 技术架构

### 前端架构

- 基于 React 技术栈
- 对 Ant Design 组件进行重构与扩展
- 支持可视化拖拽组件
- 通过简单样式配置完成前端页面开发
- 面向低代码 / 无代码场景设计

### 后端架构

- 采用管道（Pipeline）设计理念
- 通过管道绑定方式实现前后端数据流转
- 支持多服务解耦部署

---

## 运行环境

- Docker
- Docker Network（推荐使用 `runtime` 网络）
- Linux 服务器（推荐 Ubuntu）

---

## Docker 镜像

| 服务 | 镜像 |
| ---- | ---- |
| 平台主服务（pyj2p） | cbtai-hao.tencentcloudcr.com/cbtai/pyj2p:3.17.1 |
| Traefik | cbtai-hao.tencentcloudcr.com/cbtai/traefik:v2.11 |
| Redis | cbtai-hao.tencentcloudcr.com/cbtai/redis:0.1.4 |

---

## 部署步骤

> 以下示例中 `192.168.0.2` 请替换为实际服务器 IP 地址

### 1. 部署 Redis

```bash
docker run --name redis \
--restart=always \
-p 26379:6379 \
-v /home/ubuntu/redis-docker/redis.conf:/etc/redis/redis.conf \
-v /home/ubuntu/redis-docker:/data \
-d cbtai-hao.tencentcloudcr.com/cbtai/redis:0.1.4 \
redis-server /etc/redis/redis.conf --appendonly yes
```

### 2. 部署 Traefik

```bash
docker run -d --name traefik \
--network runtime \
-p 80:80 \
-p 8080:8080 \
-v /var/run/docker.sock:/var/run/docker.sock \
-v /home/hao/traefik.yml:/etc/traefik/traefik.yml \
-l "traefik.enable=true" \
-l 'traefik.http.routers.dashboard.rule=Host(`192.168.0.2`) && (PathPrefix(`/api`) || PathPrefix(`/dashboard`))' \
-l "traefik.http.routers.dashboard.service=api@internal" \
-l "traefik.http.routers.dashboard.entrypoints=web" \
-l "traefik.http.routers.dashboard.middlewares=auth" \
-l 'traefik.http.middlewares.auth.basicauth.users=cbtai:$apr1$yBNM9lmI$v6w9SeP00kHOmI0IDauGK1' \
cbtai-hao.tencentcloudcr.com/cbtai/traefik:v2.11
```

### 3. 部署平台主服务（pyj2p）

```bash
docker run -it -d \
--network runtime \
--name cbtai \
-v /mapdata/cbtai:/home/ya/mapdata \
-v /config/pyj2p:/home/ya/config \
-v /config/j2p_antd:/home/yb/public/config \
-v /config/database_service:/home/yc/config \
-v /mapdata/:/home/ya/test_mapdata \
-v /home/hao/.ssh:/root/.ssh \
-l "traefik.enable=true" \
-l "traefik.http.routers.cbtai.rule=PathPrefix(`/cbtai`)" \
-l "traefik.http.routers.cbtai.entrypoints=web" \
-l "traefik.http.routers.cbtai.middlewares=cbtai-stripprefix" \
-l "traefik.http.services.cbtai.loadbalancer.server.port=3000" \
-l "traefik.http.routers.cbtai-api.rule=PathPrefix(`/cbtai/api`)" \
-l "traefik.http.services.cbtai-api.loadbalancer.server.port=8080" \
-l "traefik.http.routers.cbtai-ws.rule=PathPrefix(`/cbtai/ws`)" \
-l "traefik.http.services.cbtai-ws.loadbalancer.server.port=9090" \
-l "traefik.http.routers.cbtai-db.rule=PathPrefix(`/cbtai/db`)" \
-l "traefik.http.services.cbtai-db.loadbalancer.server.port=8010" \
-l "traefik.http.routers.cbtai-controller.rule=PathPrefix(`/cbtai/controller`)" \
-l "traefik.http.services.cbtai-controller.loadbalancer.server.port=8081" \
-l "traefik.http.middlewares.cbtai-stripprefix.stripprefix.prefixes=/cbtai" \
-l "traefik.http.middlewares.cbtai-stripprefix-api.stripprefix.prefixes=/cbtai/api" \
-l "traefik.http.middlewares.cbtai-stripprefix-ws.stripprefix.prefixes=/cbtai/ws" \
-l "traefik.http.middlewares.cbtai-stripprefix-db.stripprefix.prefixes=/cbtai/db" \
-l "traefik.http.middlewares.cbtai-stripprefix-controller.stripprefix.prefixes=/cbtai/controller" \
-e "REACT_APP_BASE_PREFIX=/cbtai" \
-e "REACT_APP_RUNTIME=0" \
cbtai-hao.tencentcloudcr.com/cbtai/pyj2p:3.17.1 /bin/bash
```

## 平台启动流程

### 1. 进入平台容器

```bash
docker exec -it cbtai bash
```

### 2. 启动前端服务（React）

```bash
cd /home/yb && npm run build && npx serve -s build -l 3000
```
说明：
- 构建前端静态资源
- 使用 serve 启动前端服务
- 对外端口：3000


### 3. 启动 WebSocket 服务

```bash
cd /home/ya/ && gunicorn -c gunicorn_ws_conf.py app.wsasgi:app
```
说明：
- 提供平台实时通信能力
- 用于拖拽编排、状态同步、运行反馈等功能
- 对外端口：9090


### 4. 启动 HTTP 接口服务

```bash
cd /home/ya/ && gunicorn -c gunicorn_http_conf.py app.httpasgi:app
```
说明：
- 提供平台核心业务接口
- 包括任务管理、模型配置、流程控制等
- 对外端口：8080


### 5. 启动数据库操作服务

```bash
cd /home/yc && java $JAVA_OPTS -jar -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 app.jar
```
说明：
- 提供数据库读写与管理能力
- 支持远程调试（端口 5005）
- 对外服务端口：8010


### 6. 平台访问地址

```bash
http://<服务器IP>/cbtai
```
示例：
```bash
http://192.168.0.2/cbtai
```