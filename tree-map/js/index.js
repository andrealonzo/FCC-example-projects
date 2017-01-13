const project_name="tree-map"

// Define body
var body = d3.select("body");
  
// Define the div for the tooltip
var tooltip = body.append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0);

var svg = d3.select("#tree-map"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); },
    color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
    format = d3.format(",d");

var treemap = d3.treemap()
    .size([width, height])
    .paddingInner(1);

const FILE_PATH = "data/video_game_sales.json"
d3.json(FILE_PATH, function(error,data){
  
  if (error) throw error;
  
  var root = d3.hierarchy(data)
      .eachBefore(function(d) {
        d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; 
      })
      .sum(sumBySize)
      .sort(function(a, b) { return b.height - a.height || b.value - a.value; });

  treemap(root);

  var cell = svg.selectAll("g")
    .data(root.leaves())
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

  cell.append("rect")
      .attr("id", function(d) { return d.data.id; })
      .attr("class", "tile")
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", function(d) { return d.y1 - d.y0; })
      .attr("data-name", function(d){
        return d.data.name;
      })
      .attr("data-platform", function(d){
        return d.data.platform;
      })
      .attr("data-sales", function(d){
        return d.data.sales;
      })
      .on("mouseover", function(d) {      
        tooltip.style("opacity", .9); 
        tooltip.html(
          'Name: ' + d.data.name + 
          '<br>Platform: ' + d.data.platform + 
          '<br>Sales: ' + d.data.sales
        )
        .attr("data-sales", d.data.sales)
        .style("left", (d3.event.pageX) + "px") 
        .style("top", (d3.event.pageY - 28) + "px"); 
      }) 
      
      .on("mouseout", function(d) { 
        tooltip.style("opacity", 0); 
      })
      .attr("fill", function(d) { 
        return color(d.data.platform); 
      });

  cell.append("text")
    .selectAll("tspan")
      .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
    .enter().append("tspan")
      .attr("x", 4)
      .attr("y", function(d, i) { return 13 + i * 10; })
       .text(function(d) { return d; });
       
       
  var platforms = root.leaves().map(function(nodes){
    return nodes.data.platform;
  });
  platforms = platforms.filter(function(platform, index, self){
    return self.indexOf(platform)===index;    
  })
  var legend = d3.select("#legend")
  var legendWidth = +legend.attr("width");
  var legendRectSize = 15;
  var legendSpacing = 60;
  //calculates how many legend elements can fit in one row
  var legendElemsPerRow = Math.floor(legendWidth/legendSpacing);
  
  var legendElem = legend
    .append("g")
    .attr("transform", "translate(0,10)")
    .selectAll("g")
    .data(platforms)
    .enter().append("g")
    .attr("transform", function(d, i) { 
      return 'translate(' + ((i%legendElemsPerRow)*legendSpacing) + ',' + ((Math.floor(i/legendElemsPerRow))*legendRectSize) + ')';
    })
     
  legendElem.append("rect")                              
     .attr('width', "15")                          
     .attr('height', "15")                         
     .attr('fill', function(d){
       return color(d);
     })  
     
   legendElem.append("text")                              
     .attr('x', legendRectSize + 3)                          
     .attr('y',legendRectSize - 2)                       
     .text(function(d) { return d; });  
});

function sumBySize(d) {
  return d.sales;
}

