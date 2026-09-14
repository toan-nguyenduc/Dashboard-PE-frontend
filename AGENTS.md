# Dashboard PE — Agent Rules & System Description

## Mô tả hệ thống

Dashboard PE là giao diện giám sát và quản lý quy trình transcode video của hệ thống PE (Pertitle Encoding).

### Quy trình Transcode

Một video trải qua các bước sau theo thứ tự:

1. **Download/Copy** — Tải file gốc từ S3 hoặc copy từ NAS storage
2. **Verify** — Kiểm tra tính toàn vẹn của video/audio/subtitle, tính framerate
3. **Split** — Băm video thành các segment nhỏ phục vụ per-segment transcode
4. **Transcode** — Transcode các video segment và audio theo codec h264/h265/dvh
5. **Package** — Đóng gói theo định dạng HLS/DASH
6. **Upload** — Upload các segment và file gốc lên S3

### Mã trạng thái (status) trong bảng `video`

| Status | Ý nghĩa |
|--------|---------|
| 0 | Chờ convert |
| 1 | Convert thành công (đã đồng bộ sang kho) |
| 21 | Download/Copy thành công |
| 22 | Đang download/copy |
| 23 | Download/Copy thất bại |
| 24 | Download/Copy thất bại (đã đồng bộ sang kho) |
| 31 | Verify thành công |
| 32 | Đang verify |
| 33 | Verify thất bại |
| 34 | Verify thất bại (đã đồng bộ sang kho) |
| 40 | Chờ Split |
| 41 | Split thành công |
| 42 | Đang split |
| 43 | Split thất bại |
| 44 | Split thất bại (đã đồng bộ sang kho) |
| 51 | Transcode thành công |
| 52 | Đang transcode |
| 53 | Transcode thất bại |
| 54 | Transcode thất bại (đã đồng bộ sang kho) |
| 61 | Package thành công |
| 62 | Đang package |
| 63 | Package thất bại |
| 64 | Package thất bại (đã đồng bộ sang kho) |
| 71 | Upload thành công |
| 72 | Đang upload |
| 73 | Upload thất bại |
| 74 | Upload thất bại (đã đồng bộ sang kho) |

**Quy tắc status:**
- `x1` = bước thành công
- `x2` = đang xử lý
- `x3` = thất bại
- `x4` = thất bại và đã đồng bộ trạng thái về CSM

### Các Module trong hệ thống transcode

1. **Video-Connector**: Đồng bộ dữ liệu giữa CSM (kho nội dung) và PE (transcoder).
   - Quét `csm_media` có `status=5, convert_status=100, origin_upload_status=1` → ghi vào bảng `video`, gửi Kafka cho Video-Downloader.
   - Đồng bộ ngược: video thành công (status 71) → cập nhật `convert_path`, `convert_images` về `csm_media`. Video failed (23,33,43,53,63,73) → đồng bộ trạng thái failed về `csm_media` (24,34,44,54,64,74).

2. **Video-Downloader**: Nhận Kafka message, copy/download file từ NAS/S3 sang thư mục PE.

3. **Video-Verifier**: Nhận Kafka message, verify content video/audio/subtitle, tính framerate. Thành công → status = 31.

4. **Enc-Server**: Điều phối convert, tạo/phân phối job cho worker, kiểm soát tiến độ. Package xong → gửi Kafka cho Video-Uploader.

5. **Enc-Worker**: 3 loại (SPLIT, TRANSCODE, PACKAGE). Nhận job từ enc-server, hoàn thành báo lại server. Không tương tác DB.

6. **Video-Uploader**: Upload output files, thành công → status = 71.

### Hướng dẫn check log trên Rancher

**Check video-connector:**
- Filter theo `csm_media_id`
- Thành công: `Updated csm_media {id} corresponding to video {videoId}`
- Thất bại: `Video {id} (csm_media {id}) has failed with status {STATUS_FAILED}`

**Lấy videoId từ video-connector:**
- Filter theo `csm_media_id`, trường `id` trong Kafka message là `videoId`

