import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { GetAllTimeRegistrations } from "../api/authAPI"; // or correct import

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Statistics = () => {
  const [dataByProject, setDataByProject] = useState({});
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await GetAllTimeRegistrations();
        const timeData = response.data;

        const projectMap = {};
        let total = 0;

        timeData.forEach((entry) => {
          const project = entry.projectName || "Unassigned";
          const hours = entry.hours || 0;

          if (!projectMap[project]) {
            projectMap[project] = 0;
          }

          projectMap[project] += hours;
          total += hours;
        });

        setDataByProject(projectMap);
        setTotalHours(total);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };

    fetchStats();
  }, []);

  const chartData = {
    labels: Object.keys(dataByProject),
    datasets: [
      {
        label: "Hours per Project",
        data: Object.values(dataByProject),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Statistics</h2>
      <p>
        <strong>Total Hours Worked:</strong> {totalHours.toFixed(2)} hours
      </p>

      <div style={{ width: "100%", maxWidth: "700px", marginTop: "2rem" }}>
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default Statistics;
