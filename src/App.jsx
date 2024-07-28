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
  const monthsData = [
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
    {
      task: 'Task 3',
      plannedStart: '2024-03-01',
      plannedEnd: '2024-04-15',
      actualStart: '2024-03-10',
      actualEnd: '2024-04-25'
    },
    {
      task: 'Task 4',
      plannedStart: '2024-04-01',
      plannedEnd: '2024-05-15',
      actualStart: '2024-04-10',
      actualEnd: '2024-05-25'
    },
    {
      task: 'Task 5',
      plannedStart: '2024-05-01',
      plannedEnd: '2024-06-15',
      actualStart: '2024-05-10',
      actualEnd: '2024-06-25'
    },
    {
      task: 'Task 6',
      plannedStart: '2024-06-01',
      plannedEnd: '2024-07-15',
      actualStart: '2024-06-10',
      actualEnd: '2024-07-25'
    },
    {
      task: 'Task 7',
      plannedStart: '2024-07-01',
      plannedEnd: '2024-08-15',
      actualStart: '2024-07-10',
      actualEnd: '2024-08-25'
    },
    {
      task: 'Task 8',
      plannedStart: '2024-08-01',
      plannedEnd: '2024-09-15',
      actualStart: '2024-08-10',
      actualEnd: '2024-09-25'
    },
    // More tasks...
  ];
  const daysData = [
    {
      task: 'Task 1',
      plannedStart: '2024-02-01',
      plannedEnd: '2024-02-05',
      actualStart: '2024-02-02',
      actualEnd: '2024-02-06'
    },
    {
      task: 'Task 2', 
      plannedStart: '2024-02-07',
      plannedEnd: '2024-02-15',
      actualStart: '2024-02-08',
      actualEnd: '2024-02-18'
    },
    {
      task: 'Task 3',
      plannedStart: '2024-02-18',
      plannedEnd: '2024-02-25',
      actualStart: '2024-02-19',
      actualEnd: '2024-02-26'
    },
    // More tasks...
  ];
  const yearsData = [
    {
      task: 'Task 1',
      plannedStart: '2024-02-01',
      plannedEnd: '2025-02-05',
      actualStart: '2024-03-02',
      actualEnd: '2025-03-06'
    },
    {
      task: 'Task 2', 
      plannedStart: '2024-06-07',
      plannedEnd: '2025-04-15',
      actualStart: '2024-07-08',
      actualEnd: '2025-05-18'
    },
    {
      task: 'Task 3',
      plannedStart: '2025-02-18',
      plannedEnd: '2026-01-25',
      actualStart: '2025-04-19',
      actualEnd: '2026-03-26'
    },
    {
      task: 'Task 4',
      plannedStart: '2025-08-18',
      plannedEnd: '2026-07-25',
      actualStart: '2025-09-19',
      actualEnd: '2026-09-26'
    },
    // More tasks...
  ];
  return (
    <div className="container">
      {/* <GanttChart data={data} /> */}
      <GanttChart data={yearsData} scale={"year"}/>
      {/* <GanttChart data={daysData} scale={"days"}/> */}
      {/* <GanttChart data={monthsData} scale={"month"}/> */}
      {/* <BarChart {...sampleData} /> */}
    </div>
  );
};

export default App;
