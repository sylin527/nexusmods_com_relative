返回的直接是 HTML , 还是 thumb 集合.不会暴露直接获取图片的 API.

RH_ModImagesList1 标识 Author Images RH_ModImagesList2 标识 User Images

无 mod 名, 无游戏名, 需要 其它暴露的 API
https://www.nexusmods.com/Core/Libs/Common/Widgets/ModImagesList?RH_ModImagesList1=game_id:1704,id:35082
无页码时, 返回第一页

size 改大无用, 可能 高级用户 有用
https://www.nexusmods.com/Core/Libs/Common/Widgets/ModImagesList?RH_ModImagesList1=game_id:1704,id:39113,page_size:24,1page:1,rh_group_id:1

https://www.nexusmods.com/Core/Libs/Common/Widgets/ModImagesList 返回 Error

https://www.nexusmods.com/Core/Libs/Common/Widgets/ModImagesList?RH_ModImagesList2=game_id:1704,id:39113

https://www.nexusmods.com/Core/Libs/Common/Widgets/ModImagesList?RH_ModImagesList2=game_id:1704,id:39113,page_size:24,2page:15,rh_group_id:2

```html
<span>
  <script>
    $(document).ready(function ($) {
      var RH = new RequestHelper()
      RH.id = 'ModImagesList1'
      RH.group_id = '1'
      RH.target = 'list-modimages-1'
      RH.uri = '/Core/Libs/Common/Widgets/ModImagesList'
      RH.in_items = JSON.parse(
        `{"game_id":"1704","id":"39113","page_size":"24","1page":"1","rh_group_id":"1"}`
      )
      RH.out_items = JSON.parse(
        `{"game_id":1704,"id":39113,"page":1,"page_size":24}`
      )
      RH.InitSessionStorage()
      window.RH_ModImagesList1 = RH
    })
  </script>
</span>
<!-- [lyne408] `pagenav clearfix head-nav` 唯一, 确立第一个 `<script>`  子元素-->
<div class="pagenav clearfix head-nav">
  <script>
    $(function () {
      Filters_Pagination.Load({
        RequestHelper: window.RH_ModImagesList1,
        id: 'page',
        // [lyne408] `page:` 索引, 之后的第一个 '[' 与第二个 ']' 之间, `JSON.parse('[' + pages + ']', 取最 id)
        pages: [
          { id: '1', text: '1' },
          { id: '2', text: '2' },
          { id: '3', text: '3' },
        ],
      })
    })
  </script>

  ...
</div>
```