**Lỗi DOWNLOAD_FAILED, VERIFY_FAILED, UPLOAD_FAILED:**
- Dùng `videoId` → filter log module tương ứng (video-downloader, video-verifier, video-uploader)

**Lỗi SPLIT_FAILED, TRANSCODE_FAILED, PACKAGE_FAILED:**
- Dùng `videoId` → filter log `enc-server` → tìm pod nào failed → check log pod đó

---

## Quy tắc phát triển

### Kiến trúc

- **Backend**: Java 17 + Spring Boot 3.x
- **Frontend**: React 18 + Vite 5 + TypeScript + Ant Design 5.x
- **Database**: MariaDB (2 database: `pertitle_encoding` bảng `video`, `csm` bảng `csm_media`)
- **Monorepo**: `backend/` + `frontend/` trong cùng 1 repo

### Nguyên tắc code

1. **KHÔNG HARDCODE** — Tất cả credentials, URLs, cấu hình phải nằm trong:
   - Backend: `application.yml` + `.env` (sử dụng spring-dotenv)
   - Frontend: `.env` + `src/config/*.ts`

2. **SOLID Principles** — Tuân thủ nghiêm ngặt:
   - Single Responsibility: Mỗi class/component làm đúng 1 việc
   - Open/Closed: Extend, không modify
   - Liskov Substitution: Interface-based design
   - Interface Segregation: Interface nhỏ, chuyên biệt
   - Dependency Inversion: Depend on abstractions

3. **Clean Code**:
   - Tên biến, hàm, class phải tự giải thích (self-documenting)
   - Mỗi method/function không quá 30 dòng
   - Comment chỉ khi cần giải thích WHY, không giải thích WHAT
   - Không duplicate code

4. **KHÔNG SỬ DỤNG ICON** trong UI — Sử dụng text, Tag colors, Badge, Progress thay thế.

5. **Auth Module tách riêng**:
   - Backend: toàn bộ trong package `dashboard.auth`
   - Frontend: toàn bộ trong `src/auth/`
   - Khi tích hợp hệ thống lớn: xóa package/folder `auth`, thay SecurityConfig/AuthProvider mới

### Cấu trúc Backend

```
backend/src/main/java/dashboard/
├── DashboardApplication.java
├── config/                  # Global configs (CORS, DataSource, WebSocket)
├── auth/                    # === REMOVABLE === JWT auth module
│   ├── config/
│   ├── controller/
│   ├── dto/
│   ├── filter/
│   ├── service/
│   └── util/
├── video/                   # Video management (DB: pertitle_encoding.video)
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   ├── service/impl/
│   └── mapper/
├── csmmedia/                # CSM Media management (DB: csm.csm_media)
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── repository/
│   ├── service/impl/
│   └── mapper/
└── common/
    ├── dto/                 # ApiResponse
    ├── exception/           # GlobalExceptionHandler, BusinessException
    └── constant/            # VideoStatus enum
```

### Cấu trúc Frontend

```
frontend/src/
├── config/                  # api.config.ts, app.config.ts, status.config.ts
├── auth/                    # === REMOVABLE === Auth module
│   ├── context/
│   ├── components/
│   ├── hooks/
│   └── guards/
├── features/
│   ├── video/               # Video monitoring
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── csm-media/           # CSM Media + Re-encode
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       └── services/
├── components/              # Shared: Layout, Sidebar
├── services/                # http.service.ts (Axios instance)
├── types/                   # TypeScript type definitions
└── styles/                  # theme.ts, index.css
```

### Database

- **Hibernate ddl-auto = none** — KHÔNG tự tạo/sửa table
- Multi-datasource: `peDataSource` (pertitle_encoding) + `csmDataSource` (csm)
- Credentials trong `.env`, KHÔNG commit `.env` vào git

### API Convention

- Base path: `/api/`
- Auth: `/api/auth/login`, `/api/auth/validate`
- Resources: `/api/videos`, `/api/csm-media`
- Response wrapper: `ApiResponse<T>` với `{success, message, data, timestamp}`

### Git Rules

- `.env` PHẢI nằm trong `.gitignore`
- `.env.example` PHẢI được commit (template không chứa credentials thật)
