var project_name="scatter-plot";
localStorage.setItem('example_project', 'D3: Scatter Plot');

function renderScatterPlot(data) {

  // set up svg and bar dimensions/margins
  const width = 800;
  const height = 500;
  const margin = { top: 40, right: 20, bottom: 80, left: 80 };

  // append svg to DOM
  const svg = d3.select('.svg-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // for parsing time string in data and converting back to original format
  const parse = d3.timeParse('%M:%S');
  const parseYear = d3.timeParse('%Y');
  const format = d3.timeFormat('%M:%S')
  const formatYear = d3.timeFormat('%Y')

  // calculate min and max data values - subtract 10 seconds from timeMin for padding
  const timeMin = d3.min(data, (d) => parse(d.Time)) - 10000;
  const timeMax = d3.max(data, (d) => parse(d.Time));
  const yearMin = d3.min(data, (d) => parseYear(d.Year - 1));
  const yearMax = d3.max(data, (d) => parseYear(d.Year + 1));

  // set up scales
  const xScale = d3.scaleTime()
    .domain([yearMin, yearMax])
    .range([margin.left, width - margin.right])

  const yScale = d3.scaleTime()
    .domain([timeMin, timeMax])
    .range([height - margin.bottom, margin.top])

  // set up x and y axes
  const xAxis = d3.axisBottom(xScale)

  const yAxis = d3.axisLeft(yScale)
    .tickFormat(format)

  // append tooltip div to body
  const tooltip = d3.select('body').append('div')
    .attr('id', 'tooltip')
    .style('position', 'absolute')
    .style('opacity', 0)

  // append legend div to body
  const legend = d3.select('body').append('div')
    .attr('id', 'legend')
    .style('position', 'absolute')
    .style('left', `${width * 0.8}px`)
    .style('top', `${height / 2}px`)
    .html(
      `<span id="doping-legend"><div id="doping-legend-key" class="legend-key"></div>Doping Allegations</span><br>
      <span id="no-doping-legend"><div id="no-doping-legend-key" class="legend-key"></div>No Allegations</span>`
    )

  // append axes to svg
  svg.append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(xAxis)

  svg.append('g')
    .call(yAxis)
    .attr('transform', `translate(${margin.left}, 0)`)
    .attr('id', 'y-axis')

  // append circles
  svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('data-xvalue', (d) => d.Year)
    .attr('data-yvalue', (d) => parse(d.Time))
    .attr('cx', (d) => xScale(parseYear(d.Year)))
    .attr('cy', (d) => yScale(parse(d.Time)))
    .attr('r', 3)
    .style('fill', (d) => {
      if (d.Doping) return '#cc1c1c';
      else return 'green';
    })
    .on('mouseover', (d) => {
      // show tooltip when user hovers over bar and dynamically allocate attributes
      tooltip.attr('data-year', d.Year)
        .style('left', `${xScale(parseYear(d.Year)) + 10}px`)
        .style('top', `${yScale(parse(d.Time)) + 10}px`)
        .html(
          `<span class="tooltip-title">Name:</span> ${d.Name} <br>
          <span class="tooltip-title">Year:</span> ${d.Year} <br>
          <span class="tooltip-title">Time:</span> ${d.Time}`
        )
        .transition()
        .duration(200)
        .style('opacity', .9)
    })
    .on("mouseout", (d) => {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0)
    })

  // calculate x and y positions for axis labels
  const xLabelPosition = width / 2 + margin.left + margin.right;
  const yLabelPosition = height / 2 - margin.bottom;

  // append labels to svg
  svg.append('text')
    .text('Total Time (Minutes)')
    .attr('class', 'label')
    .attr('transform', 'rotate(-90)')
    .attr('dx', '-7.5em')
    .attr('dy', '1.5em')
    .attr('x', `${-yLabelPosition}`)

  svg.append('text')
    .text('Year')
    .attr('class', 'label')
    .attr('dx', '-7.5em')
    .attr('dy', '1.5em')
    .attr('transform', `translate(${xLabelPosition}, ${height - (margin.bottom / 1.5)})`)


}

$.getJSON('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json', (data) => renderScatterPlot(data));
