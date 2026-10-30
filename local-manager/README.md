# NOCTURNE 本地店铺管理器

这个程序把商品资料和图片保存在当前电脑的 `manager-data` 文件夹，不依赖 Supabase。

## 使用方法

1. 确认电脑已安装 Node.js。
2. 双击 `start-manager.cmd`。
3. 浏览器打开后，在商品编辑器里添加商品。
4. 图片和视频可以一次选择多张；第一张是商品封面。
5. 在「规格参数」里填写材质、尺寸、身高、体重等信息。
6. 在「可选规格」里填写颜色、尺码等选项。
7. 点击「保存并预览」检查客户看到的页面。
8. 全部商品完成后点击「导出静态站」。

静态网站会生成在：

```text
local-manager/manager-data/publish
```

这个 `publish` 文件夹就是以后上传到 GitHub Pages 的客户网站文件。客户访问静态站时不需要 Supabase，也不需要 VPN。
