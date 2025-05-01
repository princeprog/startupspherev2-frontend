import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2"; // Import Doughnut and Line components

import Card from "../components/Card";
import CardContent from "../components/CardContent";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default function StartupDashboard() {
  const [likes, setLikes] = useState(null);
  const [startupIds, setStartupIds] = useState([]);
  const [bookmarks, setBookmarks] = useState(null);
  const [views,setViews] = useState(null)

  const fetchStartupIds = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/startups/my-startups",
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log("Startup IDs fetched successfully: ", data);
        setStartupIds(data);
        fetchLikes(data);
        fetchBookmarks(data);
        fetchViews(data)
      } else {
        console.log("Error fetching startup IDs: ", data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLikes = async (ids) => {
    try {
      let totalLikes = 0;
      for (const id of ids) {
        const response = await fetch(
          `http://localhost:8080/api/likes/count/startup/${id}`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        if (response.ok) {
          console.log(`Likes for startup ${id}: `, data);
          totalLikes += data;
        } else {
          console.log(`Error fetching likes for startup ${id}: `, data);
        }
      }

      setLikes(totalLikes);
      console.log("Total likes: ", totalLikes);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchBookmarks = async (ids) => {
    try {
      let totalBookmarks = 0;
      for (const id of ids) {
        const response = await fetch(
          `http://localhost:8080/api/bookmarks/count/startup/${id}`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        if (response.ok) {
          console.log(`Bookmarks for startup ${id}: `, data);
          totalBookmarks += data;
        } else {
          console.log(`Error fetching bookmarks for startup ${id}: `, data);
        }
      }

      setBookmarks(totalBookmarks);
      console.log("Total bookmarks: ", totalBookmarks);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchViews = async (ids) => {
    try {
      let totalViews = 0;
      for (const id of ids) {
        const response = await fetch(
          `http://localhost:8080/startups/${id}/view-count`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        if (response.ok) {
          console.log(`views for startup ${id}: `, data);
          totalViews += data;
        } else {
          console.log(`Error fetching views for startup ${id}: `, data);
        }
      }

      setViews(totalViews);
      console.log("Total bookmarks: ", totalViews);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStartupIds();
  }, []);

  const centerTextPlugin = {
    id: "centerText",
    beforeDraw(chart) {
      const { width, height, ctx } = chart;
      ctx.save();

      const text = chart.config.data.labels[0] || "";

      // Adjust font size to fit in the inner circle of the doughnut
      let fontSize = Math.min(width, height) / 10; // You can tweak the divisor (e.g., 10)
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillStyle = "#3b82f6"; // Customize text color

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillText(text, centerX, centerY);
      ctx.restore();
    },
  };

  const donutData = {
    labels: ["Pinoy Tech Solutions"],
    datasets: [
      {
        data: [100],
        backgroundColor: ["#3b82f6"],
        borderWidth: 0,
      },
    ],
  };

  const companyInfo = {
    companyName: "TechNova",
    foundedDate: "2020",
    typeOfCompany: "Software",
    industry: "Information Technology",
    contactEmail: "contact@technova.com",
    phoneNumber: "+1234567890",
    locationName: "San Francisco, CA",
    website: "https://technova.com",
  };

  const engagementData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Likes",
        data: [5, 10, 8, 12, 7, 15, 10],
        borderColor: "#3b82f6",
        fill: false,
      },
      {
        label: "Bookmarks",
        data: [3, 5, 4, 6, 5, 8, 6],
        borderColor: "#10b981",
        fill: false,
      },
      {
        label: "Views",
        data: [20, 30, 25, 35, 28, 45, 38],
        borderColor: "#f59e0b",
        fill: false,
      },
    ],
  };

  return (
    <div className="p-18 px-42 space-y-6 border-amber-300 bg-white text-black">
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Search Startups"
          className="input input-bordered w-full max-w-xs bg-white border-gray-300 border-2"
        />
        <div className="space-x-2">
          <button className="btn btn-primary btn-sm">All</button>
          <button className="btn btn-outline btn-sm">Likes</button>
          <button className="btn btn-outline btn-sm">Bookmarks</button>
          <button className="btn btn-outline btn-sm">Views</button>
        </div>
      </div>

      <div className="stats shadow w-full text-black">
        <div className="stat place-items-center">
          <div className="stat-title text-black">Views</div>
          <div className="stat-value">{views}</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title text-black">Bookmarks</div>
          <div className="stat-value text-secondary ">{bookmarks}</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title text-black">Likes</div>
          <div className="stat-value">{likes}</div>
        </div>
      </div>
      <div className="flex">
        <div className="card w-full p-4 bg-white shadow-md rounded-md">
          <h3 className="text-lg font-bold text-blue-900">1 Total Startups</h3>
          <div className="text-center flex items-center justify-evenly text-sm font-semibold text-gray-400">
            <div className="mx-4">
              <p>Views</p>
              <p className="text-2xl"> 18 👁️</p>
            </div>
            <div className="mx-4">
              <p>Likes</p>
              <p className="text-2xl">1 👍</p>
            </div>
            <div className="mx-4">
              <p>Bookmarks</p>
              <p className="text-2xl"> 1 📘</p>
            </div>
          </div>
          <div className="w-40 h-40 mx-auto p-1 border-4 border-blue-900 mt-2 rounded-full flex items-center justify-center">
            <Doughnut
              data={donutData}
              options={{
                plugins: {
                  legend: {
                    display: false, // Hide the default legend
                  },
                },
              }}
              plugins={[centerTextPlugin]} // Add the custom plugin
            />
          </div>
        </div>

        <Card className="w-full">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Engagement Over Time</h2>
            <div className="w-full h-64">
              {" "}
              {/* Adjust the width and height */}
              <Line
                data={engagementData}
                options={{
                  maintainAspectRatio: false, // Disable aspect ratio to allow custom sizing
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: "Days of the Week",
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: "Engagement Metrics",
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-1">
          <h2 className="text-xl font-semibold mb-2">Company Profile</h2>
          <p>
            <strong>Name:</strong> {companyInfo.companyName}
          </p>
          <p>
            <strong>Founded:</strong> {companyInfo.foundedDate}
          </p>
          <p>
            <strong>Type:</strong> {companyInfo.typeOfCompany}
          </p>
          <p>
            <strong>Industry:</strong> {companyInfo.industry}
          </p>
          <p>
            <strong>Email:</strong> {companyInfo.contactEmail}
          </p>
          <p>
            <strong>Phone:</strong> {companyInfo.phoneNumber}
          </p>
          <p>
            <strong>Location:</strong> {companyInfo.locationName}
          </p>
          <p>
            <strong>Website:</strong>{" "}
            <a href={companyInfo.website} className="text-blue-500 underline">
              {companyInfo.website}
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
