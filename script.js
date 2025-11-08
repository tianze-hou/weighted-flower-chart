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

// 全局变量，将在数据加载后设置
let data;
let categories;
let weights;
let minScore;
let maxScore;
let svg;
let x;
let y;
let petalLengthScale;
let color;

// 从外部JSON文件加载数据
function loadData() {
  d3.json("data.json")
    .then(jsonData => {
      data = jsonData;
      initializeChart();
    })
    .catch(error => {
      console.error("加载数据失败:", error);
      // 提供一个简单的错误消息给用户
      d3.select("#chart").append("p")
        .style("color", "red")
        .text("无法加载数据文件。请确保data.json文件存在且可访问。");
    });
}

// 计算所有分数的极值
function calculateScoreExtremes() {
  const allScores = data.entities.flatMap(country => Object.values(country.scores));
  [minScore, maxScore] = d3.extent(allScores);
}

// 创建SVG容器和比例尺
function setupScales() {
  // 初始化类别和权重
  categories = Object.keys(data.entities[0].scores);
  weights = categories.map(() => 1 / categories.length);
  
  // 计算分数极值
  calculateScoreExtremes();
  
  // 创建SVG容器
  svg = d3.select("#chart")
    .append("svg")
    .attr("width", CHART_CONFIG.width)
    .attr("height", CHART_CONFIG.height);

  // 创建比例尺
  x = d3.scaleBand()
    .domain(data.entities.map(d => d.name))
    .range([CHART_CONFIG.margin.left, CHART_CONFIG.width - CHART_CONFIG.margin.right])
    .padding(0.1);

  y = d3.scaleLinear()
    .domain([minScore, maxScore])
    .range([CHART_CONFIG.height - CHART_CONFIG.margin.bottom, CHART_CONFIG.margin.top]);

  petalLengthScale = d3.scaleLinear()
    .domain([minScore, maxScore])
    .range([0, 100]);

  color = d3.scaleOrdinal(d3.schemeCategory10);
}

// 绘制x轴
function drawXAxis() {
  svg.append("g")
    .attr("transform", `translate(0,${CHART_CONFIG.height - CHART_CONFIG.margin.bottom})`)
    .call(d3.axisBottom(x));
}

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
  setupScales();
  drawXAxis();
  setupGridLines();
  addChartCaption();
  setupSliders();
  updateChart();
}

// 启动应用 - 首先加载数据
loadData();
