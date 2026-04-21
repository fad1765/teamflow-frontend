# TeamFlow Frontend

TeamFlow Frontend 是一套專案管理系統的前端應用，提供類似 Jira / Trello 的 Kanban 看板與團隊協作功能。

---

## 📌 專案簡介

本專案使用 **React + Vite** 開發，支援專案管理、任務拖拉排序、成員協作與多語系切換。

主要目標：
- 建立直覺的 Kanban 操作體驗
- 支援多專案與團隊協作
- 提供 PM 導向的任務管理流程

---

## 🚀 核心功能

### 🔐 使用者系統
- 註冊 / 登入 / 登出（JWT）
- localStorage 維持登入狀態

---

### 📁 專案管理（Projects）
- 建立專案（個人 / 團隊）
- 專案列表顯示
- 專案描述（Description）
- 建立時間顯示
- 成員數統計
- 專案刪除

---

### 👥 成員與邀請
- Email 邀請成員
- 接受 / 拒絕邀請
- 顯示邀請資訊：
  - 專案名稱
  - 邀請人
  - 邀請信箱
- 僅顯示該專案成員（資料隔離）

---

### 📋 任務管理（Kanban）
- Todo / Doing / Done 看板
- 任務拖拉排序（dnd-kit）
- 任務新增 / 編輯 / 刪除
- 任務指派（Assignee）
- 截止時間（Deadline）
- 預估天數（Estimate）
- 完成時間自動記錄

---

### ⚙️ 操作體驗
- Edit Mode（避免誤操作）
- Save / Cancel 機制
- Confirm Modal（統一操作確認）
- Toast 提示

---

### 🌐 多語系（i18n）
- 支援中文 / 英文切換
- UI 文案集中管理

---

## 🧱 技術架構

- React
- Vite
- React Router DOM
- Axios
- @dnd-kit（拖拉）
- react-datepicker
- date-fns
- Context API
- CSS3

---

## 📂 專案結構

frontend/
├── public/
├── src/
│ ├── components/ # UI 元件
│ ├── pages/ # 頁面（Projects / Board）
│ ├── services/ # API 串接
│ ├── styles/ # CSS
│ ├── language/ # i18n
│ ├── utils/ # 工具
│ └── main.jsx
├── package.json
└── README.md

---

## ✨ 設計亮點

### 🔹 專案導向架構
所有資料（任務 / 成員 / 邀請）皆以 Project 為核心隔離

---

### 🔹 拖拉排序（Kanban）
透過 dnd-kit 實作拖拉並與後端同步 position

---

### 🔹 Edit Mode
避免誤拖動，提高使用安全性

---

### 🔹 Confirm Modal 統一
所有關鍵操作（刪除 / 邀請 / 加入）統一 UX

---

### 🔹 多語系設計
支援中英文切換，並集中管理語系

---

## ⚙️ 安裝與執行

### 安裝

npm install

### 啟動

npm run dev

### 本機網址

http://localhost:5173

---

## 🔌 API 串接

- `/auth`
- `/users`
- `/projects`
- `/invitations`
- `/tasks`

---

## 🐳 Docker 部署

### 啟動

docker compose up --build

### 服務
- Frontend：http://localhost:5173
- Backend：http://localhost:8000

---

## 🔮 未來擴充

- Timeline（專案時程 / Gantt）
- Dashboard（PM 視角）
- 任務延遲分析
- 通知系統
- WebSocket 即時更新
- 雲端部署（Vercel / Railway）