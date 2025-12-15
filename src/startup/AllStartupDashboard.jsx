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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import StartupReviewSection from "./StartupReviewSelection";
import { useSidebar } from "../context/SidebarContext";
import loginLogo from "/StartUpSphere_loginLogo.png";

export default function AllStartupDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { closeSidebar } = useSidebar();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "overview"
  );
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [rankingMetric, setRankingMetric] = useState("overall");
  const [currentPage, setCurrentPage] = useState(0); // Changed to 0-based for API
  const itemsPerPage = 10;
  const [totalPagesState, setTotalPagesState] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedReviewStartupId, setSelectedReviewStartupId] = useState(
    location.state?.reviewStartupId || null
  );

  const [topStartups, setTopStartups] = useState([]);
  const [topStartupsLoading, setTopStartupsLoading] = useState(false);
  const [topStartupsError, setTopStartupsError] = useState(null);
  const [rankedStartups, setRankedStartups] = useState([]);
  const [totalStartups, setTotalStartups] = useState(0);
  const [loading, setLoading] = useState(true);
  const [industries, setIndustries] = useState([]);
  const [industryData, setIndustryData] = useState([]);

  // Cache for startup locations to avoid repeated fetching
  const [startupLocationsCache, setStartupLocationsCache] = useState(null);
  const [industriesCache, setIndustriesCache] = useState(null);
  const [topStartupsCache, setTopStartupsCache] = useState(null);

  // New state for dashboard analytics data
  const [growthData, setGrowthData] = useState([]);
  const [fundingData, setFundingData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // New state for chart filtering and interaction
  const [selectedChartIndustry, setSelectedChartIndustry] = useState(null);
  const [selectedFundingStage, setSelectedFundingStage] = useState(null);
  const [hoveredIndustry, setHoveredIndustry] = useState(null);
  const [hoveredFundingStage, setHoveredFundingStage] = useState(null);

  // New states for Reports tab
  const [generatedReports, setGeneratedReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    industry: "All Industries",
    region: "All Regions",
    timePeriod: "2025 (YTD)",
    metrics: [
      "Growth Rate",
      "Funding Amount",
      "Survival Rate",
      "Employment Data",
      "Investment Rounds",
      "Foreign Investment",
      "Government Support",
      "Mentorship Data",
      "Public-Private Partnerships",
    ],
  });
  const [availableRegions, setAvailableRegions] = useState([]);

  // Add these new state variables at the top of your component with other state declarations
  const [psgcRegions, setPsgcRegions] = useState([]);
  const [psgcLoading, setPsgcLoading] = useState(false);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const [role, setRole] = useState(null);

  const fetchRole = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/me/role`,
        {
          credentials: "include",
        }
      );

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

  const refreshDashboard = () => {
    // Clear caches to force fresh data fetch
    setStartupLocationsCache(null);
    setIndustriesCache(null);
    setTopStartupsCache(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchDashboardAnalytics = async () => {
      setDashboardLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/rankings/dashboard-analytics`,

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
  }, [refreshTrigger]);

  useEffect(() => {
    const fetchTopStartups = async () => {
      // Always fetch fresh data when filtering by a specific industry
      // Only use cache when viewing all industries
      const isFiltered = selectedIndustry !== "All";
      
      if (!isFiltered && topStartupsCache && 
          topStartupsCache.industry === selectedIndustry && 
          topStartupsCache.metric === rankingMetric) {
        setTopStartups(topStartupsCache.data);
        setTopStartupsError(null);
        return;
      }

      setTopStartupsLoading(true);
      setTopStartups([]); // Clear old data while loading for visual feedback
      setTopStartupsError(null);
      
      try {
        const params = new URLSearchParams({
          page: "0",
          size: "5",
          metric: rankingMetric
        });
        
        if (selectedIndustry !== "All") {
          params.append("industry", selectedIndustry);
        }
        
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/rankings/top?${params.toString()}`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch top startups");
        }
        const data = await response.json();
        const startups = Array.isArray(data) ? data : (data.content || []);
        
        // Normalize startup data to ensure all score fields are properly set
        const normalizedStartups = startups.map(startup => {
          // Get overall score from various possible field names
          const overallScore = startup.overallScore ?? startup.score ?? startup.overallScore ?? 0;
          const growthRate = startup.growthScore ?? startup.growthRate ?? startup.growth ?? 0;
          
          return {
            ...startup,
            overallScore: Number(overallScore),
            growthScore: Number(growthRate)
          };
        });
        
        // Validate that we have startup data
        if (!normalizedStartups || normalizedStartups.length === 0) {
          console.warn("No startups returned from API for industry:", selectedIndustry);
        }
        
        setTopStartups(normalizedStartups);
        setTopStartupsError(null);
        
        // Cache the result only for non-filtered requests
        if (!isFiltered) {
          setTopStartupsCache({
            industry: selectedIndustry,
            metric: rankingMetric,
            data: normalizedStartups
          });
        }
      } catch (error) {
        console.error("Error fetching top startups:", error);
        setTopStartups([]);
        setTopStartupsError(error.message || "Failed to fetch top startups");
      } finally {
        setTopStartupsLoading(false);
      }
    };

    fetchTopStartups();
  }, [selectedIndustry, rankingMetric, refreshTrigger]);

  useEffect(() => {
    const fetchRankedStartups = async () => {
      // Set loading to true at the start of fetching
      setLoading(true);
      
      // Scroll to top when page changes for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      try {
        // Get rankings with pagination
        const params = new URLSearchParams({
          page: currentPage.toString(),
          size: itemsPerPage.toString(),
          metric: rankingMetric
        });
        
        if (selectedIndustry !== "All") {
          params.append("industry", selectedIndustry);
        }
        
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/rankings?${params.toString()}`;

        // Parallel fetch: rankings + location cache (only if not cached)
        const fetchPromises = [fetch(url, { credentials: "include" })];
        
        // Only fetch locations if not already cached
        if (!startupLocationsCache) {
          fetchPromises.push(
            fetch(
              `${import.meta.env.VITE_BACKEND_URL}/startups?page=0&size=1000&sortBy=companyName&sortDir=ASC`,
              { credentials: "include" }
            )
          );
        }

        const responses = await Promise.all(fetchPromises);
        
        if (!responses[0].ok) {
          throw new Error("Failed to fetch rankings");
        }

        const data = await responses[0].json();

        // Cache locations if fetched
        if (responses[1]) {
          if (responses[1].ok) {
            const locationsData = await responses[1].json();
            const locationsMap = {};
            (locationsData.content || []).forEach(startup => {
              locationsMap[startup.id] = startup.city || "Unknown";
            });
            setStartupLocationsCache(locationsMap);
            setTotalStartups(locationsData.totalElements || 0);
            
            // Cache available regions
            const uniqueCities = [...new Set(Object.values(locationsMap))].filter(Boolean);
            setAvailableRegions(uniqueCities);
          }
        }

        // Extract rankings from paginated response
        const rankings = data.content || [];
        
        // Process startups with city information using cache
        const processedStartups = rankings.map((startup) => {
          return {
            ...startup,
            locationName: startupLocationsCache ? startupLocationsCache[startup.id] || "Unknown" : "Unknown",
          };
        });
        
        setRankedStartups(processedStartups);
        
        // Update pagination state from API response
        setTotalPagesState(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);

        // Update industries only if we're fetching all industries AND not cached
        if (selectedIndustry === "All" && !industriesCache) {
          // Fetch all rankings to get complete industry list (only once)
          const allRankingsResponse = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/rankings?page=0&size=1000&metric=${rankingMetric}`,
            { credentials: "include" }
          );
          
          if (allRankingsResponse.ok) {
            const allRankingsData = await allRankingsResponse.json();
            const allRankings = allRankingsData.content || [];
            
            const uniqueIndustries = [
              ...new Set(allRankings.map((startup) => startup.industry)),
            ].filter(Boolean);
            
            const industryBreakdown = uniqueIndustries.map((industry, index) => {
              const count = allRankings.filter(
                (startup) => startup.industry === industry
              ).length;
              return {
                name: industry,
                value: count,
                color: COLORS[index % COLORS.length],
              };
            });
            
            setIndustries(uniqueIndustries);
            setIndustryData(industryBreakdown);
            setIndustriesCache(true); // Mark as cached
            
            // Also cache top startups from this data to avoid separate API call
            const topStartupsFromRankings = allRankings
              .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
              .slice(0, 5);
            setTopStartups(topStartupsFromRankings);
            setTopStartupsCache({
              industry: "All",
              metric: rankingMetric,
              data: topStartupsFromRankings
            });
          }
        } else if (industriesCache && industries.length === 0) {
          // If cache flag is set but industries array is empty, refetch
          setIndustriesCache(null);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchRankedStartups();
  }, [selectedIndustry, rankingMetric, currentPage, refreshTrigger]);

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

      // Add header with logo and title
      doc.setFillColor(29, 53, 87); // Dark blue color
      doc.rect(0, 0, 210, 40, "F");

      // Add logo
      doc.addImage(loginLogo, "PNG", 20, 10, 50, 25);

      // Add title with custom font
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(report.title, 80, 25);

      // Add subtitle
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("StartupSphere Philippines", 80, 35);

      // Reset text color for content
      doc.setTextColor(0, 0, 0);

      // Add generation date with styling
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);

      // Add description with better formatting
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const splitDescription = doc.splitTextToSize(report.description, 170);
      doc.text(splitDescription, 20, 60);

      // Add a decorative line
      doc.setDrawColor(29, 53, 87);
      doc.setLineWidth(0.5);
      doc.line(
        20,
        70 + splitDescription.length * 7,
        190,
        70 + splitDescription.length * 7
      );

      // Add summary statistics with better styling
      const summaryStartY = 80 + splitDescription.length * 7;
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Summary Statistics", 20, summaryStartY);

      // Add statistics in a styled box
      doc.setFillColor(240, 240, 240);
      doc.rect(20, summaryStartY + 5, 170, 40, "F");

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Startups: ${totalStartups || 0}`, 25, summaryStartY + 15);

      const avgScore =
        rankedStartups && rankedStartups.length > 0
          ? (
              rankedStartups.reduce(
                (sum, s) => sum + (s.overallScore || 0),
                0
              ) / rankedStartups.length
            ).toFixed(2)
          : "0.00";
      doc.text(`Average Score: ${avgScore}`, 25, summaryStartY + 25);

      const totalFunding =
        rankedStartups && rankedStartups.length > 0
          ? (
              rankedStartups.reduce(
                (sum, s) => sum + (s.metrics?.totalFunding || 0),
                0
              ) / 1000000
            ).toFixed(2)
          : "0.00";
      doc.text(`Total Funding: ₱${totalFunding}M`, 25, summaryStartY + 35);

      // Add industry breakdown with better styling
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Industry Breakdown", 20, summaryStartY + 55);

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
        headStyles: {
          fillColor: [29, 53, 87],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 10, right: 20, bottom: 10, left: 20 },
      });

      // Add geographical distribution with better styling
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Geographical Distribution", 20, doc.lastAutoTable.finalY + 20);

      const geoTableData = (locationData || []).map((item) => [
        item.name || "Unknown",
        (item.value || 0).toString(),
        totalStartups
          ? (((item.value || 0) / totalStartups) * 100).toFixed(1) + "%"
          : "0%",
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 25,
        head: [["Region", "Count", "Percentage"]],
        body: geoTableData,
        theme: "grid",
        headStyles: {
          fillColor: [29, 53, 87],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 10, right: 20, bottom: 10, left: 20 },
      });

      // Add top startups with better styling
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Top Performing Startups", 20, doc.lastAutoTable.finalY + 20);

      const startupTableData = (topStartups || []).map((startup) => [
        startup.companyName || "Unknown",
        startup.industry || "Unknown",
        (startup.overallScore || 0).toFixed(2),
        (startup.growthScore || 0).toFixed(2),
        (startup.investmentScore || 0).toFixed(2),
        (startup.ecosystemScore || 0).toFixed(2),
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 25,
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
        headStyles: {
          fillColor: [29, 53, 87],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
        },
        margin: { top: 10, right: 20, bottom: 10, left: 20 },
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${i} of ${pageCount} | StartupSphere Philippines`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Save the PDF
      const fileName = `${report.title.toLowerCase().replace(/\s+/g, "-")}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);
      toast.success("Report downloaded successfully!");
      refreshDashboard();
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
        toast.warning(
          `No startups found for the selected criteria. Please try different filters.`
        );
        setReportsLoading(false);
        return;
      }

      // Create PDF with enhanced styling
      const doc = new jsPDF();

      // Add header with logo and title
      doc.setFillColor(29, 53, 87);
      doc.rect(0, 0, 210, 40, "F");

      // Add logo
      doc.addImage(loginLogo, "PNG", 20, 10, 50, 25);

      // Add title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Custom Startup Report", 80, 25);

      // Add subtitle
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("StartupSphere Philippines", 80, 35);

      // Reset text color for content
      doc.setTextColor(0, 0, 0);

      // Add generation date
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);

      // Add filters section with styling
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Report Filters", 20, 65);

      // Add filters in a styled box
      doc.setFillColor(240, 240, 240);
      doc.rect(20, 70, 170, 40, "F");

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Industry: ${reportFormData.industry}`, 25, 80);
      doc.text(`Region: ${reportFormData.region}`, 25, 90);
      doc.text(`Time Period: ${reportFormData.timePeriod}`, 25, 100);

      // Add summary statistics
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Summary Statistics", 20, 120);

      // Add statistics in a styled box
      doc.setFillColor(240, 240, 240);
      doc.rect(20, 125, 170, 30, "F");

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Startups Analyzed: ${filteredStartups.length}`, 25, 135);

      // Calculate and add industry distribution
      const industryDistribution = {};
      filteredStartups.forEach((startup) => {
        if (startup.industry) {
          industryDistribution[startup.industry] =
            (industryDistribution[startup.industry] || 0) + 1;
        }
      });

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Industry Distribution", 20, 165);

      const industryTableData = Object.entries(industryDistribution).map(
        ([industry, count]) => [
          industry,
          count.toString(),
          ((count / filteredStartups.length) * 100).toFixed(1) + "%",
        ]
      );

      autoTable(doc, {
        startY: 170,
        head: [["Industry", "Count", "Percentage"]],
        body: industryTableData,
        theme: "grid",
        headStyles: {
          fillColor: [29, 53, 87],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 10, right: 20, bottom: 10, left: 20 },
      });

      // Add regional distribution
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Regional Distribution", 20, doc.lastAutoTable.finalY + 20);

      const regionalDistribution = {};
      filteredStartups.forEach((startup) => {
        if (startup.locationName) {
          regionalDistribution[startup.locationName] =
            (regionalDistribution[startup.locationName] || 0) + 1;
        }
      });

      const regionalTableData = Object.entries(regionalDistribution).map(
        ([region, count]) => [
          region,
          count.toString(),
          ((count / filteredStartups.length) * 100).toFixed(1) + "%",
        ]
      );

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 25,
        head: [["Region", "Count", "Percentage"]],
        body: regionalTableData,
        theme: "grid",
        headStyles: {
          fillColor: [29, 53, 87],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 10, right: 20, bottom: 10, left: 20 },
      });

      // Add startup details
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Startup Details", 20, doc.lastAutoTable.finalY + 20);

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
        startY: doc.lastAutoTable.finalY + 25,
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
        headStyles: {
          fillColor: [29, 53, 87],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 },
          6: { cellWidth: 25 },
        },
        margin: { top: 10, right: 20, bottom: 10, left: 20 },
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${i} of ${pageCount} | StartupSphere Philippines`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

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
      refreshDashboard();
    } catch (error) {
      console.error("Error generating custom report:", error);
      setReportsLoading(false);
      toast.error("Failed to generate report. Please try again.");
    }
  };

  useEffect(() => {
    closeSidebar();

    // Check if we have a startup ID to review from navigation
    if (
      location.state?.activeTab === "review" &&
      location.state?.reviewStartupId
    ) {
      setActiveTab("review");
      setSelectedReviewStartupId(location.state.reviewStartupId);

      // Show a toast notification to indicate which startup is being reviewed
      if (location.state?.startupName) {
        toast.info(`Reviewing startup: ${location.state.startupName}`);
      }
    }
  }, [closeSidebar, location.state]);

  // Update the PaginationControls component for 0-based server-side pagination
  const PaginationControls = () => {
    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage === totalPagesState - 1 || totalPagesState === 0;
    
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Showing {totalElements === 0 ? 0 : currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, totalElements)} of {totalElements} results
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(0)}
            disabled={isFirstPage}
            className={`p-2 rounded ${
              isFirstPage
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-50"
            }`}
            title="First page"
          >
            <ChevronLeft size={16} className="ml-[-14px]" />
          </button>

          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={isFirstPage}
            className={`px-3 py-1 rounded text-sm ${
              isFirstPage
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPagesState) }, (_, i) => {
              let pageNum;
              if (totalPagesState <= 5) {
                pageNum = i;
              } else if (currentPage <= 2) {
                pageNum = i;
              } else if (currentPage >= totalPagesState - 3) {
                pageNum = totalPagesState - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded ${
                    currentPage === pageNum
                      ? "bg-indigo-600 text-white"
                      : "text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={isLastPage}
            className={`px-3 py-1 rounded text-sm ${
              isLastPage
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            Next
          </button>

          <button
            onClick={() => setCurrentPage(totalPagesState - 1)}
            disabled={isLastPage}
            className={`p-2 rounded ${
              isLastPage
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-50"
            }`}
            title="Last page"
          >
            <ChevronRight size={16} className="ml-[-14px]" />
          </button>
        </div>
      </div>
    );
  };

  // Add these new state variables for review filtering
  const [reviewFilterStatus, setReviewFilterStatus] = useState("all");
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Add this new function to handle review filtering
  const handleReviewFilter = async () => {
    setReviewLoading(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (selectedIndustry !== "All") {
        queryParams.append("industry", selectedIndustry);
      }
      
      // Use region code if available, otherwise use name
      if (reportFormData.region !== "All Regions") {
        // Find selected region in PSGC data
        const selectedRegionData = psgcRegions.find(
          r => r.name === reportFormData.region || r.regionName === reportFormData.region
        );
        
        if (selectedRegionData) {
          queryParams.append("regionCode", selectedRegionData.code);
          queryParams.append("region", selectedRegionData.name);
        } else {
          queryParams.append("region", reportFormData.region);
        }
      }
      
      if (reviewFilterStatus !== "all") {
        queryParams.append("status", reviewFilterStatus);
      }
      
      if (reviewSearchQuery.trim()) {
        queryParams.append("search", reviewSearchQuery.trim());
      }
      
      // Fetch startups with filters (with pagination)
      queryParams.append("page", "0");
      queryParams.append("size", "1000");
      queryParams.append("sortBy", "companyName");
      queryParams.append("sortDir", "ASC");
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/review?${queryParams.toString()}`,
        {
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch startups for review");
      }
      
      const data = await response.json();
      const startups = data.content || data || [];
      setFilteredStartups(startups);
      
      const totalFound = data.totalElements || startups.length;
      toast.success(`Found ${totalFound} startup${totalFound !== 1 ? 's' : ''} matching your criteria`);
    } catch (error) {
      console.error("Error applying filters:", error);
      toast.error("Failed to apply filters. Please try again.");
    } finally {
      setReviewLoading(false);
    }
  };

  // Reset filters function
  const resetReviewFilters = () => {
    setSelectedIndustry("All");
    setReportFormData(prev => ({...prev, region: "All Regions"}));
    setReviewFilterStatus("all");
    setReviewSearchQuery("");
    // Trigger a refetch with reset filters
    handleReviewFilter();
  };
  
  // Add this function to fetch PSGC regions data
  const fetchPsgcRegions = async () => {
    setPsgcLoading(true);
    try {
      // Fetch regions from PSGC API
      const response = await fetch(`https://psgc.gitlab.io/api/regions/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch PSGC regions');
      }
      
      const data = await response.json();
      setPsgcRegions(data);
      
      // Update available regions with standardized PSGC regions
      const standardizedRegions = data.map(region => ({
        code: region.code,
        name: region.name,
        regionName: region.regionName || region.name
      }));
      
      setAvailableRegions(standardizedRegions);
    } catch (error) {
      console.error("Error fetching PSGC regions:", error);
      toast.error("Failed to load region data. Using local data instead.");
    } finally {
      setPsgcLoading(false);
    }
  };

  // Call this function when the component mounts or the activeTab changes to "review"
  useEffect(() => {
    if (activeTab === "review") {
      fetchPsgcRegions();
    }
  }, [activeTab]);

  // Helper function to get industry icon
  const getIndustryIcon = (industryName) => {
    const iconMap = {
      "Mobile App Development": "📱",
      "Food & Beverage": "🍴",
      "Technology & IT Services": "💻",
      "Healthcare & Medical Services": "🏥",
      "Agriculture & Farming": "🌾",
      "Education & Training": "🎓",
      "Web Development": "🌐",
      "Software Development": "⚙️",
      "IT Solutions & Consulting": "🔧",
      "Manufacturing": "🏭",
      "Retail & E-commerce": "🛍️",
      "Wholesale Trade": "📦",
      "Aquaculture & Fisheries": "🐠",
      "Sari-Sari Store": "🏪",
      "Other Services": "✨"
    };
    return iconMap[industryName] || "💼";
  };

  // Helper function to get funding stage description
  const getFundingStageDescription = (stageName) => {
    const descriptions = {
      "Seed": "Early-stage funding, often from angel investors",
      "Series A": "First institutional funding round",
      "Series B": "Growth and expansion stage",
      "Series C": "Late-stage scaling and expansion",
      "Other": "Alternative funding sources"
    };
    return descriptions[stageName] || "";
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Startups Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-indigo-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-indigo-700 text-sm font-medium mb-1">Total Startups</p>
                <p className="text-3xl font-bold text-indigo-900 mb-2">{totalStartups}</p>
                <p className="text-xs text-indigo-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                  Active in ecosystem
                </p>
              </div>
              <div className="p-3 bg-indigo-200 rounded-lg">
                <TrendingUp className="h-6 w-6 text-indigo-700" />
              </div>
            </div>
          </div>

          {/* Total Funding Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-green-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-green-700 text-sm font-medium mb-1">Total Funding</p>
                <p className="text-3xl font-bold text-green-900 mb-2">
                  ₱{(
                    rankedStartups.reduce((sum, startup) => {
                      const funding =
                        startup.totalFunding ||
                        startup.metrics?.totalFunding ||
                        (typeof startup.metrics === "string"
                          ? JSON.parse(startup.metrics)?.totalFunding
                          : 0) ||
                        0;
                      return sum + Number(funding);
                    }, 0) / 1000000
                  ).toFixed(1)}M
                </p>
                <p className="text-xs text-green-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                  Total invested
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </div>

          {/* Industries Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-blue-700 text-sm font-medium mb-1">Industries</p>
                <p className="text-3xl font-bold text-blue-900 mb-2">{industries.length}</p>
                <p className="text-xs text-blue-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                  Diversified sectors
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </div>

          {/* Average Score Card */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-amber-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-amber-700 text-sm font-medium mb-1">Avg. Score</p>
                <p className="text-3xl font-bold text-amber-900 mb-2">
                  {rankedStartups.length > 0
                    ? Math.round(
                        rankedStartups.reduce(
                          (sum, startup) => sum + startup.overallScore,
                          0
                        ) / rankedStartups.length
                      )
                    : "N/A"}/100
                </p>
                <p className="text-xs text-amber-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                  Performance metric
                </p>
              </div>
              <div className="p-3 bg-amber-200 rounded-lg">
                <Users className="h-6 w-6 text-amber-700" />
              </div>
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
          <div className="space-y-6">
            {/* Top Performing Startups Section */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mr-3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                      Top Performing Startups
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Leading startups by overall performance metrics</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label htmlFor="industry-select" className="text-sm font-medium text-gray-700">Filter by Industry:</label>
                    <select
                      id="industry-select"
                      className={`px-4 py-2 border rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
                        selectedIndustry !== "All" 
                          ? 'border-indigo-500 ring-2 ring-indigo-200 font-semibold' 
                          : 'border-gray-300'
                      }`}
                      value={selectedIndustry}
                      onChange={(e) => {
                        setSelectedIndustry(e.target.value);
                      }}
                    >
                      <option value="All">All Industries</option>
                      {industries.map((industry, index) => (
                        <option key={index} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {topStartupsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading top startups {selectedIndustry !== "All" ? `for ${selectedIndustry}` : ""}...</p>
                  </div>
                ) : topStartupsError ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg max-w-md">
                      <p className="text-red-700 font-semibold mb-2">Failed to Load Top Startups</p>
                      <p className="text-red-600 text-sm mb-4">{topStartupsError}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="text-sm font-medium text-red-700 hover:text-red-800 bg-red-100 hover:bg-red-200 px-3 py-2 rounded transition-colors"
                      >
                        Try Refreshing Page
                      </button>
                    </div>
                  </div>
                ) : topStartups.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rank</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Company Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Industry</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Overall Score</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Growth Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {topStartups.map((startup, index) => (
                          <tr key={startup.id} className="hover:bg-indigo-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{index + 1}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900">{startup.companyName}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {startup.industry}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                                  <div 
                                    className="h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-300" 
                                    style={{width: `${Math.min(Math.max(startup.overallScore || 0, 0), 100)}%`}}
                                  ></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{Math.round(Math.min(Math.max(startup.overallScore || 0, 0), 100))}/100</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm font-semibold text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                                +{(startup.growthScore ?? startup.growthRate ?? 0).toFixed(1)}%
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400 mb-3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    <p className="text-gray-600">No startups found for the selected filters</p>
                  </div>
                )}
              </div>
            </div>

            {/* Charts Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Industry Distribution */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 px-6 py-5">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mr-3"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    Industry Distribution
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Startup count across {industries.length} industries • Total: <span className="font-bold text-indigo-700">{industryData.reduce((sum, ind) => sum + ind.value, 0)}</span> startups</p>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  {loading ? (
                    <div className="flex items-center justify-center flex-1">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : industryData.length > 0 ? (
                    <div className="flex flex-col flex-1">
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <Pie
                              data={industryData}
                              cx="50%"
                              cy="45%"
                              innerRadius={45}
                              outerRadius={72}
                              paddingAngle={3}
                              dataKey="value"
                              animationBegin={0}
                              animationDuration={800}
                              animationEasing="ease-out"
                            >
                              {industryData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.color}
                                  opacity={selectedChartIndustry === null || selectedChartIndustry === entry.name ? 1 : 0.3}
                                  className="cursor-pointer transition-opacity duration-200 hover:opacity-100"
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '2px solid #4f46e5',
                                borderRadius: '12px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
                                padding: '12px 16px',
                                fontSize: '13px',
                                fontWeight: '600'
                              }}
                              formatter={(value) => [
                                `${value} startups`,
                                'Count'
                              ]}
                              labelFormatter={(label) => `${label}`}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-5 pt-5 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-gray-900">Industries Breakdown</h4>
                          {selectedChartIndustry && (
                            <button 
                              onClick={() => setSelectedChartIndustry(null)}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors bg-indigo-50"
                            >
                              ✕ Clear Filter
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-56 overflow-y-auto">
                          {industryData.map((entry, index) => {
                            const isSelected = selectedChartIndustry === entry.name;
                            const percentage = ((entry.value / industryData.reduce((sum, ind) => sum + ind.value, 0)) * 100).toFixed(1);
                            return (
                              <div 
                                key={index} 
                                onClick={() => setSelectedChartIndustry(isSelected ? null : entry.name)}
                                onMouseEnter={() => setHoveredIndustry(entry.name)}
                                onMouseLeave={() => setHoveredIndustry(null)}
                                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 shadow-sm hover:shadow-md ${
                                  isSelected 
                                    ? 'bg-indigo-50 border-indigo-500 shadow-md' 
                                    : hoveredIndustry === entry.name
                                    ? 'bg-gray-50 border-gray-300 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                                }`}
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  <span className="text-2xl flex-shrink-0" title={entry.name}>{getIndustryIcon(entry.name)}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-900 line-clamp-2">{entry.name}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full transition-all duration-300" 
                                      style={{
                                        width: `${percentage}%`,
                                        backgroundColor: entry.color
                                      }}
                                    ></div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-600">{percentage}%</span>
                                    <span className="text-xs font-bold text-gray-900 bg-gray-100 rounded px-2 py-1">{entry.value}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center flex-1">
                      <p className="text-gray-600">No industry data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Funding Stages */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col ">
                <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 px-6 py-5">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 mr-3"><path d="M6 9c0-1 1-2 2-2s2 1 2 2M18 9c0-1-1-2-2-2s-2 1-2 2M6 15c0 1 1 2 2 2s2-1 2-2M18 15c0 1-1 2-2 2s-2-1-2-2"></path><path d="M12 3v3m0 12v3M3 12h3m12 0h3"></path></svg>
                    Funding Stages
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Funding distribution • Total: <span className="font-bold text-purple-700">{fundingData.reduce((sum, stage) => sum + stage.value, 0)}</span> startups</p>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  {dashboardLoading ? (
                    <div className="flex items-center justify-center flex-1">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                  ) : fundingData.length > 0 ? (
                    <div className="flex flex-col flex-1">
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <Pie
                              data={fundingData}
                              cx="50%"
                              cy="45%"
                              outerRadius={72}
                              dataKey="value"
                              animationBegin={0}
                              animationDuration={800}
                              animationEasing="ease-out"
                            >
                              {fundingData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                  opacity={selectedFundingStage === null || selectedFundingStage === entry.name ? 1 : 0.3}
                                  className="cursor-pointer transition-opacity duration-200 hover:opacity-100"
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '2px solid #7c3aed',
                                borderRadius: '12px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
                                padding: '12px 16px',
                                fontSize: '13px',
                                fontWeight: '600'
                              }}
                              formatter={(value) => [
                                `${value} startups`,
                                'Count'
                              ]}
                              labelFormatter={(label) => `${label}`}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-5 pt-5 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-gray-900">Funding Stages Breakdown</h4>
                          {selectedFundingStage && (
                            <button 
                              onClick={() => setSelectedFundingStage(null)}
                              className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-100 px-3 py-1.5 rounded-md transition-colors bg-purple-50"
                            >
                              ✕ Clear Filter
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto">
                          {fundingData.map((entry, index) => {
                            const isSelected = selectedFundingStage === entry.name;
                            const percentage = ((entry.value / fundingData.reduce((sum, stage) => sum + stage.value, 0)) * 100).toFixed(1);
                            const description = getFundingStageDescription(entry.name);
                            return (
                              <div 
                                key={index} 
                                onClick={() => setSelectedFundingStage(isSelected ? null : entry.name)}
                                onMouseEnter={() => setHoveredFundingStage(entry.name)}
                                onMouseLeave={() => setHoveredFundingStage(null)}
                                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 shadow-sm hover:shadow-md ${
                                  isSelected 
                                    ? 'bg-purple-50 border-purple-500 shadow-md' 
                                    : hoveredFundingStage === entry.name
                                    ? 'bg-gray-50 border-gray-300 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-purple-300'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="text-sm font-bold text-gray-900">{entry.name}</h5>
                                  <span className={`text-xs font-bold text-white rounded-full px-3 py-1 transition-colors ${
                                    isSelected 
                                      ? 'bg-purple-600' 
                                      : 'bg-purple-500 group-hover:bg-purple-600'
                                  }`}>{percentage}%</span>
                                </div>
                                {description && (
                                  <p className="text-xs text-gray-600 mb-3 italic">{description}</p>
                                )}
                                <div className="space-y-2">
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full transition-all duration-300" 
                                      style={{
                                        width: `${percentage}%`,
                                        backgroundColor: COLORS[index % COLORS.length]
                                      }}
                                    ></div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-600">Startups</span>
                                    <span className="text-sm font-bold text-gray-900 bg-gray-100 rounded px-2 py-1">{entry.value}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center flex-1 flex-col">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300 mb-2"><circle cx="12" cy="12" r="10"></circle></svg>
                      <p className="text-gray-600 font-medium">No funding data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Growth Trends */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-5">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mr-3"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                  Growth Trends by Industry
                </h3>
                <p className="text-sm text-gray-600 mt-1">Year-over-year growth analysis across all industries</p>
              </div>
              <div className="p-6">
                <div className="h-72">
                  {dashboardLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : growthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={growthData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="line"
                        />
                        {growthData.length > 0 &&
                          Object.keys(growthData[0])
                            .filter((key) => key !== "name")
                            .map((industry, index) => (
                              <Line
                                key={industry}
                                type="monotone"
                                dataKey={industry}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={2.5}
                                dot={{ fill: COLORS[index % COLORS.length], r: 4 }}
                                activeDot={{ r: 6 }}
                                isAnimationActive={true}
                              />
                            ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-600">No growth data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "rankings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
              {/* Header Section */}
              <div className="border-b border-gray-200 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-black flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mr-3"><path d="M6 9c0-1 1-2 2-2s2 1 2 2"></path><path d="M9 9h12M9 13h12M9 17h12M5 9c0-1-1-2-2-2S1 8 1 9"></path><path d="M5 13c0-1-1-2-2-2S1 12 1 13"></path><path d="M5 17c0-1-1-2-2-2S1 16 1 17"></path></svg>
                      Startup Rankings
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Comprehensive rankings by multiple performance metrics</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col sm:flex-row gap-3"> 
                      <select
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        value={selectedIndustry}
                        onChange={(e) => {
                          setSelectedIndustry(e.target.value);
                          setCurrentPage(0);
                        }}
                      >
                        <option className="text-gray-900" value="All">
                          All Industries
                        </option>
                        {industries.map((industry, index) => (
                          <option
                            className="text-gray-900"
                            key={index}
                            value={industry}
                          >
                            {industry}
                          </option>
                        ))}
                      </select>
                      <select
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        value={rankingMetric}
                        onChange={(e) => {
                          setRankingMetric(e.target.value);
                          setCurrentPage(0);
                        }}
                      >
                        <option className="text-gray-900" value="overall">
                          Overall Score
                        </option>
                        <option className="text-gray-900" value="growth">
                          Growth Score
                        </option>
                        <option className="text-gray-900" value="investment">
                          Investment Score
                        </option>
                        <option className="text-gray-900" value="ecosystem">
                          Ecosystem Score
                        </option>
                        <option className="text-gray-900" value="engagement">
                          Engagement Score
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Section */}
              <div className="p-6">
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                      <p className="text-gray-600 font-medium text-lg">Loading rankings...</p>
                    </div>
                  ) : (
                    <>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rank</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Startup</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Industry</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Overall Score</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Growth Score</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Investment Score</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ecosystem Score</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Engagement Score</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {rankedStartups.map((startup, index) => (
                            <tr key={startup.id} className="hover:bg-indigo-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                      {currentPage * itemsPerPage + index + 1}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">
                                  {startup.companyName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {startup.industry}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-sm font-semibold text-gray-900 bg-indigo-50 px-3 py-1 rounded-lg">
                                    {startup.overallScore}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-sm font-semibold text-gray-900 bg-blue-50 px-3 py-1 rounded-lg">
                                    {startup.growthScore}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-sm font-semibold text-gray-900 bg-purple-50 px-3 py-1 rounded-lg">
                                    {startup.investmentScore}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-sm font-semibold text-gray-900 bg-pink-50 px-3 py-1 rounded-lg">
                                    {startup.ecosystemScore}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-sm font-semibold text-gray-900 bg-amber-50 px-3 py-1 rounded-lg">
                                    {startup.engagementScore}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-6">
                        <PaginationControls />
                      </div>
                    </>
                  )}
                </div>
              </div>
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
                    disabled={psgcLoading}
                  >
                    <option value="All Regions">All Regions</option>
                    {psgcLoading ? (
                      <option value="" disabled>Loading regions...</option>
                    ) : (
                      availableRegions.map((region, index) => (
                        <option key={region.code || index} value={region.name || region}>
                          {region.regionName || region.name || region}
                        </option>
                      ))
                    )}
                  </select>
                  {psgcLoading && (
                    <div className="absolute right-10 top-2.5">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
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
            <h2 className="text-xl font-semibold mb-4 text-blue-900 flex items-center justify-between">
              <div>
                Startup Review
                {location.state?.startupName && (
                  <span className="ml-2 text-base font-normal text-amber-600">
                    (Reviewing: {location.state.startupName})
                  </span>
                )}
              </div>
              <button 
                onClick={refreshDashboard}
                className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-md flex items-center hover:bg-blue-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 12a9 9 0 0 0 6.7 15L13 21"></path><path d="M14 18H8"></path><path d="M17 14h-3"></path></svg>
                Refresh Data
              </button>
            </h2>
            
            <div className="bg-white rounded-lg shadow">
              <div className="p-5 border-b border-gray-200">
                <h3 className="text-md font-medium text-gray-800 mb-4">Filter Startups for Review</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-medium text-gray-600">Industry</label>
                    <select
                      className="border-gray-300 border rounded-md p-2 text-sm w-44 text-gray-800"
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                    >
                      <option value="All">All Industries</option>
                      {industries.map((industry, index) => (
                        <option key={index} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-medium text-gray-600">Region</label>
                    <select
                      className="border-gray-300 border rounded-md p-2 text-sm w-44 text-gray-800"
                      value={reportFormData.region}
                      onChange={(e) => 
                        setReportFormData(prev => ({...prev, region: e.target.value}))
                      }
                      disabled={psgcLoading}
                    >
                      <option value="All Regions">All Regions</option>
                      {psgcLoading ? (
                        <option value="" disabled>Loading regions...</option>
                      ) : (
                        availableRegions.map((region, index) => (
                          <option key={region.code || index} value={region.name || region}>
                            {region.regionName || region.name || region}
                          </option>
                        ))
                      )}
                    </select>
                    {psgcLoading && (
                      <div className="absolute right-10 top-2.5">
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-medium text-gray-600">Status</label>
                    <select
                      className="border-gray-300 border rounded-md p-2 text-sm w-44 text-gray-800"
                      value={reviewFilterStatus}
                      onChange={(e) => setReviewFilterStatus(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Needs Revision</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-medium text-gray-600">Search</label>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search startups..."
                        className="pl-9 pr-4 py-2 border border-gray-300 text-gray-800 rounded-md text-sm w-64"
                        value={reviewSearchQuery}
                        onChange={(e) => setReviewSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleReviewFilter();
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-end space-x-2 ml-auto">
                    <button 
                      onClick={resetReviewFilters}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-100 transition-colors"
                    >
                      Reset
                    </button>
                    <button 
                      onClick={handleReviewFilter}
                      disabled={reviewLoading}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm flex items-center hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                    >
                      {reviewLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Filtering...
                        </>
                      ) : (
                        <>
                          <Filter className="h-4 w-4 mr-1" />
                          Apply Filters
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                {reviewLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mr-2"></div>
                    <p className="text-gray-600">Loading startups for review...</p>
                  </div>
                ) : (
                  <StartupReviewSection 
                    startupId={selectedReviewStartupId}
                    industry={selectedIndustry}
                    region={reportFormData.region}
                    status={reviewFilterStatus}
                    searchQuery={reviewSearchQuery}
                    filteredStartups={filteredStartups.length > 0 ? filteredStartups : null}
                    onRefresh={handleReviewFilter}
                  />
                )}
              </div>
            </div>

            {/* 
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Pending Reviews</h3>
                <div className="flex items-center">
                  <div className="p-2 bg-amber-100 rounded mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </div>
                  <span className="text-xl font-semibold text-gray-800">
                    {filteredStartups.filter(s => s.reviewStatus === "pending")?.length || 0}
                  </span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Approved Startups</h3>
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <span className="text-xl font-semibold text-gray-800">
                    {filteredStartups.filter(s => s.reviewStatus === "approved")?.length || 0}
                  </span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Needs Revision</h3>
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  </div>
                  <span className="text-xl font-semibold text-gray-800">
                    {filteredStartups.filter(s => s.reviewStatus === "rejected")?.length || 0}
                  </span>
                </div>
              </div>
            </div>
             */}
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
