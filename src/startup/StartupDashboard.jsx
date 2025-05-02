import React, { useEffect, useState } from "react";
import { Select, Option } from "@material-tailwind/react";
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
import { useNavigate } from "react-router-dom";

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
  const [views, setViews] = useState(null);
  const [startups, setStartups] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [view, setView] = useState(null);
  const [bookmark, setBookmark] = useState(null);
  const [like, setLike] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        fetchViews(data);
      } else {
        console.log("Error fetching startup IDs: ", data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStartups = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/startups/my-startups/details",
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log("Startups fetched successfully: ", data);
        setStartups(data);
      } else {
        console.log("error fetching startups: ", data);
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

  const fetchViews2 = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/startups/${id}/view-count`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("Views fetched successfully: ", data);
        setView(data);
      } else {
        console.log("Error fetching views: ", data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchBookmarks2 = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/bookmarks/count/startup/${id}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("bookmarks fetched successfully: ", data);
        setBookmark(data);
      } else {
        console.log("Error fetching bookmarks: ", data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLikes2 = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/likes/count/startup/${id}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("likes fetched successfully: ", data);
        setLike(data);
      } else {
        console.log("Error fetching likes: ", data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (selectedStartup) {
      fetchViews2(selectedStartup);
      fetchBookmarks2(selectedStartup);
      fetchLikes2(selectedStartup);
      fetchLikesGroupedByMonth(selectedStartup);
    }
    setLoading(false);
  }, [selectedStartup]);

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

  const handleChange = (e) => {
    const selectedId = e.target.value;
    setSelectedStartup(selectedId);
    console.log("Selected Startup ID: ", selectedId);
  };

  useEffect(() => {
    fetchStartupIds();
    fetchStartups();
  }, []);

  const centerTextPlugin = {
    id: "centerText",
    beforeDraw(chart) {
      const { width, height, ctx } = chart;
      ctx.save();

      const text = chart.config.data.labels[0] || "";

      let fontSize = Math.min(width, height) / 10;
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillStyle = "#3b82f6";

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

  const [engagementData, setEngagementData] = useState({
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "July",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Likes",
        data: Array(12).fill(0),
        borderColor: "#3b82f6",
        fill: false,
      },
      {
        label: "Bookmarks",
        data: [3, 5, 4, 0, 5, 8, 6],
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
  });

  const fetchLikesGroupedByMonth = async (startupId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/likes/grouped-by-month/startup/${startupId}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (response.ok) {
        console.log("Likes grouped by month fetched successfully: ", data);

        // Map the response to the chart data
        const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const likesData = months.map((month) => data[month] || 0);

        setEngagementData((prevData) => ({
          ...prevData,
          datasets: [
            {
              ...prevData.datasets[0],
              data: likesData,
            },
          ],
        }));
      } else {
        console.log("Error fetching likes grouped by month: ", data);
      }
    } catch (error) {
      console.log("Error fetching likes grouped by month: ", error);
    }
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
          <div className="flex items-center">
            <h3 className="text-lg font-bold text-blue-900 w-full">
              {startupIds.length} Total Startups
            </h3>
            <form className="max-w-sm mx-auto flex w-full">
              <label
                htmlFor="countries"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Select an option
              </label>
              <select
                value={selectedStartup} // Bind the state to the select element
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg 
           focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
           dark:bg-white dark:border-gray-600 dark:placeholder-gray-400 
           dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="">Select a startup</option>
                {startups.map((st) => (
                  <option value={st.id} key={st.id}>
                    {st.companyName}
                  </option>
                ))}
              </select>
            </form>
          </div>

          {selectedStartup ? (
            <>
              <div className="text-center flex items-center justify-evenly text-sm font-semibold text-gray-400">
                <div className="mx-4">
                  <p>Views</p>
                  <p className="text-2xl">{view} 👁️</p>
                </div>
                <div className="mx-4">
                  <p>Likes</p>
                  <p className="text-2xl">{like} 👍</p>
                </div>
                <div className="mx-4">
                  <p>Bookmarks</p>
                  <p className="text-2xl">{bookmark} 📘</p>
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
            </>
          ) : (
            <div className="text-xl h-full content-center text-center text-gray-500 text-sm font-semibold">
              No selected startup
            </div>
          )}
        </div>

        <Card className="w-full">
          <CardContent>
            <h2 className="text-xl text-blue-900 font-semibold mb-2">
              Engagement Over Time
            </h2>
            <div className="w-full h-64">
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
                        text: "Months in a year",
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

      <div className="overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead className="text-white bg-blue-900">
            <tr>
              <th>Startup Name</th>
              <th>Industry</th>
              <th>Founded Date</th>
              <th>Email</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {startups.map((st) => (
              <tr>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        <img
                          src="https://img.daisyui.com/images/profile/demo/2@94.webp"
                          alt="Avatar Tailwind CSS Component"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{st.companyName}</div>
                      <div className="text-sm opacity-50">
                        {st.locationName}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {st.industry}
                  <br />
                  <span className="badge badge-ghost badge-sm">
                    {st.website}
                  </span>
                </td>
                <td>{st.foundedDate}</td>
                <td>{st.contactEmail}</td>
                <td>{st.phoneNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-right">
          <button 
          onClick={()=>navigate("/add-startup")}
          className="btn btn-primary">Add Startup</button>
        </div>
      </div>
    </div>
  );
}
