import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * @param param0 
 * @returns 
 */
const BarChart = ({ barstyle, data, interval, bardatastyle, title, titlecolor, width, height, yaxislabelstyle, xaxislabelstyle, gridcolor, gridstatus, yaxisstyle, xaxisstyle, xaxistext, yaxistext }) => {
    const svgRef = useRef(null);
    const [showGridLines, setShowGridLines] = useState(true);
	const [hideError, SethideError] = useState(true)
	const [hideColor, SethideColor] = useState(false)
	const [colorBar, SetcolorBar] = useState(barstyle.color)
	const [colorError, SetcolorError] = useState("#000000")
	const [colorLabel, SetcolorLabel] = useState("black")
    const [ylabel,setylabel] = useState(yaxistext)
    const [xlabel,setxlabel] = useState(xaxistext)
    const [FontWeight, SetFontWeight] = useState(false)
    const [fontSize, SetFontSize] = useState('16');

    useEffect(() => {
        console.log("Data:::::::::::",colorBar)
        // Define the chart dimensions
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        const intervaldata = interval;

        const svg = d3
            .select(svgRef.current)
            .append('svg')
            .attr('width', width + margin.right)
            .attr('height', height + margin.bottom)
            .append('g')
            .style("overflow", "scroll")
            .style('fill', colorBar)
            .attr('transform', `translate(0,20)`)


        // Create scales
        const xScale = d3
            .scaleBand()
            .domain(data.map((d) => d.variable))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => parseInt(d.percentage) + parseInt(d.error))+10])
            .range([height - margin.bottom, margin.top]);


        // Draw x-axis
        const xAxis = svg
            .append('g')
            .attr('transform', `translate(${margin.left}, ${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style('font-weight', xaxislabelstyle.fontweight)
            .style('font-size', xaxislabelstyle.fontsize)
            .style("text-anchor", "end")
            .attr("dx", "0em")
            .attr("dy", "0em")
            .attr("transform", `rotate(${xaxislabelstyle.rotate})`);

        // Draw y-axis and set interval for ticks
        const yAxis = svg
            .append('g')
            .attr('transform', `translate(${margin.left + margin.left},${margin.bottom})`)
            .call(d3.axisLeft(yScale).tickValues(d3.range(0, d3.max(data, (d) => parseInt(d.percentage) + parseInt(d.error)), intervaldata)))
            .style('font-weight', yaxislabelstyle.fontweight)
            .style('font-size', yaxislabelstyle.fontsize);


        // Draw gridlines
        // svg
        // .append('g')
        // .attr('class', 'grid')
        // .style('color',gridcolor)
        // .attr('transform', `translate(50,${height})`)
        // .style("stroke-dasharray", "5 5")
        // .style("visibility",gridstatus)
        // .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(''));

        svg
            .append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(80,30)`)
            .style("stroke-dasharray", "5 5")
            .style("color", gridcolor)
            .style("z-index", -1)
            .style("visibility", showGridLines ? "visible" : "hidden")
            .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(''));

            const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Or any other color scheme

        // Draw bars
        svg
            .selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('transform', `translate(${margin.left},${margin.bottom}) `)
            .attr('x', (d) => xScale(d.variable))
            .attr('width', xScale.bandwidth())
            .attr('y', (d) => yScale(d.percentage))
            .attr('height', (d) => height - margin.bottom - yScale(d.percentage))
            .style('fill', d => colorScale(d))
            .on("mouseenter", function (d) {
                d3.select(d.currentTarget)
                    .transition()
                    .duration(100)
                    .attr('opacity', 0.6);

                // Show tooltip on mouseover
                tooltip.transition().duration(200).style('opacity', 0.9);
                tooltip.html(`${d.target.__data__.variable}: ${d.target.__data__.percentage}`)
                    .style('left', `${d.pageX - margin.left * 5}px`)
                    .style('top', `${d.pageY}px`);

            })
            .on("mouseleave", function (d) {
                d3.select(d.currentTarget)
                    .transition()
                    .duration(200)
                    .attr('opacity', 1)
                //remove tooltip
                tooltip.transition().duration(500).style('opacity', 0);

            });

        // Create tooltip
        const tooltip = d3
            .select(svgRef.current)
            .append('div')
            .style('position', 'absolute')
            .style('background', '#f4f4f4')
            .style('padding', '5px')
            .style('border', '1px solid #ccc')
            .style('border-radius', '5px')
            .style('color', "red")
            .style('opacity', 0);

            if(hideError){ 
        // Add values on top of bars
        svg
            .selectAll('.bar-value')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'bar-value')
            .attr('transform', `translate(${margin.left-10},${margin.top-5})`)
            .attr('x', (d) => xScale(d.variable) + xScale.bandwidth() / 2)
            .attr('y', (d) => yScale(d.percentage) + 12)
            .attr('text-anchor', 'middle')
            .style('fill', bardatastyle.color)
            .style('font-weight', bardatastyle.fontweight)
            .style('font-size', bardatastyle.fontsize)
            .style('visibility', bardatastyle.visible)
            .text((d) => d.percentage)
            // Sort data by value
             data.sort((a, b) => b.value - a.value);

            // Exclude top two values
            const remainingData = data.slice(2);

            svg
            .selectAll('.bar-valuetop')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'bar-valuetop')
            .attr('transform', `translate(${margin.left},${margin.top+10})`)
            .attr('x', (d) => xScale(d.variable) + xScale.bandwidth() / 2)
            .attr('y', (d) => yScale(parseInt(d.percentage) + parseInt(d.error)))
            .attr('text-anchor', 'middle')
            .style('fill', bardatastyle.color)
            .style('font-weight', bardatastyle.fontweight)
            .style('font-size', bardatastyle.fontsize)
            .style('visibility', bardatastyle.visible)
            .text((d) => d.error ? d.percentage+d.error:"");

            svg
            .selectAll('.bar-valuebottom')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'bar-valuebottom')
            .attr('transform', `translate(${margin.left},${margin.top+20})`)
            .attr('x', (d) => xScale(d.variable) + xScale.bandwidth() / 2)
            .attr('y', (d) => yScale(parseInt(d.percentage) - parseInt(d.error)))
            .attr('text-anchor', 'middle')
            .style('fill', bardatastyle.color)
            .style('font-weight', bardatastyle.fontweight)
            .style('font-size', bardatastyle.fontsize)
            .style('visibility', bardatastyle.visible)
            .text((d) => d.error ?  d.percentage-d.error : "");

         

            // Error bars
            svg.selectAll('.error-bar')
            .data(data)
            .enter().append('line')
            .attr('class', 'error-bar')
            .attr('transform', `translate(${margin.left},${margin.bottom}) `)
            .attr('x1', d => xScale(d.variable) + xScale.bandwidth() / 2)
            .attr('y1', d => yScale(d.percentage-d.error) ) // Adjust as needed
            .attr('x2', d => xScale(d.variable) + xScale.bandwidth() / 2)
            .attr('y2', d => yScale(d.percentage+d.error)) // Adjust as needed
            .attr('stroke', colorError);
            }else{
                 // Add values on top of bars
            svg
            .selectAll('.bar-value')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'bar-value')
            .attr('transform', `translate(${margin.left-10},${margin.top-5})`)
            .attr('x', (d) => xScale(d.variable) + xScale.bandwidth() / 2)
            .attr('y', (d) => yScale(d.percentage) + 12)
            .attr('text-anchor', 'middle')
            .style('fill', bardatastyle.color)
            .style('font-weight', bardatastyle.fontweight)
            .style('font-size', bardatastyle.fontsize)
            .style('visibility', bardatastyle.visible)
            .text((d) => d.percentage)
            }
            

        //add x axis label
        svg.append('text')
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom + 10)
            .style('fill',colorLabel)
            .style('font-weight',FontWeight ? "700":"100")
            .style('font-size',fontSize)
            .text(xlabel)
            .on("click",() =>{
                let label = prompt("Edit X Axis Label")
                if(label){
                    setxlabel(label)
                }
              });

        //add y axis label
        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", margin.left)
            .attr("x", -height / 2)
            .attr("transform", "rotate(-90)")
            .style('fill',colorLabel)
            .style('font-weight',FontWeight ? "700":"100")
            .style('font-size',fontSize)
            .text(ylabel)
            .on("click",() =>{
                let label = prompt("Edit Y Axis Label")
                if(label){
                setylabel(label)
                }
              });

        //title of the chart
        svg.append('text')
            .attr('class', 'title')
            .attr('x', width / 2 + margin.left)
            .attr('y', height / 5 - 3)
            .attr('text-anchor', 'middle')
            .style('font-size', titlecolor.fontsize)
            .style('font-weight', titlecolor.fontweight)
            .style('fill', titlecolor.color)
            .text(title)


        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", zoomed);

        svg.call(zoom);


        function zoomed(event) {
            const { transform } = event;
            svg.style("transform", `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`);
            svg.select(".x-axis").call(xAxis.scale(transform.rescaleX(xScale)));
            // svg.select(".y-axis").call(yAxis.scale(transform.rescaleY(yScale)));
        }


        return () => {
            d3.select(svgRef.current).selectAll('*').remove();
        };
    }, [data, showGridLines,hideError,colorBar,colorError,colorLabel,ylabel,xlabel,FontWeight,fontSize]);

    const handleFontSizeChange = (event) =>{
        SetFontSize(event.target.value);
    
      }

    return <>
        <div ref={svgRef}></div>
    </>
};

