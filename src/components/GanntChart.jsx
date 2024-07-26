import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const GanntChart = ({ data }) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth * 0.8; // 80% of window width
      const height = window.innerHeight * 0.5; // 50% of window height
      setDimensions({ width, height });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const { width, height } = dimensions;
    const margin = { top: 20, right: 30, bottom: 40, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear existing content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain([
        new Date(d3.min(data, (d) => d.start)),
        new Date(d3.max(data, (d) => d.end)),
      ])
      .range([0, innerWidth]);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.task))
      .range([0, innerHeight])
      .padding(0.1);

    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .attr("class", "axis")
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeDay.every(1))
          .tickFormat(d3.timeFormat("%b %d"))
      );

    svg.append("g").attr("class", "axis").call(d3.axisLeft(y).tickSize(0));

    // Append bars
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(new Date(d.start)))
      .attr("y", (d) => y(d.task))
      .attr("width", (d) => x(new Date(d.end)) - x(new Date(d.start)))
      .attr("height", y.bandwidth());

    // Append task labels
    svg
      .selectAll(".task-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "task-label")
      .attr("x", (d) => x(new Date(d.start)) + 5) // Add some padding
      .attr("y", (d) => y(d.task) + y.bandwidth() / 2)
      .attr("dy", "0.35em") // Align text vertically centered
      .text((d) => d.task)
      .style("fill", "black")
      .style("font-size", "10px");
  }, [data, dimensions]);

  return <svg ref={svgRef}></svg>;
};

export default GanntChart;
