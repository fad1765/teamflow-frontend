# TeamFlow Frontend

TeamFlow Frontend 是 TeamFlow 專案管理系統的前端應用，提供 Kanban 看板操作、任務拖拉排序、任務編輯與多語系功能。

## 專案簡介

此專案使用 **React + Vite** 開發，模擬 Jira / Trello 的任務管理介面。

主要目標：

* 提供直覺 Kanban UI
* 支援拖拉排序
* 強化 PM 使用體驗

## 核心功能

* Kanban 看板（Todo / Doing / Done）
* 任務拖拉排序（dnd-kit）
* Edit Mode（防誤操作）
* Save / Cancel 機制
* 任務新增 / 編輯
* 截止時間 / 預估天數
* 使用者指派
* Toast 提示
* Modal 彈窗
* 中英文切換

## 技術架構

* React
* Vite
* React Router DOM
* Axios
* @dnd-kit
* react-datepicker
* date-fns
* Context API
* CSS3


## 專案結構

frontend/
├── public/
├── src/
│   ├── components/    # UI 元件
│   ├── pages/         # 頁面
│   ├── services/      # API
│   ├── styles/        # CSS
│   ├── language/      # 語系
│   ├── utils/         # 工具
│   └── main.jsx
├── package.json
└── README.md


## 設計亮點

### 🔹 Edit Mode

只有進入編輯模式才能拖拉，避免誤操作

### 🔹 Save / Cancel

拖拉後不立即存 DB，點 Save 才送 API

### 🔹 position 排序

與後端同步排序邏輯，確保一致性

### 🔹 多語系（i18n）

支援：
* 中文
* 英文

### 🔹 DatePicker 整合

使用 react-datepicker + date-fns


## 使用流程

1. 登入
2. 取得 token
3. 載入任務
4. 拖拉 / 編輯
5. Save 同步後端

## 安裝與執行

### 1️安裝套件

npm install

### 2啟動

npm run dev

### 3本機網址

http://localhost:5173

## 套件

npm install axios react-router-dom @dnd-kit/core @dnd-kit/sortable react-datepicker date-fns

## API 串接

* `/auth`
* `/users`
* `/tasks`
* `/tasks/reorder`

## 多語系

位置：

src/language/

## 未來擴充

* Timeline（專案時程）
* Dashboard
* 留言系統
* Docker
* 部署（Vercel / Railway）
