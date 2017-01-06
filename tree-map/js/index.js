const project_name="tree-map"

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); },
    color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
    format = d3.format(",d");

var treemap = d3.treemap()
    .tile(d3.treemapResquarify)
    .size([width, height])
    .round(true)
    .paddingInner(1);

//var FILE_PATH = "data/Video_Games_Sales_small.csv"
//var FILE_PATH = "data/Video_Games_Sales_as_at_22_Dec_2016.csv"
//var FILE_PATH = "data/Video_Games_Sales_Top_1000.csv"
//var FILE_PATH = "data/Video_Games_Sales_Top_200.csv"
var FILE_PATH = "data/Video_Games_Sales_2014.csv"
d3.csv(FILE_PATH, function(error,data){
  
  if (error) throw error;
  var parsedData = {
    name:"Video Game Data",
    children:[]
  }
  var platforms = {}
  for(var i = 0; i < data.length; i++){
    d = data[i];
    var child = {
      name:d.Name,
      platform:d.Platform,
      sales:d.Global_Sales
    }
    if(platforms[d.Platform]){  //check if platform is already in list of platforms
      platforms[d.Platform].children.push(child);
      platforms[d.Platform].name = d.Platform;
    }else{
      platforms[d.Platform] = {
        name:d.Platform,
        children:[child]
      }
    }
    
  }
  
  parsedData.children = Object.values(platforms);
  console.log(parsedData);
  var root = d3.hierarchy(parsedData)
      .eachBefore(function(d) {
        //console.log("d",d); 
        d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; 
        //console.log("data id", d.data.id);
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
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", function(d) { return d.y1 - d.y0; })
      .attr("fill", function(d) { return color(d.parent.data.id); });

  cell.append("clipPath")
      .attr("id", function(d) { return "clip-" + d.data.id; })
    .append("use")
      .attr("xlink:href", function(d) { return "#" + d.data.id; });

  cell.append("text")
      .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
    .selectAll("tspan")
      .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
    .enter().append("tspan")
      .attr("x", 4)
      .attr("y", function(d, i) { return 13 + i * 10; })
      .text(function(d) { return d; });

  cell.append("title")
      .text(function(d) { return d.data.id + "\n" + format(d.value); });

});

// d3.json("data/video_game_sales.json", function(error, data) {
//   if (error) throw error;
// 
//   var root = d3.hierarchy(data)
//       .eachBefore(function(d) {
//         console.log("d",d); 
//         d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; 
//         console.log("data id", d.data.id);
//       })
//       .sum(sumBySize)
//       .sort(function(a, b) { return b.height - a.height || b.value - a.value; });
// 
//   treemap(root);
// 
//   var cell = svg.selectAll("g")
//     .data(root.leaves())
//     .enter().append("g")
//       .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });
// 
//   cell.append("rect")
//       .attr("id", function(d) { return d.data.id; })
//       .attr("width", function(d) { return d.x1 - d.x0; })
//       .attr("height", function(d) { return d.y1 - d.y0; })
//       .attr("fill", function(d) { return color(d.parent.data.id); });
// 
//   cell.append("clipPath")
//       .attr("id", function(d) { return "clip-" + d.data.id; })
//     .append("use")
//       .attr("xlink:href", function(d) { return "#" + d.data.id; });
// 
//   cell.append("text")
//       .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
//     .selectAll("tspan")
//       .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
//     .enter().append("tspan")
//       .attr("x", 4)
//       .attr("y", function(d, i) { return 13 + i * 10; })
//       .text(function(d) { return d; });
// 
//   cell.append("title")
//       .text(function(d) { return d.data.id + "\n" + format(d.value); });
// 
// });

function sumBySize(d) {
  return d.sales;
}

