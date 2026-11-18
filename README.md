# 高尔夫学堂

零基础到进阶的高尔夫学习站：基础知识、礼仪规则、击球、球场、练习方法、精选视频。
静态页面（GitHub Pages）+ Supabase 登录与学习进度（行级权限，每人只能读写自己的数据）。

- 内容：`content.py`、`videos.py` → 运行 `python build.py` 生成 `docs/data.js`
- 数据库：`supabase_setup.sql`
- 配置：`docs/config.js`（仅公开的 anon key）
