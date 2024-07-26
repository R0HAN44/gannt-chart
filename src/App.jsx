import React from "react";
import GanntChart from "./components/GanntChart";
import GanttChart from "./components/GanttChart";
import BarChart from "./components/DGC";

const App = () => {
  const sampleData = {
    barstyle: { fill: 'steelblue', color: 'black' },
    data: [
      { label: 'January', value: 30 },
      { label: 'February', value: 20 },
      { label: 'March', value: 50 },
      { label: 'April', value: 40 },
      { label: 'May', value: 60 }
    ],
    interval: 'month',
    bardatastyle: { fontSize: '14px', fontWeight: 'bold' },
    title: 'Monthly Sales Data',
    titlecolor: 'black',
    width: 600,
    height: 400,
    yaxislabelstyle: { fill: 'gray', fontSize: '12px' },
    xaxislabelstyle: { fill: 'gray', fontSize: '12px' },
    gridcolor: 'lightgray',
    gridstatus: true,
    yaxisstyle: { stroke: 'black' },
    xaxisstyle: { stroke: 'black' },
    xaxistext: 'Months',
    yaxistext: 'Sales (in units)'
  };
  const data = [
    {
      task: 'Task 1',
      plannedStart: '2024-01-01',
      plannedEnd: '2024-02-15',
      actualStart: '2024-01-05',
      actualEnd: '2024-02-20'
    },
    {
      task: 'Task 2',
      plannedStart: '2024-02-01',
      plannedEnd: '2024-03-15',
      actualStart: '2024-02-10',
      actualEnd: '2024-03-25'
    },
    // More tasks...
  ];
  return (
    <div className="container">
      {/* <GanttChart data={data} /> */}
      <GanttChart data={data} />
      {/* <BarChart {...sampleData} /> */}
    </div>
  );
};

export default App;
