
const project_name = 'heat-map';
localStorage.setItem('example_project', 'Heat Map');
function renderHeatMap(dataRaw) {

  // set up function to pad month data containing single digit with additional zero
  function zeroPad(n) {
    if (n < 10)
      return '0' + n;
    else
      return n;
  }

  // functions to parse/format month and year props in data
  const parseMonth = d3.timeParse('%m');
  const parseYear = d3.timeParse('%Y');
  const formatMonth = d3.timeFormat('%B');
  const formatYear = d3.timeFormat('%Y');

  // map data array to d3-friendly format
  const data = dataRaw.monthlyVariance.map((element) => {
    const baseTemperature = 8.66;

    return {
      year: parseYear(element.year),
      month: parseMonth(element.month),
      temperature: baseTemperature + element.variance,
      variance: element.variance,
      monthPadded: zeroPad(element.month),
      monthFormatted: formatMonth(parseMonth(element.month)),
      yearFormatted: formatYear(parseYear(element.year)),
    };
  });

  // calculate min and max data values
  const yearMin = d3.min(data, (d) => d.year);
  const yearMax = d3.max(data, (d) => d.year);
  const monthMin = d3.min(data, (d) => d.monthPadded);
  const monthMax = d3.max(data, (d) => d.monthPadded);

  // set up svg element dimensions
  const width = 1000;
  const height = 450;
  const margin = { top: 40, right: 20, bottom: 80, left: 80 };

  // append svg to DOM
  const svg = d3.select('.svg-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // set up scales
  const xScale = d3.scaleTime()
    .domain([yearMin, yearMax])
    .range([margin.left, width - margin.right])

  const yScale = d3.scaleBand()
    .domain(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])
    // .domain(['December', 'November', 'October', 'September', 'August', 'July', 'June', 'May', 'April', 'March', 'February', 'January'])
    .range([height - margin.bottom, margin.top])

  // filter data to space out x axis tick points - 1 per data point is too many
  // let tickValues = data.filter((d, i) => !(d.yearFormatted % 20));
  // tickValues = tickValues.filter((d) => )
  // console.log(tickValues);

  // set up x and y axes
  const xAxis = d3.axisBottom(xScale)

  const yAxis = d3.axisLeft(yScale)
    .tickSizeOuter(0)
    .tickSizeInner(3)
    // .tickValues()

    // .tickValues(data.map((d) => d.monthFormatted))

  // append axes to svg
  svg.append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(xAxis)

  svg.append('g')
    .call(yAxis)
    .attr('transform', `translate(${margin.left}, 0)`)
    .attr('id', 'y-axis')

  // calculate x and y positions for axis labels
  const xLabelPosition = width / 2 + margin.left + margin.right;
  const yLabelPosition = height / 2 - margin.bottom;

  // append labels to svg
  svg.append('text')
    .text('Month')
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

  // append tooltip div to body
  const tooltip = d3.select('body').append('div')
    .attr('id', 'tooltip')
    .style('position', 'absolute')
    .style('opacity', 0)

  // calculate svg rect dimensions
  const rectWidth = (width - margin.left - margin.right) / (data.length / 12);
  const rectHeight = (height - margin.top - margin.bottom) / 12;

  const rect = svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('width', rectWidth)
    .attr('height', (d) => rectHeight)
    .attr('x', (d) => xScale(d.year))
    .attr('y', (d) => yScale(d.monthFormatted))
    .attr('fill', d => {
      const temp = d.temperature;

      if (temp < 1.7)
        return '#1144B0';
      else if (temp < 2.7)
        return '#2F5CA3';
      else if (temp < 3.7)
        return '#4D7497';
      else if (temp < 4.7)
        return '#6C8D8A';
      else if (temp < 5.8)
        return '#8AA57E';
      else if (temp < 6.8)
        return '#A8BD71';
      else if (temp < 7.8)
        return '#C7D665';
      else if (temp < 8.8)
        return '#C2AB50';
      else if (temp < 9.8)
        return '#BD803C';
      else if (temp < 10.8)
        return '#B95528';
      else if (temp < 11.9)
        return '#B42A14';
      else
        return '#B00000';
    })
    .attr('data-year', (d) => formatYear(d.year))
    .attr('data-month', (d) => formatMonth(d.month))
    .attr('data-temp', (d) => d.temperature)
    .on('mouseover', (d) => {
      // show tooltip when user hovers over bar and dynamically allocate attributes
      tooltip.attr('data-year', d.yearFormatted)
        .style('left', `${xScale(d.year) + 105}px`)
        .style('top', `${yScale(d.monthFormatted) - 70}px`)
        .html(
          `<span class="tooltip-title">Year:</span> ${d.yearFormatted} <br>
          <span class="tooltip-title">Month:</span> ${d.monthFormatted} <br>
          <span class="tooltip-title">Temperature:</span> ${Math.round(d.temperature * 100) / 100} ºC <br>
          <span class="tooltip-title">Monthly Variance:</span> ${d.variance} ºC`
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

}

$.getJSON('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json', (data) => renderHeatMap(data))
