# 互动加权评分花瓣图可视化

基于D3.js的互动加权评分可视化工具，允许用户调整不同数据指标的权重，并观察这些变化如何影响不同实体的总体评分。这个可视化工具的灵感来自OECD Better Life Index。

此项目的灵感来源于[OECD Better Life Index](https://www.oecdbetterlifeindex.org/)。

打开页面后，您将看到一个显示不同实体在各项指标上评分的图表。您可以使用页面右侧的滑块调整这些指标的权重。图表会根据权重的调整动态更新，显示重新计算的每个实体的加权评分。

## 数据结构

数据的结构如下：

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

- 感谢OECD Better Life Index的灵感。
- 使用D3.js构建。