// BarChart.prototype = {
//     data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
//     width: PropTypes.number,
//     heigth: PropTypes.number,
//     interval: PropTypes.number,
//     barstyle: PropTypes.object,
//     bardatastyle: PropTypes.object,
//     gridcolor: PropTypes.string,
//     gridstatus: PropTypes.string,
//     yaxistext: PropTypes.string,
//     yaxislabelstyle: PropTypes.object,
//     yaxisstyle: PropTypes.object,
//     xaxistext: PropTypes.string,
//     xaxislabelstyle: PropTypes.object,
//     xaxisstyle: PropTypes.object,
//     title: PropTypes.string,
//     titlecolor: PropTypes.object
// }

/**
 * from data replace label as variable and value as percentage
 */
// BarChart.defaultProps = {
//     data: [
//         { label: 'param1', value: 30 },
//         { label: 'param2', value: 50 }],
//     width: "600",
//     height: "400",
//     interval: 1,
//     barstyle: { color: "#000", hover: "#ccc", interval: 5 },
//     bardatastyle: { fontsize: "16px", fontweight: "500", color: "#000" },
//     gridcolor: "#ccc",
//     gridstatus: "hidden",
//     yaxistext: "Y Label",
//     yaxislabelstyle: { fontsize: "14px", fontweight: "400", color: "red" },
//     yaxisstyle: { fontsize: "14px", fontweight: "600", color: "#000" },
//     xaxistext: "X Label",
//     xaxislabelstyle: { fontsize: "14px", fontweight: "400", color: "red" },
//     xaxisstyle: { fontsize: "14px", fontweight: "600", color: "#000" },
//     title: "Bar Chart",
//     titlecolor: { fontsize: "24px", fontweight: "600", color: "#000" }
// }
export default BarChart;
