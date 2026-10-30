# NOCTURNE 私密生活方式商城

这是一个不需要后端也能直接运行的成人用品商城原型。视觉采用克制、暧昧的私密风格，适合先确认品牌视觉、商品分类和上传流程。

## 本地预览

直接双击 `index.html` 即可打开。上传的图片和视频会保存到当前浏览器的 `localStorage`，换一台电脑或清除浏览器数据后不会保留。

## 怎么使用

1. 点击顶部「店铺管理」。
2. 填写商品名称、价格、分类和描述。
3. 上传图片或视频，点击「发布商品」。
4. 回到首页即可看到商品，点击加号可以加入购物袋。

## 发布到 GitHub Pages

1. 在 GitHub 新建一个公开仓库，例如 `nocturne-store`，不要勾选初始化 README。
2. 在本文件夹打开 PowerShell，执行：

```powershell
git init
git add .
git commit -m "Create Songfeng storefront"
git branch -M main
git remote add origin https://github.com/你的用户名/nocturne-store.git
git push -u origin main
```

3. 打开 GitHub 仓库的 **Settings → Pages**。
4. 在 **Build and deployment** 选择 **Deploy from a branch**，分支选择 `main`，目录选择 `/ (root)`，保存。
5. 等待约 1 分钟，GitHub 会给你一个 `https://你的用户名.github.io/nocturne-store/` 的网站地址。

## 下一步接入真实商城

当前版本的商品数据只保存在浏览器。要让顾客在不同设备看到同一份商品，需要接入数据库、图片存储、登录和支付。推荐下一阶段使用 Supabase（数据库 + Storage + 登录）和 Stripe/微信支付，再把前端部署在 Vercel 或 GitHub Pages。
