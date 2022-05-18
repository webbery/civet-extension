# Civet browser extension API
Civet浏览器扩展接口
### Usage  
```javascript
import { resource, getAllResourceDB, getCurrentActiveDB } from 'civet-extend'

resource.onDownloadSuccess(function(id, params) {
  console.info(`download success[${id}]: ${params}`)
})
resource.onDownloadFail(function(id, params) {
  console.info(`download fail[${id}]: ${params}`)
  // TODO: 缓存链接到本地, 在下次连接上civet时候重新同步
})

let curDB = getCurrentActiveDB()
// save resource of url to current db
resource.addByPath(info.srcUrl, curDB)
```
###  civet extension api  
1. 获取当前所有可用的资源库
```javascript
function getAllResourceDB(): string[]
```
2. 获取civet当前的资源库
```javascript
function getCurrentActiveDB(): string
```
3. 保存一个url链接到指定的资源库db
```javascript
resource.addByPath(url, db)
```
保存成功时，通过`onDownloadSuccess`注册的回调会触发；如果失败，则触发`onDownloadFail`注册的回调。