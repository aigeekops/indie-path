---
id: verify--python
kind: variant
task: verify
readings:
  - testing
  - pytest
  - pydbtest
  - e2e
step_readings:
  隔离数据并执行:
    - pytest
    - pydbtest
    - e2e
---

# verify · python

## 路径说明

服务端继续用 Python / pytest；浏览器端 Playwright 只检查真实流程，不要求把服务端改写成 Node.js。
