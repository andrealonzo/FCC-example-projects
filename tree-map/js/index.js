const project_name="tree-map"

const DATASETS = [{
  TITLE: "Video Game Sales",
  DESCRIPTION: "Top 100 Most Sold Video Games Grouped by Platform",
  FILE_PATH:"data/video_game_sales.json"
},{
  TITLE: "Movie Sales",
  DESCRIPTION: "Top 100 Highest Grossing Movies Grouped By Genre",
  FILE_PATH:"data/movies.json"
},{
  TITLE: "Kickstarter Pledges",
  DESCRIPTION: "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
  FILE_PATH:"data/kickstarter.json"
}]

const DATASET = DATASETS[2];

document.getElementById("title").innerHTML = DATASET.TITLE;
document.getElementById("description").innerHTML = DATASET.DESCRIPTION;

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

d3.json(DATASET.FILE_PATH, function(error,data){
  
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
      .attr("data-category", function(d){
        return d.data.category;
      })
      .attr("data-value", function(d){
        return d.data.value;
      })
      .on("mouseover", function(d) {      
        tooltip.style("opacity", .9); 
        tooltip.html(
          'Name: ' + d.data.name + 
          '<br>Category: ' + d.data.category + 
          '<br>Value: ' + d.data.value
        )
        .attr("data-value", d.data.value)
        .style("left", (d3.event.pageX + 10) + "px") 
        .style("top", (d3.event.pageY - 28) + "px"); 
      }) 
      
      .on("mouseout", function(d) { 
        tooltip.style("opacity", 0); 
      })
      .attr("fill", function(d) { 
        return color(d.data.category); 
      });

  cell.append("text")
    .selectAll("tspan")
      .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
    .enter().append("tspan")
      .attr("x", 4)
      .attr("y", function(d, i) { return 13 + i * 10; })
       .text(function(d) { return d; });
       
       
  var categories = root.leaves().map(function(nodes){
    return nodes.data.category;
  });
  categories = categories.filter(function(category, index, self){
    return self.indexOf(category)===index;    
  })
  var legend = d3.select("#legend")
  var legendWidth = +legend.attr("width");
  const LEGEND_OFFSET = 10;
  const LEGEND_RECT_SIZE = 15;
  const LEGEND_SPACING = 60;
  const LEGEND_TEXT_X_OFFSET = 3;
  const LEGEND_TEXT_Y_OFFSET = -2;
  var legendElemsPerRow = Math.floor(legendWidth/LEGEND_SPACING);
  
  var legendElem = legend
    .append("g")
    .attr("transform", "translate(0," + LEGEND_OFFSET + ")")
    .selectAll("g")
    .data(categories)
    .enter().append("g")
    .attr("transform", function(d, i) { 
      return 'translate(' + 
      ((i%legendElemsPerRow)*LEGEND_SPACING) + ',' + 
      ((Math.floor(i/legendElemsPerRow))*LEGEND_RECT_SIZE) + ')';
    })
     
  legendElem.append("rect")                              
     .attr('width', LEGEND_RECT_SIZE)                          
     .attr('height', LEGEND_RECT_SIZE)                         
     .attr('fill', function(d){
       return color(d);
     })  
     
   legendElem.append("text")                              
     .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)                          
     .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)                       
     .text(function(d) { return d; });  
});

function sumBySize(d) {
  return d.value;
}

