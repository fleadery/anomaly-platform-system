# 异常检测平台前端

本项目是基于 **React + TypeScript** 简单的异常检测平台的前端实现。

---

## 📌 项目结构

```text
src
 ├─ assets         # 静态资源
 ├─ components
 │    ├─ ui        # 可复用 UI 组件（表格、弹窗、筛选器等）
 │    ├─ layout    # 全局布局框架（头部、导航栏等）
 │    ├─ common    # 公共组件
 ├─ pages          # 页面级组件（DatasetFilesPage, RunListPage 等）
 ├─ config         # 全局公共设置
 ├─ pages          # 页面级组件（DatasetFilesPage, RunListPage 等）
 ├─ styles         # 样式库导入
 ├─ routers        # 路由管理
 ├─ api            # 自定义 React Hooks（useModelRuns, useVisualizationResult 等）
 ├─ constants      # 全局状态与布局上下文（LayoutContext）
 ├─ types          # TypeScript 类型定义（VO, DTO, common等）
 ├─ App.tsx        # 路由配置及顶层组件
 └─ main.tsx       # 项目入口
```
## 部分页面演示
<img width="1279" height="653" alt="微信图片_20260313184959_59_23" src="https://github.com/user-attachments/assets/d8137276-dfe9-42e8-9aaa-34c1cc8c3cc3" />
<img width="1277" height="653" alt="微信图片_20260313184948_58_23" src="https://github.com/user-attachments/assets/d790790f-685e-4607-85e8-96341bfb9b34" />
<img width="1276" height="654" alt="微信图片_20260313184927_57_23" src="https://github.com/user-attachments/assets/71265098-0568-43a2-8d73-b4215e29e1f8" />
<img width="1279" height="653" alt="微信图片_20260313184918_56_23" src="https://github.com/user-attachments/assets/152ec65c-2ba1-4a67-8cad-2a9695033c7f" />
<img width="1281" height="655" alt="微信图片_20260313184902_55_23" src="https://github.com/user-attachments/assets/37f0bb43-3ee5-4f01-ac44-1d4451ebe1ea" />
<img width="1279" height="655" alt="微信图片_20260313184847_54_23" src="https://github.com/user-attachments/assets/da1098fa-2ce0-4b97-9a32-cbd432528f15" />
<img width="1280" height="656" alt="微信图片_20260313184828_53_23" src="https://github.com/user-attachments/assets/d0257205-c458-4e23-9a8c-f495a701955b" />
<img width="1276" height="655" alt="微信图片_20260313184811_52_23" src="https://github.com/user-attachments/assets/82d125ae-0801-4169-87b8-d1772fe3fdd4" />
<img width="1279" height="658" alt="微信图片_20260313184758_51_23" src="https://github.com/user-attachments/assets/0f569a3b-a537-4d11-89c5-f7595893f09b" />
<img width="1277" height="659" alt="微信图片_20260313184735_50_23" src="https://github.com/user-attachments/assets/5ca1fd91-de6c-474f-a9de-b43b8754102c" />
<img width="1279" height="655" alt="微信图片_20260313184710_49_23" src="https://github.com/user-attachments/assets/c3070b1d-c7df-494f-bbe1-ccc7012984bf" />
<img width="1280" height="653" alt="微信图片_20260313184635_48_23" src="https://github.com/user-attachments/assets/10b8422a-1f28-4a92-aac4-175c8bcf03df" />
<img width="1278" height="654" alt="微信图片_20260313184635_47_23" src="https://github.com/user-attachments/assets/d9a9fa06-c6cb-46a3-8dbd-bd440083f46c" />
