const project_name="choropleth"
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Define body
var body = d3.select("body");

// Define the div for the tooltip
var tooltip = body.append("div")
.attr("class", "tooltip")
.attr("id", "tooltip")
.style("opacity", 0);

// Add title and description

    var heading = body.append("heading");
    heading.append("h1")
      .attr('id', 'title')
      .text("Monthly Global Land-Surface Temperature");
    heading.append("h3")
      .attr('id', 'description')
      .text("Description")

var unemployment = d3.map();

var path = d3.geoPath();

var x = d3.scaleLinear()
    .domain([1, 10])
    .rangeRound([600, 860]);

var color = d3.scaleThreshold()
    .domain(d3.range(21658, 125635, (125635-21658)/8))

    .range(d3.schemeGreens[9]);

var g = svg.append("g")
    .attr("class", "key")
    .attr("id", "legend")
    .attr("transform", "translate(0,40)");

g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Unemployment rate");

g.call(d3.axisBottom(x)
    .tickSize(13)
    .tickFormat(function(x, i) { return i ? x : x + "%"; })
    .tickValues(color.domain()))
  .select(".domain")
    .remove();

d3.queue()
    .defer(d3.json, "https://d3js.org/us-10m.v1.json")
    .defer(d3.json, "http://christianpaul.xyz/household_income.json")
    .await(ready);

function ready(error, us, income) {
  if (error) throw error;

  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("class", "area")
      .attr("data-fips", "4")
      .attr("data-income", "4")
      .attr("fill", function(d) {
        var result = income.filter(function( obj ) {
          return obj.fips == d.id;
        });
        if(result[0]){
          return color(result[0].household_income)
        }
        //could not find a matching fips id in the data
        return color(0)
       })
      .attr("d", path)
      .on("mouseover", function(d) {
        tooltip.style("opacity", .9);
        tooltip.html(d.rate + '%')
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px"); })
          .on("mouseout", function(d) {
            tooltip.style("opacity", 0);
          })
          .append("title")
          .text(function(d) {
            return d.rate + "%";
        });

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);
}
