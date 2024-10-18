
基于D3.js的交互式加权评分花瓣图可视化，允许用户调整不同数据指标的权重，并观察这些变化如何影响不同实体的总体评分。这个可视化工具的灵感来自OECD Better Life Index。

此项目灵感来源于[OECD Better Life Index](https://www.oecdbetterlifeindex.org/)。

[![Demo](https://img.shields.io/badge/Demo-weighted--flower--chart-purple)](https://tianze-hou.github.io/weighted-flower-chart/)

## 数据结构

```json
{
  "entities": [
    {
      "name": "EntityName",
      "scores": {
        "Indicator1": value,
        "Indicator2": value,
        ...
      }
    },
    ...
  ]
}
```


## 免责声明

此可视化使用的数据为随机生成，仅供演示使用，不代表任何实体的实际评分或排名。

## 许可证

此项目基于MIT许可证开源 - 详情参见[LICENSE](LICENSE)文件。

## 鸣谢

- 灵感源自[OECD Better Life Index](https://www.oecdbetterlifeindex.org/)。
- 使用D3.js构建。
