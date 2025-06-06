#!/bin/bash

# 测试企业微信机器人API
echo "正在测试企业微信机器人API..."

curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "msgtype": "text",
    "text": {
      "content": "测试消息：企业微信机器人通知功能测试"
    }
  }' \
  "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=a1871121-70b0-48a3-b3c1-f37240c7a5b3"

echo "\n测试完成"