async function Start() {
  const width = 1440;
  const height = 2055;

  // 讀取 TopoJSON 文件
  const taiwan = await d3.json("./COUNTY_MOI_1090820.json");
  const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);
  // 如果沒有宣告使用麥卡托的話，d3預設是等面積圓柱投影（Equal-area cylindrical projection）
  const projectmethod = d3
    .geoMercator()
    .center([121, 23.5])
    .scale(25000)
    .translate([width / 2, height / 2]);
  const pathGenerator = d3.geoPath().projection(projectmethod);

  const svg = d3
    .select("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "width: 100%; height: 100%;")
    .on("click", reset);

  // 直接將 id 添加到 g 元素
  const g = svg.append("g");

  // 縣市界線
  g.attr("fill", "#000")
    .attr("cursor", "pointer")
    .selectAll("path")
    .data(
      topojson.feature(taiwan, taiwan.objects["COUNTY_MOI_1090820"]).features
    )
    .join("path")
    .on("click", clicked)
    .attr("d", pathGenerator)
    .attr("class", "county")
    .attr("id", (d) => d.properties["COUNTYENG"])
    .append("title")
    .text((d) => d.properties["COUNTYNAME"]);

  svg.call(zoom);

  function reset() {
    svg.selectAll("path").transition().style("fill", null);
    svg
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity,
        d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
      );
  }

  function clicked(event, d) {
    const [[x0, y0], [x1, y1]] = pathGenerator.bounds(d);
    const [x, y] = pathGenerator.centroid(d);

    event.stopPropagation();
    svg.selectAll("path").transition().style("fill", null);
    d3.select(this)
      .transition()
      .style("fill", "#f9c004")
      .style("fill", "#f9c004")
      .style("stroke", "#fff");
    svg
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(
            Math.min(
              8,
              Math.max(3, 0.9 / (x1 - x0) / width, 0.9 / (y1 - y0) / height)
            )
          )
          .translate(-x, -y),
        d3.pointer(event, svg.node())
      );
  }

  function zoomed(event) {
    const { transform } = event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
  }

  return svg.node();
}
Start();
