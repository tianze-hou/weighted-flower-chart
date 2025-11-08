// 配置常量
const CHART_CONFIG = {
  width: 800,
  height: 400,
  margin: { top: 20, right: 30, bottom: 50, left: 40 },
  petal: {
    defaultWidth: 12,
    hoverWidth: 16,
    defaultOpacity: 0.8,
    hoverOpacity: 1,
    inactiveOpacity: 0.4
  }
};

// 示例数据
const data = {
  "entities": [
    { "name": "美国", "scores": { "经济": 95, "教育": 90, "环境": 68, "科技": 98, "医疗": 83, "文化": 85, "安全": 75, "基础设施": 90, "生活质量": 88 } },
    { "name": "印度", "scores": { "经济": 78, "教育": 65, "环境": 55, "科技": 82, "医疗": 60, "文化": 80, "安全": 60, "基础设施": 65, "生活质量": 58 } },
    { "name": "德国", "scores": { "经济": 89, "教育": 93, "环境": 77, "科技": 90, "医疗": 85, "文化": 90, "安全": 83, "基础设施": 88, "生活质量": 85 } },
    { "name": "巴西", "scores": { "经济": 68, "教育": 70, "环境": 60, "科技": 75, "医疗": 65, "文化": 75, "安全": 55, "基础设施": 70, "生活质量": 65 } },
    { "name": "日本", "scores": { "经济": 88, "教育": 82, "环境": 70, "科技": 95, "医疗": 81, "文化": 85, "安全": 80, "基础设施": 92, "生活质量": 80 } },
    { "name": "南非", "scores": { "经济": 63, "教育": 58, "环境": 50, "科技": 72, "医疗": 58, "文化": 70, "安全": 50, "基础设施": 60, "生活质量": 55 } },
    { "name": "法国", "scores": { "经济": 87, "教育": 80, "环境": 75, "科技": 91, "医疗": 85, "文化": 90, "安全": 78, "基础设施": 85, "生活质量": 83 } },
    { "name": "印度尼西亚", "scores": { "经济": 70, "教育": 60, "环境": 55, "科技": 73, "医疗": 63, "文化": 74, "安全": 60, "基础设施": 65, "生活质量": 60 } },
    { "name": "加拿大", "scores": { "经济": 82, "教育": 92, "环境": 88, "科技": 84, "医疗": 92, "文化": 85, "安全": 85, "基础设施": 88, "生活质量": 90 } },
    { "name": "墨西哥", "scores": { "经济": 75, "教育": 68, "环境": 58, "科技": 70, "医疗": 65, "文化": 78, "安全": 55, "基础设施": 65, "生活质量": 60 } },
    { "name": "英国", "scores": { "经济": 90, "教育": 86, "环境": 72, "科技": 93, "医疗": 85, "文化": 88, "安全": 80, "基础设施": 85, "生活质量": 87 } },
    { "name": "越南", "scores": { "经济": 65, "教育": 68, "环境": 55, "科技": 72, "医疗": 63, "文化": 70, "安全": 60, "基础设施": 62, "生活质量": 58 } },
    { "name": "俄罗斯", "scores": { "经济": 76, "教育": 70, "环境": 58, "科技": 83, "医疗": 68, "文化": 75, "安全": 65, "基础设施": 70, "生活质量": 65 } },
    { "name": "埃及", "scores": { "经济": 62, "教育": 58, "环境": 52, "科技": 63, "医疗": 60, "文化": 70, "安全": 55, "基础设施": 60, "生活质量": 55 } },
    { "name": "阿根廷", "scores": { "经济": 72, "教育": 75, "环境": 62, "科技": 78, "医疗": 65, "文化": 80, "安全": 68, "基础设施": 70, "生活质量": 65 } }
  ]
};

// 预处理数据和创建图表元素
const categories = Object.keys(data.entities[0].scores);
let weights = categories.map(() => 1 / categories.length);

// 计算所有分数的极值
const allScores = data.entities.flatMap(country => Object.values(country.scores));
const [minScore, maxScore] = d3.extent(allScores);

// 创建SVG容器
const svg = d3.select("#chart")
  .append("svg")
  .attr("width", CHART_CONFIG.width)
  .attr("height", CHART_CONFIG.height);

// 创建比例尺
const x = d3.scaleBand()
  .domain(data.entities.map(d => d.name))
  .range([CHART_CONFIG.margin.left, CHART_CONFIG.width - CHART_CONFIG.margin.right])
  .padding(0.1);

const y = d3.scaleLinear()
  .domain([minScore, maxScore])
  .range([CHART_CONFIG.height - CHART_CONFIG.margin.bottom, CHART_CONFIG.margin.top]);

const petalLengthScale = d3.scaleLinear()
  .domain([minScore, maxScore])
  .range([0, 100]);

const color = d3.scaleOrdinal(d3.schemeCategory10);

// 绘制x轴
svg.append("g")
  .attr("transform", `translate(0,${CHART_CONFIG.height - CHART_CONFIG.margin.bottom})`)
  .call(d3.axisBottom(x));

