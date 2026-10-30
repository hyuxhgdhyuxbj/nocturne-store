# NOCTURNE 私密生活方式商城

这是一个不需要后端也能直接运行的成人用品商城原型，重点适配手机端浏览习惯。视觉采用克制、暧昧的私密风格，商品购买入口统一引导到客服微信。

客服微信：`kjgbsh123321`

店铺管理登录：

- 账号：`a983553321`
- 密码：`a5213258`

## 本地预览

直接双击 `index.html` 即可打开。上传的图片和视频会保存到当前浏览器的 `localStorage`，换一台电脑或清除浏览器数据后不会保留。

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

当前版本的分类、商品和图片/视频数据只保存在当前浏览器，不接入数据库、图片存储、登录服务或支付服务。清除浏览器数据、换设备或换浏览器后，数据不会自动同步。
