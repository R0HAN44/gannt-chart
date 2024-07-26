import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './GanttChart.css';

const GanttChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (data && chartRef.current) {
      drawChart();
    }
  }, [data]);

  const drawChart = () => {
    console.log("Original data:", data);

    const margin = { top: 80, right: 30, bottom: 30, left: 150 };
    const width = 1200 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class","svg-comp")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

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
    const x = d3.scaleTime()
      .domain([
        d3.min(validData, d => d.plannedStart),
        d3.max(validData, d => d.actualEnd || d.plannedEnd)
      ])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(validData.map(d => d.task))
      .range([0, height])
      .padding(0.5)
      .align(0.8);
      

    // Create custom tick values for months and weeks
    const monthTicks = d3.timeMonths(...x.domain());
    const weekTicks = d3.timeWeeks(...x.domain());

    // Draw axes
    const xAxisMonths = d3.axisTop(x)
      .tickValues(monthTicks)
      .tickFormat(d3.timeFormat("%B"))
      .tickSize(0)

    const xAxisWeeks = d3.axisTop(x)
      .tickValues(weekTicks)
      .tickFormat((d, i) => `${(i % 4) + 1}w`)
      .tickSize(10);

    const yAxis = d3.axisLeft(y)
      .tickSize(0)

    svg.append("g")
      .attr("class", "x-axis-months")
      .attr("transform",`translate(0, ${-margin.bottom})`)
      .selectAll(".month-label")
      .data(monthTicks)
      .enter().append("text")
      .attr("class", "month-label")
      .attr("x", d => x(d))
      .attr("y", -margin.bottom)
      .text(d => d3.timeFormat("%B")(d));

    svg.append("g")
      .attr("class", "x-axis-weeks")
      .attr("transform", `translate(0, 0)`)
      .call(xAxisWeeks);

    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(-10, 0)`)
      .call(yAxis)



      const quarterLines = monthTicks.flatMap(d => {
        const startOfMonth = x(d);
        const endOfMonth = x(new Date(d.getFullYear(), d.getMonth() + 1, 1));
        const daysInMonth = (new Date(d.getFullYear(), d.getMonth() + 1, 0) - d) / (1000 * 60 * 60 * 24);
        const daysFromStartDate = (endOfMonth - startOfMonth) / daysInMonth;
        const quarterPositions = [1, 2, 3].map(i => startOfMonth + i * daysFromStartDate * (daysInMonth / 4));
      
        return quarterPositions;
      });

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
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)

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

    
    // svg.append("g")
    //   .attr("class", "week-separators")
    //   .selectAll("line")
    //   .data(weekTicks)
    //   .enter()
    //   .append("line")
    //   .attr("x1", d => x(d))
    //   .attr("x2", d => x(d))
    //   .attr("y1", 0)
    //   .attr("y2", 40);

    // Add horizontal line below header
    svg.append("line")
      .attr("x1", -margin.left)
      .attr("x2", width + margin.right)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Add horizontal line between months and weeks
    svg.append("line")
    .attr("x1", 0)
    .attr("x2", width + margin.right)
    .attr("y1", -margin.top/2)
    .attr("y2", -margin.top/2)
    .attr("stroke", "black")
    .attr("stroke-width", 2);

    // Add "Task Name" header
    svg.append("text")
      .attr("x", -margin.left + margin.right)
      .attr("y", -margin.bottom)
      .attr("font-weight", "bold")
      .text("Task Name");

    // Draw bars
    const taskGroups = svg.selectAll(".task")
      .data(validData)
      .enter()
      .append("g")
      .attr("class", "task")
      .attr("transform", d => `translate(0, ${y(d.task) + y.bandwidth() / 4})`);

    taskGroups.append("rect")
      .attr("class", "planned")
      .attr("x", d => x(d.plannedStart))
      .attr("y", 0)
      .attr("width", d => Math.max(0, x(d.plannedEnd) - x(d.plannedStart)))
      .attr("height", y.bandwidth() / 4)
      .attr("fill", "blue");

    taskGroups.append("rect")
      .attr("class", "actual")
      .attr("x", d => d.actualStart ? x(d.actualStart) : x(d.plannedStart))
      .attr("y", y.bandwidth() / 4)
      .attr("width", d => {
        if (d.actualStart && d.actualEnd) {
          return Math.max(0, x(d.actualEnd) - x(d.actualStart));
        } else if (d.actualStart) {
          return Math.max(0, x(d.plannedEnd) - x(d.actualStart));
        }
        return 0;
      })
      .attr("height", y.bandwidth() / 4)
      .attr("fill", "red");

    // Add border to the entire chart
    svg.append("rect")
      .attr("x", -margin.left)
      .attr("y", -margin.top)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 4);

    console.log("Chart drawing completed");
  };

  return <div ref={chartRef}></div>;
};

export default GanttChart;