// 计算加权分数的辅助函数
function calculateWeightedScores() {
  data.entities.forEach(country => {
    country.weightedScore = Object.entries(country.scores)
      .reduce((sum, [, score], i) => sum + score * weights[i], 0);
  });
}

// 更新图表函数
function updateChart() {
  // 计算每个国家的加权分数
  calculateWeightedScores();

  // 绘制国家组
  svg.selectAll(".country")
    .data(data.entities)
    .join("g")
    .attr("class", "country")
    .attr("transform", d => `translate(${x(d.name)},0)`)
    .each(function(d) {
      const countryGroup = d3.select(this);
      const scores = Object.entries(d.scores)
        .map(([category, score], i) => ({ category, score, weight: weights[i] }));

      // 计算通用值（避免重复计算）
      const centerX = x.bandwidth() / 2;
      const centerY = y(d.weightedScore);
      const numCategories = categories.length;
      const angleStep = (2 * Math.PI) / numCategories;

      // 绘制加权分数线条
      countryGroup.selectAll(".weighted-score")
        .data([d.weightedScore])
        .join("line")
        .attr("class", "weighted-score")
        .attr("x1", centerX)
        .attr("x2", centerX)
        .attr("y1", y(minScore))
        .attr("y2", centerY)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

      // 绘制花瓣
      countryGroup.selectAll(".petal")
        .data(scores)
        .join("line")
        .attr("class", "petal")
        .attr("x1", centerX)
        .attr("y1", centerY)
        .attr("x2", (d, i) => centerX + petalLengthScale(d.score) * Math.cos(i * angleStep) * 0.5)
        .attr("y2", (d, i) => centerY + petalLengthScale(d.score) * Math.sin(i * angleStep) * 0.5)
        .attr("stroke", (d, i) => color(i))
        .attr("stroke-width", CHART_CONFIG.petal.defaultWidth)
        .attr("stroke-linecap", "round")
        .attr("stroke-opacity", CHART_CONFIG.petal.defaultOpacity);

      // 绘制中心点
      countryGroup.selectAll(".center-dot")
        .data([d.weightedScore])
        .join("circle")
        .attr("class", "center-dot")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", 5)
        .attr("fill", "white");
    });

  // 更新滑块标签颜色
  d3.select("#weight-sliders")
    .selectAll(".slider-container")
    .data(categories)
    .each(function(_, i) {
      d3.select(this)
        .select("label")
        .attr("style", `color: ${color(i)}`);
    });
}

// 归一化权重并更新图表
function updateWeights() {
  // 计算总权重并归一化
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  weights = weights.map(w => w / totalWeight);
  updateChart();
}

// 添加滑块控件
function setupSliders() {
  d3.select("#weight-sliders")
    .selectAll(".slider-container")
    .data(categories)
    .join("div")
    .attr("class", "slider-container")
    .each(function(category, i) {
      const container = d3.select(this);
      
      // 添加标签
      container.append("label")
        .text(category)
        .attr("class", "country-label")
        .attr("style", `color: ${color(i)}`);

      // 添加滑块
      container.append("input")
        .attr("type", "range")
        .attr("min", 0.1)
        .attr("max", 1)
        .attr("step", 0.01)
        .attr("value", 0.2)
        .attr("class", "slider")
        .on("input", function() {
          weights[i] = +this.value;
          updateWeights();

          // 高亮当前类别的花瓣
          svg.selectAll(".petal")
            .classed("highlighted", d => d.category === category)
            .attr("stroke-width", d => d.category === category 
              ? CHART_CONFIG.petal.hoverWidth 
              : CHART_CONFIG.petal.defaultWidth)
            .attr("stroke-opacity", d => d.category === category 
              ? CHART_CONFIG.petal.hoverOpacity 
              : CHART_CONFIG.petal.inactiveOpacity);
        })
        .on("mouseout", function() {
          // 恢复所有花瓣的默认样式
          svg.selectAll(".petal")
            .classed("highlighted", false)
            .attr("stroke-width", CHART_CONFIG.petal.defaultWidth)
            .attr("stroke-opacity", CHART_CONFIG.petal.defaultOpacity);
        });
    });
}

// 创建并绘制网格线
function setupGridLines() {
  const yAxisGridLines = d3.axisLeft(y)
    .tickSize(-CHART_CONFIG.width + CHART_CONFIG.margin.right + CHART_CONFIG.margin.left)
    .tickFormat(d3.format(".0f"));

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${CHART_CONFIG.margin.left},0)`)
    .call(yAxisGridLines)
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"))
    .call(g => g.selectAll(".tick text")
      .attr("class", "grid-label")
      .attr("x", -10)
      .attr("dy", -4)
      .style("fill", "#666"));
}

// 添加图表说明文本
function addChartCaption() {
  svg.append("text")
    .attr("x", CHART_CONFIG.width / 2)
    .attr("y", CHART_CONFIG.height - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#666")
    .text("图表数据为随机生成，仅供参考，不代表作者观点。 © 2024 Tianze-Hou");
}

// 初始化函数
function initializeChart() {
  setupGridLines();
  addChartCaption();
  setupSliders();
  updateChart();
}

// 启动应用
initializeChart();
