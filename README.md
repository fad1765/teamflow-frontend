# TeamFlow Frontend

TeamFlow Frontend 是一套專案管理系統的前端應用，提供 Kanban 看板與團隊協作功能。

---

## 專案簡介

使用 **React + Vite** 開發，支援專案管理與任務協作，並與後端 API 串接。

---

## 核心功能

### 使用者系統
- 註冊 / 登入 / 登出（JWT）
- localStorage 維持登入狀態

### 專案管理
- 建立專案
- 專案列表
- 專案描述
- 成員數統計
- 專案刪除

### 成員與邀請
- Email 邀請
- 接受 / 拒絕邀請
- 顯示邀請資訊

### 任務管理
- Kanban（Todo / Doing / Done）
- 拖拉排序（dnd-kit）
- 任務新增 / 編輯 / 刪除
- 任務指派
- 截止時間 / 預估天數

### 操作體驗
- Edit Mode
- Save / Cancel
- Confirm Modal
- Toast 提示

### 多語系
- 中文 / 英文切換

---

## 技術架構

- React
- Vite
- Axios
- React Router DOM
- dnd-kit
- date-fns
- Context API
- CSS3
- Docker
- GitHub Actions

---

## 專案結構

frontend/
├── public/
├── src/
│ ├── components/
│ ├── pages/
│ ├── services/
│ ├── styles/
│ ├── language/
│ ├── utils/
│ └── main.jsx
├── package.json
└── README.md

---

## 本機開發


npm install
npm run dev


---

## CI/CD 與部署

### 🔷 CI（GitHub Actions）

- npm install
- Vite build
- Docker build

---

### Frontend 部署（Vercel）


git push
↓
Vercel 自動 build
↓
自動部署


---

### 環境變數


VITE_API_BASE_URL=https://your-backend-url


---

### 系統串接


Frontend（Vercel）
↓
Backend API（Railway）
↓
PostgreSQL


---

## Docker


docker build -t teamflow-frontend .


---

## 未來擴充

- Dashboard
- Timeline（Gantt）
- WebSocket 即時更新
- 通知系統