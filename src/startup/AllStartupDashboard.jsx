import React, { useState, useEffect } from "react";
import {
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Search,
  Filter,
  MapPin,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  FileText,
  Download,
  Calendar,
  Zap,
  BarChart2,
  ArrowLeft,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import StartupReviewSection from "./StartupReviewSelection";
import { useSidebar } from "../context/SidebarContext";

export default function AllStartupDashboard() {
  const navigate = useNavigate();
  const { closeSidebar } = useSidebar();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [rankingMetric, setRankingMetric] = useState("overall");

  const [topStartups, setTopStartups] = useState([]);
  const [rankedStartups, setRankedStartups] = useState([]);
  const [totalStartups, setTotalStartups] = useState(0);
  const [loading, setLoading] = useState(true);
  const [industries, setIndustries] = useState([]);
  const [industryData, setIndustryData] = useState([]);

  // New state for dashboard analytics data
  const [growthData, setGrowthData] = useState([]);
  const [fundingData, setFundingData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // New states for Reports tab
  const [generatedReports, setGeneratedReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    industry: "All Industries",
    region: "All Regions",
    timePeriod: "2025 (YTD)",
    metrics: [],
  });
  const [availableRegions, setAvailableRegions] = useState([]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const [role, setRole] = useState(null);

  const fetchRole = async () => {
    try {
      const response = await fetch("http://localhost:8080/users/me/role", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.text();
        console.log("Role:", data);
        setRole(data);
      } else {
        console.log("Error fetching role:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching role:", error);
    }
  };

  useEffect(() => {
    const fetchDashboardAnalytics = async () => {
      setDashboardLoading(true);
      try {
        const response = await fetch(
          "http://localhost:8080/api/rankings/dashboard-analytics",
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard analytics");
        }

        const data = await response.json();
        setGrowthData(data.growthData);
        setFundingData(data.fundingData);
        setLocationData(data.locationData);

        if (data.locationData && data.locationData.length) {
          const regions = data.locationData.map((item) => item.name);
          setAvailableRegions(regions);
        }

        setDashboardLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard analytics:", error);
        setDashboardLoading(false);
      }
    };

    fetchDashboardAnalytics();
    fetchRole();
  }, []);

  useEffect(() => {
    const fetchTopStartups = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/rankings/top?limit=5${
            selectedIndustry !== "All" ? `&industry=${selectedIndustry}` : ""
          }`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch top startups");
        }
        const data = await response.json();
        setTopStartups(data);
      } catch (error) {
        console.error("Error fetching top startups:", error);
      }
    };

    fetchTopStartups();
  }, [selectedIndustry]);

  useEffect(() => {
    const fetchRankedStartups = async () => {
      setLoading(true);
      try {
        // Get all startups for city information
        const allStartupsResponse = await fetch('http://localhost:8080/startups', {
          credentials: "include",
        });
        
        if (!allStartupsResponse.ok) {
          throw new Error("Failed to fetch all startups");
        }
        
        const allStartups = await allStartupsResponse.json();

        // Get rankings
        const industryParam =
          selectedIndustry !== "All" ? `industry=${selectedIndustry}` : "";
        const metricParam = `metric=${rankingMetric}`;
        const url = `http://localhost:8080/api/rankings?${industryParam}&${metricParam}`;

        const response = await fetch(url, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch rankings");
        }

        const data = await response.json();

        // Process startups with city information
        const processedStartups = data.rankings.map(startup => {
          const matchingStartup = allStartups.find(s => s.id === startup.id);
          return {
            ...startup,
            locationName: matchingStartup?.city || "Unknown"
          };
        });

        setRankedStartups(processedStartups);
        setTotalStartups(data.totalCount);

        // Update available regions
        const uniqueCities = [...new Set(allStartups.map(startup => startup.city))].filter(Boolean);
        setAvailableRegions(uniqueCities);

        if (!industryParam) {
          const uniqueIndustries = [
            ...new Set(processedStartups.map((startup) => startup.industry)),
          ];
          setIndustries(uniqueIndustries);

          const industryBreakdown = uniqueIndustries.map((industry, index) => {
            const count = processedStartups.filter(
              (startup) => startup.industry === industry
            ).length;
            return {
              name: industry,
              value: count,
              color: COLORS[index % COLORS.length],
            };
          });
          setIndustryData(industryBreakdown);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchRankedStartups();
  }, [selectedIndustry, rankingMetric]);

  useEffect(() => {
    if (activeTab === "reports") {
      fetchAvailableReports();
    }
  }, [activeTab]);

  const fetchAvailableReports = async () => {
    setReportsLoading(true);
    try {
      const reports = [
        {
          id: 1,
          title: "Annual Ecosystem Report",
          description: `Comprehensive analysis of all ${totalStartups} startups across ${industries.length} industries`,
          date: "May 2025",
          type: "pdf",
        },
        {
          id: 2,
          title: "Funding Landscape",
          description: `Analysis of funding distribution across ${fundingData.length} startup stages`,
          date: "April 2025",
          type: "pdf",
        },
        {
          id: 3,
          title: "Industry Analysis",
          description: `Performance comparison of ${industries
            .slice(0, 3)
            .join(", ")} and other industries`,
          date: "March 2025",
          type: "pdf",
        },
        {
          id: 4,
          title: "Regional Performance",
          description: `Startup distribution and performance across ${locationData.length} major regions`,
          date: "February 2025",
          type: "pdf",
        },
        {
          id: 5,
          title: "Top Performers Spotlight",
          description: `Detailed analysis of top ${topStartups.length} performing startups`,
          date: "January 2025",
          type: "pdf",
        },
        {
          id: 6,
          title: "Government Support Analysis",
          description:
            "Impact of government programs on startup growth and survival",
          date: "December 2024",
          type: "pdf",
        },
      ];

      setGeneratedReports(reports);
      setReportsLoading(false);
    } catch (error) {
      console.error("Error generating reports:", error);
      setReportsLoading(false);
    }
  };

  const handleReportFormChange = (e) => {
    const { name, value } = e.target;
    setReportFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMetricChange = (metric) => {
    setReportFormData((prev) => {
      const metrics = [...prev.metrics];
      if (metrics.includes(metric)) {
        return {
          ...prev,
          metrics: metrics.filter((m) => m !== metric),
        };
      } else {
        return {
          ...prev,
          metrics: [...metrics, metric],
        };
      }
    });
  };

  const downloadReport = (report) => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text(report.title, 14, 20);

      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      doc.setFontSize(12);
      const splitDescription = doc.splitTextToSize(report.description, 180);
      doc.text(splitDescription, 14, 40);

      // Calculate starting Y position for summary statistics
      const descriptionHeight = splitDescription.length * 7; // 7 is approximate line height
      const summaryStartY = 40 + descriptionHeight + 10;

      // Add summary statistics
      doc.setFontSize(14);
      doc.text("Summary Statistics", 14, summaryStartY);
      doc.setFontSize(12);
      doc.text(`Total Startups: ${totalStartups || 0}`, 20, summaryStartY + 10);

      // Calculate average score safely
      const avgScore =
        rankedStartups && rankedStartups.length > 0
          ? (
              rankedStartups.reduce(
                (sum, s) => sum + (s.overallScore || 0),
                0
              ) / rankedStartups.length
            ).toFixed(2)
          : "0.00";
      doc.text(`Average Score: ${avgScore}`, 20, summaryStartY + 20);

      const totalFunding =
        rankedStartups && rankedStartups.length > 0
          ? (
              rankedStartups.reduce(
                (sum, s) => sum + (s.metrics?.fundingReceived || 0),
                0
              ) / 1000000
            ).toFixed(2)
          : "0.00";
      doc.text(`Total Funding: ₱${totalFunding}M`, 20, summaryStartY + 30);

      doc.setFontSize(14);
      doc.text("Industry Breakdown", 14, summaryStartY + 50);

      const industryTableData = (industryData || []).map((industry) => [
        industry.name || "Unknown",
        (industry.value || 0).toString(),
        totalStartups
          ? (((industry.value || 0) / totalStartups) * 100).toFixed(1) + "%"
          : "0%",
      ]);

      autoTable(doc, {
        startY: summaryStartY + 60,
        head: [["Industry", "Count", "Percentage"]],
        body: industryTableData,
        theme: "grid",
        headStyles: { fillColor: [79, 70, 229] },
        margin: { top: 10, right: 14, bottom: 10, left: 14 },
      });

      // Add geographical distribution
      doc.setFontSize(14);
      doc.text("Geographical Distribution", 14, doc.lastAutoTable.finalY + 20);

      const geoTableData = (locationData || []).map((item) => [
        item.name || "Unknown",
        (item.value || 0).toString(),
        totalStartups
          ? (((item.value || 0) / totalStartups) * 100).toFixed(1) + "%"
          : "0%",
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 30,
        head: [["Region", "Count", "Percentage"]],
        body: geoTableData,
        theme: "grid",
        headStyles: { fillColor: [79, 70, 229] },
        margin: { top: 10, right: 14, bottom: 10, left: 14 },
      });

      // Add top startups
      doc.setFontSize(14);
      doc.text("Top Performing Startups", 14, doc.lastAutoTable.finalY + 20);

      const startupTableData = (topStartups || []).map((startup) => [
        startup.companyName || "Unknown",
        startup.industry || "Unknown",
        (startup.overallScore || 0).toFixed(2),
        (startup.growthScore || 0).toFixed(2),
        (startup.investmentScore || 0).toFixed(2),
        (startup.ecosystemScore || 0).toFixed(2),
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 30,
        head: [
          [
            "Company",
            "Industry",
            "Overall",
            "Growth",
            "Investment",
            "Ecosystem",
          ],
        ],
        body: startupTableData,
        theme: "grid",
        headStyles: { fillColor: [79, 70, 229] },
        margin: { top: 10, right: 14, bottom: 10, left: 14 },
        columnStyles: {
          0: { cellWidth: 40 }, // Company name
          1: { cellWidth: 30 }, // Industry
          2: { cellWidth: 20 }, // Overall
          3: { cellWidth: 20 }, // Growth
          4: { cellWidth: 25 }, // Investment
          5: { cellWidth: 25 }, // Ecosystem
        },
      });

      // Save the PDF
      const fileName = `${report.title.toLowerCase().replace(/\s+/g, "-")}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const generateCustomReport = async () => {
    setReportsLoading(true);

    try {
      // Filter startups based on selected criteria
      const filteredStartups = rankedStartups.filter((startup) => {
        const industryMatch =
          reportFormData.industry === "All Industries" ||
          startup.industry === reportFormData.industry;
        
        const selectedRegion = reportFormData.region.toLowerCase();
        const startupLocation = startup.locationName?.toLowerCase() || "";
        
        const regionMatch =
          reportFormData.region === "All Regions" ||
          startupLocation.includes(selectedRegion) ||
          selectedRegion.includes(startupLocation);

        return industryMatch && regionMatch;
      });

      if (filteredStartups.length === 0) {
        toast.warning(`No startups found for the selected criteria. Please try different filters.`);
        setReportsLoading(false);
        return;
      }

      // Create PDF
      const doc = new jsPDF();
      let yPosition = 20;

      // Add title
      doc.setFontSize(20);
      doc.text("Custom Startup Report", 14, yPosition);
      yPosition += 15;

      // Add generation date
      doc.setFontSize(12);
      doc.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        14,
        yPosition
      );
      yPosition += 15;

      // Add filters
      doc.setFontSize(14);
      doc.text("Report Filters:", 14, yPosition);
      yPosition += 10;
      doc.setFontSize(12);
      doc.text(`Industry: ${reportFormData.industry}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Region: ${reportFormData.region}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Time Period: ${reportFormData.timePeriod}`, 20, yPosition);
      yPosition += 15;

      // Add summary statistics
      doc.setFontSize(14);
      doc.text("Summary Statistics", 14, yPosition);
      yPosition += 10;
      doc.setFontSize(12);
      doc.text(
        `Total Startups Analyzed: ${filteredStartups.length}`,
        20,
        yPosition
      );
      yPosition += 15;

      // Calculate and add industry distribution
      const industryDistribution = {};
      filteredStartups.forEach((startup) => {
        if (startup.industry) {
          industryDistribution[startup.industry] =
            (industryDistribution[startup.industry] || 0) + 1;
        }
      });

      doc.setFontSize(14);
      doc.text("Industry Distribution", 14, yPosition);
      yPosition += 10;
      doc.setFontSize(12);
      Object.entries(industryDistribution).forEach(([industry, count]) => {
        const percentage = ((count / filteredStartups.length) * 100).toFixed(1);
        doc.text(`${industry}: ${count} (${percentage}%)`, 20, yPosition);
        yPosition += 10;
      });
      yPosition += 10;

      // Add regional distribution
      const regionalDistribution = {};
      filteredStartups.forEach((startup) => {
        if (startup.locationName) {
          regionalDistribution[startup.locationName] =
            (regionalDistribution[startup.locationName] || 0) + 1;
        }
      });

      doc.setFontSize(14);
      doc.text("Regional Distribution", 14, yPosition);
      yPosition += 10;
      doc.setFontSize(12);
      Object.entries(regionalDistribution).forEach(([region, count]) => {
        const percentage = ((count / filteredStartups.length) * 100).toFixed(1);
        doc.text(`${region}: ${count} (${percentage}%)`, 20, yPosition);
        yPosition += 10;
      });
      yPosition += 10;

      // Add startup details table
      doc.setFontSize(14);
      doc.text("Startup Details", 14, yPosition);
      yPosition += 10;

      const startupTableData = filteredStartups.map((startup) => [
        startup.companyName || "N/A",
        startup.industry || "N/A",
        startup.locationName || "N/A",
        (startup.overallScore || 0).toFixed(2),
        (startup.growthScore || 0).toFixed(2),
        (startup.investmentScore || 0).toFixed(2),
        (startup.ecosystemScore || 0).toFixed(2),
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [
          [
            "Company",
            "Industry",
            "Location",
            "Overall",
            "Growth",
            "Investment",
            "Ecosystem",
          ],
        ],
        body: startupTableData,
        theme: "grid",
        headStyles: { fillColor: [79, 70, 229] },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 },
          6: { cellWidth: 25 },
        },
      });

      // Save the PDF
      const fileName = `custom-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);

      // Add new report to list
      const newReport = {
        id: generatedReports.length + 1,
        title: `Custom Report: ${reportFormData.industry} in ${reportFormData.region}`,
        description: `Analysis for ${reportFormData.timePeriod} including ${
          reportFormData.metrics.length
        } metrics: ${reportFormData.metrics.slice(0, 2).join(", ")}${
          reportFormData.metrics.length > 2 ? "..." : ""
        }`,
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        type: "pdf",
        isCustom: true,
      };

      setGeneratedReports((prev) => [newReport, ...prev]);
      setReportFormData((prev) => ({ ...prev, metrics: [] }));
      setReportsLoading(false);
      toast.success("Custom report generated successfully!");
    } catch (error) {
      console.error("Error generating custom report:", error);
      setReportsLoading(false);
      toast.error("Failed to generate report. Please try again.");
    }
  };

  useEffect(() => {
    closeSidebar();
  }, [closeSidebar]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="cursor-pointer flex items-center text-black mb-6 transition-colors hover:text-white hover:bg-indigo-500 rounded-md p-2"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Back to Home</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow flex items-center">
            <div className="p-3 bg-indigo-100 rounded-full mr-4">
              <TrendingUp className="h-6 w-6 text-indigo-700" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Startups</p>
              <p className="text-xl text-blue-900 font-bold">{totalStartups}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <DollarSign className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Funding</p>
              <p className="text-xl text-blue-900 font-bold">
                ₱
                {(
                  rankedStartups.reduce(
                    (sum, startup) =>
                      sum +
                      (startup.fundingReceived ||
                        startup.metrics?.fundingReceived ||
                        0),
                    0
                  ) / 1000000
                ).toFixed(2)}
                M
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <MapPin className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Startup Hubs</p>
              <p className="text-xl font-bold text-blue-900">
                {industries.length} Industries
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full mr-4">
              <Users className="h-6 w-6 text-yellow-700" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Average Score</p>
              <p className="text-xl font-bold text-blue-900">
                {rankedStartups.length > 0
                  ? Math.round(
                      rankedStartups.reduce(
                        (sum, startup) => sum + startup.overallScore,
                        0
                      ) / rankedStartups.length
                    )
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("rankings")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "rankings"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Rankings
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "analytics"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "reports"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Reports
            </button>
            {role === "ROLE_ADMIN" && (
              <button
                onClick={() => setActiveTab("review")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "review"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Startup Review
              </button>
            )}
          </nav>
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-blue-900">
                  Top Performing Startups
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Industry:</span>
                  <select
                    className="text-sm border rounded p-1 text-blue-800 w-30"
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                  >
                    <option value="All" className="text-blue-700">
                      All Industries
                    </option>
                    {industries.map((industry, index) => (
                      <option
                        className="text-blue-700"
                        key={index}
                        value={industry}
                      >
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-6">
                    Loading top startups...
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Startup
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Industry
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Growth
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topStartups.map((startup, index) => (
                        <tr key={startup.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-700 font-medium">
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {startup.companyName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {startup.industry}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {startup.score}/100
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-green-600">
                              +{startup.growthRate.toFixed(1)}%
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                Industry Breakdown
              </h2>
              {loading ? (
                <div className="text-center py-6">Loading industry data...</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={industryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {industryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4 text-blue-900">
                Growth Trends by Industry
              </h2>
              <div className="h-64">
                {dashboardLoading ? (
                  <div className="text-center py-6">Loading growth data...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {growthData.length > 0 &&
                        Object.keys(growthData[0])
                          .filter((key) => key !== "name")
                          .map((industry, index) => (
                            <Line
                              key={industry}
                              type="monotone"
                              dataKey={industry}
                              stroke={COLORS[index % COLORS.length]}
                              activeDot={{ r: 8 }}
                            />
                          ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-blue-900">
                Funding Stages
              </h2>
              <div className="h-64">
                {dashboardLoading ? (
                  <div className="text-center py-6">
                    Loading funding data...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fundingData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {fundingData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "rankings" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-blue-900">
                Startup Rankings
              </h2>
              <div className="flex space-x-4">
                <select
                  className="border rounded p-2 text-sm w-30 text-blue-900"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                >
                  <option className="text-blue-900" value="All">
                    All Industries
                  </option>
                  {industries.map((industry, index) => (
                    <option
                      className="text-blue-900"
                      key={index}
                      value={industry}
                    >
                      {industry}
                    </option>
                  ))}
                </select>
                <select
                  className="border rounded p-2 text-sm text-blue-900"
                  value={rankingMetric}
                  onChange={(e) => setRankingMetric(e.target.value)}
                >
                  <option className="text-blue-900" value="overall">
                    Overall Score
                  </option>
                  <option className="text-blue-900" value="growth">
                    Growth Score
                  </option>
                  <option className="text-blue-900" value="investment">
                    Investment Score
                  </option>
                  <option className="text-blue-900" value="ecosystem">
                    Ecosystem Score
                  </option>
                  <option className="text-blue-900" value="engagement">
                    Engagement Score
                  </option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-6">Loading rankings...</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Startup
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Industry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Overall Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Growth Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Investment Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ecosystem Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Engagement Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rankedStartups.map((startup, index) => (
                      <tr key={startup.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-700 font-medium">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {startup.companyName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {startup.industry}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {startup.overallScore}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {startup.growthScore}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {startup.investmentScore}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {startup.ecosystemScore}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {startup.engagementScore}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-blue-900">
                Geographical Distribution
              </h2>
              <div className="h-64">
                {dashboardLoading ? (
                  <div className="text-center py-6">
                    Loading location data...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={locationData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {locationData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-blue-900">
                Average Scores by Industry
              </h2>
              {loading ? (
                <div className="text-center py-6">Loading data...</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={industries.map((industry) => {
                        const startups = rankedStartups.filter(
                          (s) => s.industry === industry
                        );
                        const avgScore =
                          startups.length > 0
                            ? startups.reduce(
                                (sum, s) => sum + s.overallScore,
                                0
                              ) / startups.length
                            : 0;
                        return {
                          name: industry,
                          score: Math.round(avgScore),
                        };
                      })}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#8884d8">
                        {industryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-blue-900">
                Growth Score by Industry
              </h2>
              {loading ? (
                <div className="text-center py-6">Loading data...</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={industries.map((industry) => {
                        const startups = rankedStartups.filter(
                          (s) => s.industry === industry
                        );
                        const avgScore =
                          startups.length > 0
                            ? startups.reduce(
                                (sum, s) => sum + s.growthScore,
                                0
                              ) / startups.length
                            : 0;
                        return {
                          name: industry,
                          score: Math.round(avgScore),
                        };
                      })}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#00C49F">
                        {industryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-blue-900">
                Ecosystem Score by Industry
              </h2>
              {loading ? (
                <div className="text-center py-6">Loading data...</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={industries.map((industry) => {
                        const startups = rankedStartups.filter(
                          (s) => s.industry === industry
                        );
                        const avgScore =
                          startups.length > 0
                            ? startups.reduce(
                                (sum, s) => sum + s.ecosystemScore,
                                0
                              ) / startups.length
                            : 0;
                        return {
                          name: industry,
                          score: Math.round(avgScore),
                        };
                      })}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#FFBB28">
                        {industryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="grid grid-cols-1 gap-6">
            {/* Available Reports Section - Enhanced with real data */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 text-blue-900">
                Startup Ecosystem Reports
              </h2>
              {reportsLoading ? (
                <div className="text-center py-6">Loading reports...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedReports.map((report) => (
                    <div
                      key={report.id}
                      className={`border rounded-lg p-4 ${
                        report.isCustom
                          ? "bg-indigo-50 border-indigo-200"
                          : "hover:bg-indigo-50"
                      }  transition-colors duration-150`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium mb-2 text-blue-900">
                          {report.title}
                        </h3>
                        <div className="p-2 bg-blue-100 rounded text-xs font-bold text-blue-800">
                          {report.type.toUpperCase()}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {report.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {report.date}
                        </p>
                        <button
                          className=" rounded-md p-2 flex items-center text-indigo-600 text-sm font-medium hover:text-indigo-800 hover:bg-indigo-200 cursor-pointer"
                          onClick={() => downloadReport(report)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Report Builder - Enhanced with real data */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4 text-blue-900">
                <FileText className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-bold">Custom Report Builder</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    className="w-full border rounded p-2 text-blue-900"
                    name="industry"
                    value={reportFormData.industry}
                    onChange={handleReportFormChange}
                  >
                    <option>All Industries</option>
                    {industries.map((industry, index) => (
                      <option key={index} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <select
                    className="w-full border rounded p-2 text-blue-900"
                    name="region"
                    value={reportFormData.region}
                    onChange={handleReportFormChange}
                  >
                    <option>All Regions</option>
                    {availableRegions.map((region, index) => (
                      <option key={index} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Period
                  </label>
                  <select
                    className="w-full border rounded p-2 text-blue-900"
                    name="timePeriod"
                    value={reportFormData.timePeriod}
                    onChange={handleReportFormChange}
                  >
                    <option>2025 (YTD)</option>
                    <option>2024</option>
                    <option>2023</option>
                    <option>Last 3 Years</option>
                    <option>Last 5 Years</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  Metrics to Include
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-black">
                  {[
                    "Growth Rate",
                    "Funding Amount",
                    "Survival Rate",
                    "Employment Data",
                    "Investment Rounds",
                    "Foreign Investment",
                    "Government Support",
                    "Mentorship Data",
                    "Public-Private Partnerships",
                  ].map((metric, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`metric-${index}`}
                        className="mr-2"
                        checked={reportFormData.metrics.includes(metric)}
                        onChange={() => handleMetricChange(metric)}
                      />
                      <label htmlFor={`metric-${index}`} className="text-sm">
                        {metric}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    Report Preview
                  </h4>
                  <div className="text-sm text-blue-700">
                    {reportFormData.metrics.length === 0 ? (
                      <p>Select at least one metric to generate a report</p>
                    ) : (
                      <p>
                        Your custom report will include data for{" "}
                        <strong>{reportFormData.industry}</strong> in{" "}
                        <strong>{reportFormData.region}</strong> during{" "}
                        <strong>{reportFormData.timePeriod}</strong> with
                        analysis of{" "}
                        <strong>{reportFormData.metrics.length} metrics</strong>
                        .
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  className={`flex items-center px-4 py-2 rounded text-white ${
                    reportFormData.metrics.length === 0 || reportsLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500"
                  }`}
                  disabled={
                    reportFormData.metrics.length === 0 || reportsLoading
                  }
                  onClick={generateCustomReport}
                >
                  {reportsLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Custom Report
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4 text-blue-900">
                Report Analytics
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-semibold mb-3 text-blue-900">
                    Industry Distribution in Reports
                  </h3>
                  <div className="h-64">
                    {reportsLoading ? (
                      <div className="text-center py-6">Loading data...</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={industryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {industryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-3 text-blue-900">
                    Growth Trends
                  </h3>
                  <div className="h-64">
                    {dashboardLoading ? (
                      <div className="text-center py-6">
                        Loading growth data...
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={growthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {growthData.length > 0 &&
                            Object.keys(growthData[0])
                              .filter((key) => key !== "name")
                              .slice(0, 3) // Limit to first 3 industries for clarity
                              .map((industry, index) => (
                                <Line
                                  key={industry}
                                  type="monotone"
                                  dataKey={industry}
                                  stroke={COLORS[index % COLORS.length]}
                                  activeDot={{ r: 8 }}
                                />
                              ))}
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-md font-semibold mb-3 text-blue-900">
                  Recent Report Activity
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Report Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Generated
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Downloads
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {generatedReports.slice(0, 5).map((report) => (
                        <tr key={report.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {report.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {report.date}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {report.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {Math.floor(Math.random() * 50) + 1}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "review" && (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">
              Startup Review
            </h2>
            <div className="bg-white rounded-lg shadow">
              <StartupReviewSection />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white p-4 border-t">
        <div className="text-center text-sm text-gray-500">
          © 2025 StartupSphere Philippines | Supporting DTI, DICT, and DOST
        </div>
      </footer>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
