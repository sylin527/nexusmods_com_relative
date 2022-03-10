# nexusmods_com_relative

Personal resources relative to nexusmods.com.

## Development

### 多个脚本获取相同的信息, 多次同样的 DOM 操作

**解决方案**:

对于一个网站, 创建一个全局变量, 用于存储每个脚本获取到的信息.

所有 userscripts 都能获取读写该变量.

建议变量名格式: 作者 + 网站 + 标识数据意思的单词

### 多个脚本都有自建的 UI 元素, 其中一个脚本想要清除这些

**解决方案**:

所有 userscripts 创建的 UI 入口元素均是 `div[id^=sylin527]`
