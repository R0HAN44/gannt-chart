import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import d3Tip from "d3-tip";
import './GanttChart.css';

const GanttChart = ({ data,scale }) => {
  const chartRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1400, height: 800 }); // Set default dimensions

  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        const { width } = chartRef.current.getBoundingClientRect();
        // Keep the height fixed, adjust only the width
        setDimensions({ width: Math.max(width, 1400), height: 800 });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (data && chartRef.current) {
      drawChart();
    }
  }, [data, dimensions]);

  const drawChart = () => {
    console.log("Original data:", data);

    const margin = { top: 80, right: 30, bottom: 30, left: 200 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class", "svg-comp")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);


     // Initialize tooltip
      // const tip = d3Tip()
      // .attr('class', 'd3-tip')
      // .offset([-10, 0])
      // .html(d => {
      //   return `<strong>Task:</strong> ${d.target.__data__.task}<br>
      //           <strong>Planned Start:</strong> ${d3.timeFormat("%Y-%m-%d")(d.target.__data__.plannedStart)}<br>
      //           <strong>Planned End:</strong> ${d3.timeFormat("%Y-%m-%d")(d.target.__data__.plannedEnd)}<br>
      //           <strong>Actual Start:</strong> ${d.target.__data__.actualStart ? d3.timeFormat("%Y-%m-%d")(d.target.__data__.actualStart) : 'N/A'}<br>
      //           <strong>Actual End:</strong> ${d.target.__data__.actualEnd ? d3.timeFormat("%Y-%m-%d")(d.target.__data__.actualEnd) : 'N/A'}`;
      // });

      // svg.call(tip);
    
   

    // Parse dates
    const parseTime = d3.timeParse("%Y-%m-%d");
    const validData = data.filter(d => {
      const start = parseTime(d.plannedStart);
      const end = parseTime(d.plannedEnd);
      return start && end && !isNaN(start) && !isNaN(end);
    }).map(d => ({
      ...d,
      plannedStart: parseTime(d.plannedStart),
      plannedEnd: parseTime(d.plannedEnd),
      actualStart: d.actualStart ? parseTime(d.actualStart) : null,
      actualEnd: d.actualEnd ? parseTime(d.actualEnd) : null
    }));

    console.log("Valid data after parsing:", validData);

    if (validData.length === 0) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .text("No valid data to display. Please check your date formats.");
      return;
    }




    // Set up scales

    const minDate = d3.min(validData, d => d.plannedStart);
    const maxDate = d3.max(validData, d => d.actualEnd || d.plannedEnd);

    let startDate, endDate;
    if (scale === 'years') {
      startDate = new Date(minDate.getFullYear(), 0, 1);
      endDate = new Date(maxDate.getFullYear() + 1, 0, 1);
    } else {
      startDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      endDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
    }

    

    const x = d3.scaleTime()
      .domain([
        startDate,
        endDate
      ])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(validData.map(d => d.task))
      .range([0, height])
      .padding(0.55)
      .align(0.5);
      

    // Create custom tick values for months and weeks
    const monthTicks = d3.timeMonths(...x.domain());
    // const weekTicks = d3.timeWeeks(...x.domain());
    

    let dayTicks;
    if (scale === 'days') {
      dayTicks = d3.timeDays(...x.domain());
    }

     // Calculate the width of each day
    const dayWidth = width / d3.timeDays(startDate, endDate).length;

    const yAxis = d3.axisLeft(y)
      .tickSize(0)

    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(-10, 0)`)
      .call(yAxis)
    
    // Draw axes
  if (scale === 'days') {
    // Month labels
    svg.append("g")
      .attr("class", "x-axis-months")
      .attr("transform", `translate(0, ${-margin.bottom})`)
      .selectAll(".month-label")
      .data(monthTicks)
      .enter().append("text")
      .attr("class", "month-label")
      .attr("x", d => x(d) + (x(new Date(d.getFullYear(), d.getMonth() + 1, 1)) - x(d)) / 2)
      .attr("y", -margin.bottom)
      .style("text-anchor", "middle")
      .text(d => d3.timeFormat("%B")(d));

    // Day labels
    svg.append("g")
    .attr("class", "x-axis-days")
    .attr("transform", `translate(0, 0)`)
    .selectAll(".day-label")
    .data(dayTicks)
    .enter().append("text")
    .attr("class", "day-label")
    .attr("x", d => x(d) + dayWidth / 2) // Center within the day's space
    .attr("y", -12)
    .style("text-anchor", "middle")
    .text(d => d.getDate());

    // Add day separators
    svg.append("g")
      .attr("class", "day-separators")
      .selectAll("line")
      .data(dayTicks)
      .enter()
      .append("line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", -margin.top/2)
      .attr("y2", height + margin.bottom)
      .attr("stroke", "#606676")
      .attr("stroke-opacity", "0.5")
      .attr("stroke-width", 1);


    // Add grid lines
    svg.append("g")
      .attr("class", "grid-lines")
      .selectAll("line")
      .data(monthTicks)
      .enter()
      .append("line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", -margin.top)
      .attr("y2", height + margin.bottom)
      .attr("stroke", "#606676")
      .attr("stroke-opacity","1")
      .attr("stroke-width", 1.5)
  }
  else if(scale === "years"){
      const yearTicks = d3.timeYears(startDate, endDate);
      const monthTicks = d3.timeMonths(startDate, endDate);
      const yearLabelHeight = margin.top / 2;

      // Year labels
      svg.append("g")
        .attr("class", "x-axis-years")
        .attr("transform", `translate(0, ${-margin.bottom})`)
        .selectAll(".year-label")
        .data(yearTicks)
        .enter().append("text")
        .attr("class", "year-label")
        .attr("x", d => x(d) + (x(new Date(d.getFullYear() + 1, 0, 1)) - x(d)) / 2)
        .attr("y", -margin.bottom)
        .style("text-anchor", "start")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(d => d.getFullYear());

      // Month labels (first letter)
      svg.append("g")
    .attr("class", "x-axis-months")
    .attr("transform", `translate(0, 0)`)
    .selectAll(".month-label")
    .data(monthTicks)
    .enter().append("text")
    .attr("class", "month-label")
    .attr("x", d => {
      const monthStart = x(d);
      const monthEnd = x(new Date(d.getFullYear(), d.getMonth() + 1, 0));
      return monthStart + (monthEnd - monthStart) / 2;
    })
    .attr("y",  -10)
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .text(d => d3.timeFormat("%b")(d).charAt(0));

      // Add year separators
      svg.append("g")
        .attr("class", "year-separators")
        .selectAll("line")
        .data(yearTicks)
        .enter()
        .append("line")
        .attr("x1", d => x(d))
        .attr("x2", d => x(d))
        .attr("y1", -margin.top)
        .attr("y2", height + margin.bottom)
        .attr("stroke", "#606676")
        .attr("stroke-opacity", "1")
        .attr("stroke-width", 1.5);

      // Add month separators
      svg.append("g")
        .attr("class", "month-separators")
        .selectAll("line")
        .data(monthTicks)
        .enter()
        .append("line")
        .attr("x1", d => x(d))
        .attr("x2", d => x(d))
        .attr("y1", -margin.top/2)
        .attr("y2", height + margin.bottom)
        .attr("stroke", "#606676")
        .attr("stroke-opacity", "1")
        .attr("stroke-width", 1);

  }
  else{

    // Generate week tick positions for each month
    const weekTicks = monthTicks.flatMap(d => {
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const daysInMonth = (nextMonth - firstDay) / (1000 * 60 * 60 * 24);
      const weekInterval = daysInMonth / 4;
      return d3.range(0, 4).map(i => new Date(firstDay.getTime() + (weekInterval * i) * (1000 * 60 * 60 * 24)));
    });

    // Create week labels data
    const weekLabels = weekTicks.map((d, i) => ({
      date: new Date(d.getTime() + (weekTicks[1] - weekTicks[0]) / 2),
      label: `${(i % 4) + 1}w`
    }));
    

    // Draw axes
    const xAxisMonths = d3.axisTop(x)
      .tickValues(monthTicks)
      .tickFormat(d3.timeFormat("%B"))
      .tickSize(0)

    const xAxisWeeks = d3.axisTop(x)
      .tickValues(weekTicks)
      .tickFormat((d, i) => `${(i % 4) + 1}w`)
      .tickSize(10);

    


    // Compute the width of each month interval
    const monthWidth = (width / monthTicks.length);

    // Add month labels to the chart
    svg.append("g")
    .attr("class", "x-axis-months")
    .attr("transform", `translate(0, ${-margin.bottom})`)
    .selectAll(".month-label")
    .data(monthTicks)
    .enter().append("text")
    .attr("class", "month-label")
    .attr("x", d => x(d) + monthWidth / 2) // Adjust x position to center labels
    .attr("y", -margin.bottom)
    .style("text-anchor", "middle") // Center the text itself
    .text(d => d3.timeFormat("%B")(d)); 

      // Add week labels to the chart
    svg.append("g")
    .attr("class", "x-axis-weeks")
    .attr("transform", `translate(0, 0)`)
    .selectAll(".week-label")
    .data(weekLabels)
    .enter().append("text")
    .attr("class", "week-label")
    .attr("x", d => x(d.date))
    .attr("y", -12)
    .style("text-anchor", "middle")
    .text(d => d.label);

    //week seperator
    svg.append("g")
      .attr("class", "week-separators")
      .selectAll("line")
      .data(weekTicks)
      .enter()
      .append("line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", -margin.top/2)
      .attr("y2", 0)
      .attr("stroke", "#606676")
      .attr("stroke-opacity","1")
      .attr("stroke-width", 1.5)

    // Add grid lines
    svg.append("g")
      .attr("class", "grid-lines")
      .selectAll("line")
      .data(monthTicks)
      .enter()
      .append("line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", -margin.top)
      .attr("y2", height + margin.bottom)
      .attr("stroke", "#606676")
      .attr("stroke-opacity","1")
      .attr("stroke-width", 1.5)


      // const quarterLines = monthTicks.flatMap(d => {
      //   const startOfMonth = x(d);
      //   const endOfMonth = x(new Date(d.getFullYear(), d.getMonth() + 1, 1));
      //   const daysInMonth = (new Date(d.getFullYear(), d.getMonth() + 1, 0) - d) / (1000 * 60 * 60 * 24);
      //   const daysFromStartDate = (endOfMonth - startOfMonth) / daysInMonth;
      //   const quarterPositions = [1, 2, 3].map(i => startOfMonth + i * daysFromStartDate * (daysInMonth / 4));
      
      //   return quarterPositions;
      // });

      
    }
    

    // Add week separators in header

      // svg.append("g")
      // .attr("class", "quarter-separators")
      // .selectAll("line")
      // .data(quarterLines)
      // .enter()
      // .append("line")
      // .attr("x1", d => d)
      // .attr("x2", d => d)
      // .attr("y1", 0)
      // .attr("y2", 40)
      // .attr("stroke", "grey")
      // .attr("stroke-dasharray", "4,2");


    // Add horizontal line below header
    svg.append("line")
      .attr("x1", -margin.left)
      .attr("x2", width + margin.right)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#606676")
      .attr("stroke-opacity","1")
      .attr("stroke-width", 2);

    // Add horizontal line between months and weeks
    svg.append("line")
    .attr("x1", 0)
    .attr("x2", width + margin.right)
    .attr("y1", -margin.top/2)
    .attr("y2", -margin.top/2)
    .attr("stroke", "#606676")
      .attr("stroke-opacity","1")
    .attr("stroke-width", 2);

    // Add horizontal lines between tasks
    svg.selectAll(".task-separator")
      .data(validData.slice(0, -1)) // Exclude the last task
      .enter()
      .append("line")
      .attr("class", "task-separator")
      .attr("x1", -margin.left)
      .attr("x2", width + margin.right)
      .attr("y1", d => y(d.task) + y.bandwidth() + y.bandwidth()/2)
      .attr("y2", d => y(d.task) + y.bandwidth() + y.bandwidth()/2)
      .attr("stroke", "#606676")
      .attr("stroke-opacity","0.6")
      .attr("stroke-width", 1);

    // Add "Task Name" header
    svg.append("text")
      .attr("x", -( margin.left + margin.right)/2)
      .attr("y", -margin.top / 2)
      .attr("font-weight", "bold")
      .text("Task Name");

    // Create tooltip
    const tooltip = d3
    .select(chartRef.current)
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.7)')
    .style('color', 'white')
    .style('padding', '10px')
    .style('border-radius', '5px')
    .style('font-size', '14px')
    .style('pointer-events', 'none')
    .style('opacity', 0);


    // Draw bars
    const taskGroups = svg.selectAll(".task")
    .data(validData)
    .enter()
    .append("g")
    .attr("class", "task")
    .attr("transform", d => `translate(0, ${y(d.task)})`)
  
  const barHeight = y.bandwidth() / 2; // Adjust this value to control the height of the bars and the gap
  
  taskGroups.append("rect")
  .attr("class", "planned")
  .attr("x", d => x(d.plannedStart))
  .attr("y", 0)
  .attr("width", d => Math.max(0, x(d.plannedEnd) - x(d.plannedStart)))
  .attr("height", barHeight)
  .attr("fill", "#37B5B6")
  .on("mouseenter", function (event, d) {
    d3.select(this).attr('opacity', 0.6);

    const [mouseX, mouseY] = d3.pointer(event);
    const barWidth = d.actualEnd ? x(d.actualEnd) - x(d.actualStart) : x(d.plannedEnd) - x(d.actualStart);
    const tooltipX = x(d.actualStart || d.plannedStart) + barWidth;
    const tooltipY = y(d.task) + barHeight * 1.5 + 2;

    tooltip
      .style('opacity', 1)
      .html(`
        <strong>Task:</strong> ${d.task}<br>
        <strong>Planned Start:</strong> ${d3.timeFormat("%Y-%m-%d")(d.plannedStart)}<br>
        <strong>Planned End:</strong> ${d3.timeFormat("%Y-%m-%d")(d.plannedEnd)}
      `)
      .style('left', `${tooltipX}px`)
      .style('top', `${tooltipY}px`)
      .style('transform', 'translate(-50%, -100%)');
  })
  .on("mouseleave", function () {
    d3.select(this).attr('opacity', 1);
    tooltip.style('opacity', 0);
  });

  
  
  taskGroups.append("rect")
  .attr("class", "actual")
  .attr("x", d => d.actualStart ? x(d.actualStart) : x(d.plannedStart))
  .attr("y", barHeight + 2)
  .attr("width", d => {
    if (d.actualStart && d.actualEnd) {
      return Math.max(0, x(d.actualEnd) - x(d.actualStart));
    } else if (d.actualStart) {
      return Math.max(0, x(d.plannedEnd) - x(d.actualStart));
    }
    return 0;
  })
  .attr("height", barHeight)
  .attr("fill", "#0A1D56")
  .on("mouseenter", function (event, d) {
    d3.select(this).attr('opacity', 0.6);

    const [mouseX, mouseY] = d3.pointer(event);
    const barWidth = d.actualEnd ? x(d.actualEnd) - x(d.actualStart) : x(d.plannedEnd) - x(d.actualStart);
    const tooltipX = x(d.actualStart || d.plannedStart) + barWidth;
    const tooltipY = y(d.task) + barHeight * 1.5 + 2;

    tooltip
      .style('opacity', 1)
      .html(`
        <strong>Task:</strong> ${d.task}<br>
        <strong>Actual Start:</strong> ${d.actualStart ? d3.timeFormat("%Y-%m-%d")(d.actualStart) : 'N/A'}<br>
        <strong>Actual End:</strong> ${d.actualEnd ? d3.timeFormat("%Y-%m-%d")(d.actualEnd) : 'N/A'}
      `)
      .style('left', `${tooltipX}px`)
      .style('top', `${tooltipY}px`)
      .style('transform', 'translate(-50%, -100%)');
  })
  .on("mouseleave", function () {
    d3.select(this).attr('opacity', 1);
    tooltip.style('opacity', 0);
  });

    // Add border to the entire chart
    svg.append("rect")
      .attr("x", -margin.left)
      .attr("y", -margin.top)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top)
      .attr("fill", "none")
      .attr("stroke", "#606676")
      .attr("stroke-opacity","1")
      .attr("stroke-width", 4)

    // Adjust font sizes based on screen width
    const baseFontSize = Math.max(16, Math.min(16, width / 100));
    svg.selectAll("text")
      .style("font-size", `${baseFontSize}px`);

    svg.selectAll(".month-label, .year-label")
      .style("font-size", `${baseFontSize}px`);

    console.log("Chart drawing completed");
  };

  return <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
  <div ref={chartRef} style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}></div>
</div>
};

export default GanttChart;