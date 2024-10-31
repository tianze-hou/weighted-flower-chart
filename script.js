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

const width = 800; // 图表宽度
const height = 400; // 图表高度
const margin = { top: 20, right: 30, bottom: 50, left: 40 }; // 图表边距

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const x = d3.scaleBand()
    .domain(data.entities.map(d => d.name))
    .range([margin.left, width - margin.right])
    .padding(0.1);

// 基于数据的上下极值，确定y轴的上下限
const allScores = data.entities.flatMap(country => Object.values(country.scores));
const [minScore, maxScore] = d3.extent(allScores);
const y = d3.scaleLinear()
    .domain([minScore, maxScore])
    .range([height - margin.bottom, margin.top]);

const petalLengthScale = d3.scaleLinear()
    .domain([minScore, maxScore])
    .range([0, 100]);

// 绘制x轴
svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

const color = d3.scaleOrdinal(d3.schemeCategory10);

const categories = Object.keys(data.entities[0].scores);

let weights = categories.map(() => 1 / categories.length);

// 更新图表——封装为函数
function updateChart() {
    // 计算每个国家的加权分数
    data.entities.forEach(country => {
        country.weightedScore = Object.entries(country.scores).reduce((sum, [category, score], i) => sum + score * weights[i], 0);
    });

    // 绘制国家名称、花瓣
    svg.selectAll(".country")
        .data(data.entities)
        .join("g")
        .attr("class", "country")
        .attr("transform", d => `translate(${x(d.name)},0)`)
        .each(function(d) {
            const countryGroup = d3.select(this);
            const scores = Object.entries(d.scores).map(([category, score], i) => ({ category, score, weight: weights[i] }));

            // 绘制加权分数线条
            countryGroup.selectAll(".weighted-score")
                .data([d.weightedScore])
                .join("line")
                .attr("class", "weighted-score")
                .attr("x1", x.bandwidth() / 2)
                .attr("x2", x.bandwidth() / 2)
                .attr("y1", y(minScore))
                .attr("y2", y(d.weightedScore))
                .attr("stroke", "black")
                .attr("stroke-width", 2);

            // 计算花瓣的角度和中心点
            const numCategories = categories.length;
            const angleStep = (2 * Math.PI) / numCategories;
            const centerX = x.bandwidth() / 2;
            const centerY = y(d.weightedScore);

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
                .attr("stroke-width", 12)
                .attr("stroke-linecap", "round")
                .attr("stroke-opacity", 0.8);

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

    // 滑块的标签颜色
    d3.select("#weight-sliders")
        .selectAll(".slider-container")
        .data(categories)
        .join("div")
        .attr("class", "slider-container")
        .each(function(category, i) {
            const container = d3.select(this);
            container.select("label")
                .attr("style", `color: ${color(i)}`);
        });
}

// 更新权重
function updateWeights() {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    weights = weights.map(w => w / totalWeight);
    updateChart();
}

// 添加滑块
d3.select("#weight-sliders")
    .selectAll(".slider-container")
    .data(categories)
    .join("div")
    .attr("class", "slider-container")
    .each(function(category, i) {
        const container = d3.select(this);
        container.append("label")
            .text(category)
            .attr("class", "country-label")
            .attr("style", `color: ${color(i)}`);

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

                // 检测到滑块被拖动，高亮当前类别的花瓣
                svg.selectAll(".petal")
                    .filter(d => d.category === category)
                    .attr("stroke-width", 16)
                    .attr("stroke-opacity", 1);

                // 同时降低其他类别的花瓣透明度
                svg.selectAll(".petal")
                    .filter(d => d.category !== category)
                    .attr("stroke-width", 12)
                    .attr("stroke-opacity", 0.4);
            })
            .on("mouseout", function() {
                // 停止拖动，恢复所有花瓣的默认样式
                svg.selectAll(".petal")
                    .attr("stroke-width", 12)
                    .attr("stroke-opacity", 0.8);
            });
    });

// 绘制网格线
const yAxisGridLines = d3.axisLeft(y)
    .tickSize(-width + margin.right + margin.left)
    .tickFormat(d3.format(".0f"));

svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxisGridLines)
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"))
    .call(g => g.selectAll(".tick text").attr("class", "grid-label").attr("x", -10).attr("dy", -4).style("fill", "#666"));

// 在图表下方添加文本
svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#666")
    .text("图表数据为随机生成，仅供参考，不代表作者观点。 © 2024 Tianze-Hou");

// 初始化图表
updateChart();
