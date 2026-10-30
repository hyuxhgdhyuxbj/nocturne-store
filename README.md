# NOCTURNE 私密生活方式商城

这是一个基于 Supabase 云端数据的成人用品商城，重点适配手机端浏览习惯。视觉采用克制、暧昧的私密风格，商品购买入口统一引导到客服微信。

客服微信：`kjgbsh123321`

店铺管理登录：

- 账号：`a983553321`
- 密码：`a5213258`

## 本地预览

直接双击 `index.html` 即可打开。商品、分类、封面和上传的图片/视频会读写 Supabase 云端，所有手机访问同一个网站时看到同一份数据。

### 封面管理

登录店铺管理后，打开「封面管理」即可上传横屏封面，填写短标题和说明。封面会加入首页轮播，也可以单独删除或恢复默认封面。

## 怎么使用

1. 点击首页右侧的「店铺管理」。
2. 输入管理账号和密码。
3. 在「分类管理」中添加大分类和小分类，例如：男士专区 → 飞机杯、自慰器、男士护理。
4. 在「商品管理」中填写商品名称、价格、分类、小分类、产品参数和介绍。
5. 上传图片或视频，点击「发布商品」。
6. 回到首页即可看到商品。点击商品可以查看详情，购买按钮会显示客服微信。

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

当前版本使用 Supabase 数据库、Storage 和 Auth；不接支付，购买入口继续联系微信客服。前端只包含 publishable key，不包含 Secret key。
