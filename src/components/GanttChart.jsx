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
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

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
      .padding(0.4);

    // Create custom tick values for months and weeks
    const monthTicks = d3.timeMonths(...x.domain());
    const weekTicks = d3.timeWeeks(...x.domain());

    // Draw axes
    const xAxisMonths = d3.axisTop(x)
      .tickValues(monthTicks)
      .tickFormat(d3.timeFormat("%B"))
      .tickSize(0);

    const xAxisWeeks = d3.axisTop(x)
      .tickValues(weekTicks)
      .tickFormat((d, i) => `${(i % 4) + 1}w`)
      .tickSize(0);

    svg.append("g")
      .attr("class", "x-axis-months")
      .call(xAxisMonths);

    svg.append("g")
      .attr("class", "x-axis-weeks")
      .attr("transform", `translate(0, 30)`)
      .call(xAxisWeeks);

    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

    // Add grid lines
    svg.append("g")
      .attr("class", "grid-lines")
      .selectAll("line")
      .data(monthTicks)
      .enter()
      .append("line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", 0)
      .attr("y2", height);

    // Add week separators in header
    svg.append("g")
      .attr("class", "week-separators")
      .selectAll("line")
      .data(weekTicks)
      .enter()
      .append("line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", 0)
      .attr("y2", 60);

    // Add horizontal line below header
    svg.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", 60)
      .attr("y2", 60)
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Add "Task Name" header
    svg.append("text")
      .attr("x", -margin.left + 10)
      .attr("y", -50)
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
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("stroke", "black");

    console.log("Chart drawing completed");
  };

  return <div ref={chartRef}></div>;
};

export default GanttChart;