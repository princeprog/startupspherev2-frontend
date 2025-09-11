import { useState, useEffect, useMemo } from "react";
import {
  Check,
  X,
  Loader,
  Eye,
  Info,
  Globe,
  Map,
  Building,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Users,
  DollarSign,
  Award,
  Hash,
  Clock,
  Filter,
  Download,
  ArrowUpDown,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
} from "lucide-react";

export default function EnhancedStartupReviewSection() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    industry: "",
    status: "",
    country: "",
    dateRange: { start: null, end: null },
  });
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "companyName",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [uniqueIndustries, setUniqueIndustries] = useState([]);
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);

  // API Interaction States
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState({
    success: false,
    message: "",
  });
  const [actionVisible, setActionVisible] = useState(false);

  // Fetch startups data
  useEffect(() => {
    fetchStartups();
  }, []);

  // Extract unique filter options
  useEffect(() => {
    if (startups.length > 0) {
      setUniqueIndustries([
        ...new Set(startups.map((startup) => startup.industry).filter(Boolean)),
      ]);
      setUniqueCountries([
        ...new Set(startups.map((startup) => startup.country).filter(Boolean)),
      ]);
      setUniqueStatuses([
        ...new Set(startups.map((startup) => startup.status).filter(Boolean)),
      ]);
    }
  }, [startups]);

  // API call to fetch startups
  const fetchStartups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/email-verified`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch startups: ${response.status}`);
      }

      const data = await response.json();
      setStartups(data);
    } catch (err) {
      console.error("Error fetching startups:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler for approving a startup
  const handleApprove = async (id) => {
    await handleStartupAction(id, "approve", "Startup approved successfully!");
  };

  // Handler for rejecting a startup
  const handleReject = async (id) => {
    await handleStartupAction(id, "reject", "Startup rejected successfully!");
  };

  // Generic action handler for startup operations
  const handleStartupAction = async (id, action, successMessage) => {
    try {
      setIsActionLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/notifications/startups/${id}/${action}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} startup: ${response.status}`);
      }

      // Update local state
      setStartups(startups.filter((startup) => startup.id !== id));
      setActionResult({ success: true, message: successMessage });
      fetchStartups()

      if (selectedStartup && selectedStartup.id === id) {
        setIsPreviewOpen(false);
      }
    } catch (err) {
      console.error(`Failed to ${action} startup:`, err);
      setActionResult({ success: false, message: err.message });
    } finally {
      setIsActionLoading(false);
      setActionVisible(true);
      // Auto-hide notification after 3 seconds
      setTimeout(() => setActionVisible(false), 3000);
    }
  };

  // Export startups to CSV
  const exportToCSV = () => {
    const headers = [
      "Company Name",
      "Industry",
      "Founded Date",
      "Status",
      "City",
      "Country",
      "Contact Email",
      "Phone Number",
    ];

    const csvData = filteredStartups.map((startup) => [
      startup.companyName,
      startup.industry,
      formatDate(startup.foundedDate),
      startup.status,
      startup.city,
      startup.country,
      startup.contactEmail,
      startup.phoneNumber || "N/A",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `startups-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  // Sort function for data
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: "",
      industry: "",
      status: "",
      country: "",
      dateRange: { start: null, end: null },
    });
    setSortConfig({ key: "companyName", direction: "asc" });
    setCurrentPage(1);
  };

  // Apply filters to startups data
  const filteredStartups = useMemo(() => {
    let result = [...startups];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (startup) =>
          startup.companyName.toLowerCase().includes(searchLower) ||
          startup.industry?.toLowerCase().includes(searchLower) ||
          startup.companyDescription?.toLowerCase().includes(searchLower) ||
          startup.city?.toLowerCase().includes(searchLower) ||
          startup.contactEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Apply industry filter
    if (filters.industry) {
      result = result.filter(
        (startup) => startup.industry === filters.industry
      );
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((startup) => startup.status === filters.status);
    }

    // Apply country filter
    if (filters.country) {
      result = result.filter((startup) => startup.country === filters.country);
    }

    // Apply date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      result = result.filter((startup) => {
        const foundedDate = new Date(startup.foundedDate);
        return foundedDate >= startDate && foundedDate <= endDate;
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Handle null values by treating them as empty strings or 0
        const aVal =
          a[sortConfig.key] || (typeof a[sortConfig.key] === "number" ? 0 : "");
        const bVal =
          b[sortConfig.key] || (typeof b[sortConfig.key] === "number" ? 0 : "");

        if (aVal < bVal) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [startups, filters, sortConfig]);

  const totalPages = Math.ceil(filteredStartups.length / itemsPerPage);
  const paginatedStartups = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredStartups.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredStartups, currentPage, itemsPerPage]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStatusBadge = (status) => {
    const statusColors = {
      "In Review": "bg-yellow-100 text-yellow-800 border-yellow-300",
      Approved: "bg-green-100 text-green-800 border-green-300",
      Rejected: "bg-red-100 text-red-800 border-red-300",
      Pending: "bg-blue-100 text-blue-800 border-blue-300",
    };

    const defaultColor = "bg-gray-100 text-gray-800 border-gray-300";
    const colorClass = statusColors[status] || defaultColor;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}
      >
        {status}
      </span>
    );
  };

  if (loading && startups.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading startups...</span>
      </div>
    );
  }

  if (error && startups.length === 0) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg shadow border border-red-200">
        <div className="flex items-center mb-3">
          <AlertTriangle size={20} className="mr-2" />
          <h3 className="font-semibold">Error loading startups</h3>
        </div>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchStartups}
          className="mt-4 flex items-center px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          <RefreshCw size={16} className="mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-3 sm:mb-0">
          Startup Review Dashboard
        </h2>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltersVisible(!filtersVisible)}
            className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded flex items-center hover:bg-blue-100 transition-colors"
          >
            <Filter size={16} className="mr-1" />
            {filtersVisible ? "Hide Filters" : "Show Filters"}
          </button>

          <button
            onClick={exportToCSV}
            className="px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded flex items-center hover:bg-green-100 transition-colors"
          >
            <Download size={16} className="mr-1" />
            Export CSV
          </button>

          <button
            onClick={fetchStartups}
            className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded flex items-center hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={16} className="mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {filtersVisible && (
        <div className="p-4 border-b bg-blue-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="industry-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Industry
              </label>
              <select
                id="industry-filter"
                value={filters.industry}
                onChange={(e) =>
                  setFilters({ ...filters, industry: e.target.value })
                }
                className="w-full text-black p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Industries</option>
                {uniqueIndustries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full text-black p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="country-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Country
              </label>
              <select
                id="country-filter"
                value={filters.country}
                onChange={(e) =>
                  setFilters({ ...filters, country: e.target.value })
                }
                className="w-full text-black p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Countries</option>
                {uniqueCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="date-range-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Founded After
              </label>
              <input
                id="date-range-filter"
                type="date"
                value={filters.dateRange.start || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: e.target.value },
                  })
                }
                className="w-full text-black p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="date-range-end-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Founded Before
              </label>
              <input
                id="date-range-end-filter"
                type="date"
                value={filters.dateRange.end || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: e.target.value },
                  })
                }
                className="w-full text-black p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 mr-2"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 flex flex-col sm:flex-row justify-between items-center border-b">
        <div className="relative w-full sm:w-96 mb-3 sm:mb-0">
          <input
            type="text"
            placeholder="Search by name, industry, description..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10 pr-4 py-2 text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <span>
            Showing{" "}
            {filteredStartups.length ? (currentPage - 1) * itemsPerPage + 1 : 0}
            -{Math.min(currentPage * itemsPerPage, filteredStartups.length)} of{" "}
            {filteredStartups.length} startups
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="ml-2 border rounded p-1"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {actionVisible && (
        <div
          className={`transition-all duration-300 fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            actionResult.success
              ? "bg-green-100 border-l-4 border-green-500"
              : "bg-red-100 border-l-4 border-red-500"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {actionResult.success ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  actionResult.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {actionResult.message}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setActionVisible(false)}
                className="inline-flex text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredStartups.length === 0 ? (
        <div className="p-10 text-center text-gray-500">
          <Info size={40} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2">
            No startups found matching your criteria.
          </p>
          <p className="text-sm text-gray-400">
            Try adjusting your filters or search terms.
          </p>
          {filters.search ||
          filters.industry ||
          filters.status ||
          filters.country ||
          filters.dateRange.start ||
          filters.dateRange.end ? (
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors inline-flex items-center"
            >
              <RefreshCw size={16} className="mr-2" />
              Reset All Filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th
                  className="p-3 text-left text-sm font-medium border-b"
                  onClick={() => handleSort("companyName")}
                >
                  <div className="flex items-center cursor-pointer group">
                    Company
                    <ArrowUpDown
                      size={14}
                      className={`ml-1 ${
                        sortConfig.key === "companyName"
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                  </div>
                </th>
                <th
                  className="p-3 text-left text-sm font-medium border-b"
                  onClick={() => handleSort("industry")}
                >
                  <div className="flex items-center cursor-pointer group">
                    Industry
                    <ArrowUpDown
                      size={14}
                      className={`ml-1 ${
                        sortConfig.key === "industry"
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                  </div>
                </th>
                <th
                  className="p-3 text-left text-sm font-medium border-b"
                  onClick={() => handleSort("foundedDate")}
                >
                  <div className="flex items-center cursor-pointer group">
                    Founded
                    <ArrowUpDown
                      size={14}
                      className={`ml-1 ${
                        sortConfig.key === "foundedDate"
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                  </div>
                </th>
                <th
                  className="p-3 text-left text-sm font-medium border-b"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center cursor-pointer group">
                    Status
                    <ArrowUpDown
                      size={14}
                      className={`ml-1 ${
                        sortConfig.key === "status"
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                  </div>
                </th>
                <th
                  className="p-3 text-left text-sm font-medium border-b"
                  onClick={() => handleSort("country")}
                >
                  <div className="flex items-center cursor-pointer group">
                    Location
                    <ArrowUpDown
                      size={14}
                      className={`ml-1 ${
                        sortConfig.key === "country"
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                  </div>
                </th>
                <th className="p-3 text-left text-sm font-medium border-b">
                  Contact
                </th>
                <th className="p-3 text-center text-sm font-medium border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedStartups.map((startup) => (
                <tr
                  key={startup.id}
                  className="hover:bg-blue-50 border-b text-gray-500 transition-colors"
                >
                  <td className="p-3">
                    <div className="font-medium text-gray-900">
                      {startup.companyName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {startup.companyDescription?.substring(0, 80)}
                      {startup.companyDescription?.length > 80 ? "..." : ""}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center text-sm">
                      <Briefcase size={14} className="mr-1 text-gray-400" />
                      {startup.industry || "N/A"}
                    </div>
                    {startup.businessActivity && (
                      <div className="text-xs text-gray-500 mt-1">
                        {startup.businessActivity}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center text-xs">
                      <Calendar size={14} className="mr-1 text-gray-400 " />
                      {formatDate(startup.foundedDate)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {startup.typeOfCompany || "N/A"}
                    </div>
                  </td>
                  <td className="p-3">{renderStatusBadge(startup.status)}</td>
                  <td className="p-3">
                    <div className="flex items-center text-sm">
                      <Map size={14} className="mr-1 text-gray-400" />
                      {startup.city || "N/A"}, {startup.province || ""}
                    </div>
                    
                  </td>
                  <td className="p-3">
                    <div className="flex items-center text-sm">
                      <Mail size={14} className="mr-1 text-gray-400" />
                      {startup.contactEmail || "N/A"}
                    </div>
                    {startup.phoneNumber && (
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Phone size={12} className="mr-1 text-gray-400" />
                        {startup.phoneNumber}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedStartup(startup);
                          setIsPreviewOpen(true);
                        }}
                        className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Preview Details"
                        disabled={isActionLoading}
                      >
                        <Eye size={16} />
                      </button>

                      {startup.status === "In Review" && (
                        <>
                          <button
                            onClick={() => handleApprove(startup.id)}
                            className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            title="Approve"
                            disabled={isActionLoading}
                          >
                            {isActionLoading &&
                            selectedStartup?.id === startup.id ? (
                              <Loader size={16} className="animate-spin" />
                            ) : (
                              <Check size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(startup.id)}
                            className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            title="Reject"
                            disabled={isActionLoading}
                          >
                            {isActionLoading &&
                            selectedStartup?.id === startup.id ? (
                              <Loader size={16} className="animate-spin" />
                            ) : (
                              <X size={16} />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredStartups.length > 0 && (
        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`p-2 rounded ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              <ChevronLeft size={16} className="ml-[-14px]" />
            </button>

            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            ></button>

            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "hover:bg-blue-50 text-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            ></button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              <ChevronRight size={16} className="ml-[-14px]" />
            </button>
          </div>
        </div>
      )}

      {isPreviewOpen && selectedStartup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-4/5 max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center text-blue-900">
                <Building className="mr-2" size={20} />
                {selectedStartup.companyName}
              </h2>
              <div className="flex items-center space-x-3">
                {selectedStartup.status === "In Review" && (
                  <>
                    <button
                      onClick={() => handleReject(selectedStartup.id)}
                      disabled={isActionLoading}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center text-sm disabled:opacity-50"
                    >
                      {isActionLoading ? (
                        <Loader size={16} className="mr-1 animate-spin" />
                      ) : (
                        <X size={16} className="mr-1" />
                      )}
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(selectedStartup.id)}
                      disabled={isActionLoading}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm disabled:opacity-50"
                    >
                      {isActionLoading ? (
                        <Loader size={16} className="mr-1 animate-spin" />
                      ) : (
                        <Check size={16} className="mr-1" />
                      )}
                      <span>Approve</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1 hover:bg-blue-700 text-black rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 flex-grow">
              {/* Status Banner */}
              <div className="flex items-center justify-between mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center">
                  <Info size={18} className="text-blue-700 mr-2" />
                  <span className={`text-sm text-blue-800 ${selectedStartup.status === "Approved" ? 'text-green-500':selectedStartup.status === "Rejected" ? 'text-red-700': ''}`}>
                    Status: <strong>{selectedStartup.status}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Eye size={16} className="text-blue-700 mr-1" />
                    <span className="text-sm text-blue-800">
                      Views: {selectedStartup.viewsCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="text-blue-700 mr-1" />
                    <span className="text-sm text-blue-800">
                      Submitted:{" "}
                      {formatDate(
                        selectedStartup.createdAt || selectedStartup.foundedDate
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Company Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium text-blue-900 border-b pb-2 mb-4 flex items-center">
                      <Building size={18} className="mr-2" />
                      Company Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Company Name
                        </p>
                        <p className="text-gray-800 font-medium">
                          {selectedStartup.companyName}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Type of Company
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.typeOfCompany || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Industry
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.industry}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Business Activity
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.businessActivity || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Founded Date
                        </p>
                        <p className="text-gray-800">
                          {formatDate(selectedStartup.foundedDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Company Size
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.numberOfEmployees || "N/A"} employees
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Operating Hours
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.operatingHours || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium text-blue-900 border-b pb-2 mb-4">
                      Company Description
                    </h3>
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedStartup.companyDescription ||
                        "No description provided."}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium text-blue-900 border-b pb-2 mb-4 flex items-center">
                      <DollarSign size={18} className="mr-2" />
                      Funding Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Funding Stage
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.fundingStage || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Number of Funding Rounds
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.numberOfFundingRounds || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Active Startups
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.numberOfActiveStartups || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          New Startups This Year
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.numberOfNewStartupsThisYear || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Startup Survival Rate
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.startupSurvivalRate
                            ? `${selectedStartup.startupSurvivalRate}%`
                            : "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Growth Rate
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.averageStartupGrowthRate
                            ? `${selectedStartup.averageStartupGrowthRate}%`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Contact & Social */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium text-blue-900 border-b pb-2 mb-4 flex items-center">
                      <Mail size={18} className="mr-2" />
                      Contact Details
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500 flex items-center">
                          <Mail size={14} className="mr-1" /> Email
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.contactEmail}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 flex items-center">
                          <Phone size={14} className="mr-1" /> Phone
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.phoneNumber || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 flex items-center">
                          <Map size={14} className="mr-1" /> Location
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.city || "N/A"},{" "}
                          {selectedStartup.province || ""},{" "}
                          {selectedStartup.country || ""}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {selectedStartup.streetAddress || ""}{" "}
                          {selectedStartup.postalCode || ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium text-blue-900 border-b pb-2 mb-4 flex items-center">
                      <Globe size={18} className="mr-2" />
                      Web Presence
                    </h3>

                    <div className="space-y-3">
                      {selectedStartup.website && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Website
                          </p>
                          <a
                            href={selectedStartup.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-words"
                          >
                            {selectedStartup.website}
                          </a>
                        </div>
                      )}

                      {selectedStartup.linkedIn && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            LinkedIn
                          </p>
                          <a
                            href={selectedStartup.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-words"
                          >
                            {selectedStartup.linkedIn.replace(
                              "https://www.linkedin.com/company/",
                              ""
                            )}
                          </a>
                        </div>
                      )}

                      {selectedStartup.facebook && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Facebook
                          </p>
                          <a
                            href={selectedStartup.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-words"
                          >
                            {selectedStartup.facebook.replace(
                              "https://www.facebook.com/",
                              ""
                            )}
                          </a>
                        </div>
                      )}

                      {selectedStartup.twitter && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Twitter
                          </p>
                          <a
                            href={selectedStartup.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-words"
                          >
                            {selectedStartup.twitter.replace(
                              "https://twitter.com/",
                              "@"
                            )}
                          </a>
                        </div>
                      )}

                      {selectedStartup.instagram && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Instagram
                          </p>
                          <a
                            href={selectedStartup.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-words"
                          >
                            {selectedStartup.instagram.replace(
                              "https://www.instagram.com/",
                              "@"
                            )}
                          </a>
                        </div>
                      )}

                      {!selectedStartup.website &&
                        !selectedStartup.linkedIn &&
                        !selectedStartup.facebook &&
                        !selectedStartup.twitter &&
                        !selectedStartup.instagram && (
                          <p className="text-gray-500 italic">
                            No web presence information provided.
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium text-blue-900 border-b pb-2 mb-4 flex items-center">
                      <Users size={18} className="mr-2" />
                      Ecosystem Information
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Number of Mentors
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.numberOfMentorsOrAdvisorsInvolved ||
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Incubation Programs
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.numberOfStartupsInIncubationPrograms ||
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Public-Private Partnerships
                        </p>
                        <p className="text-gray-800">
                          {selectedStartup.publicPrivatePartnershipsInvolvingStartups ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium text-blue-900 border-b pb-2 mb-4 flex items-center">
                      <Clock size={18} className="mr-2" />
                      Review Timeline
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                          <Mail size={14} className="text-blue-700" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Startup Submitted
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(
                              selectedStartup.createdAt ||
                                selectedStartup.foundedDate
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-green-100 rounded-full p-1 mr-3 mt-0.5">
                          <Check size={14} className="text-green-700" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Email Verified
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(
                              selectedStartup.emailVerifiedAt ||
                                selectedStartup.foundedDate
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div
                          className={`${
                            selectedStartup.status === "Approved"
                              ? "bg-green-100"
                              : selectedStartup.status === "Rejected"
                              ? "bg-red-100"
                              : "bg-gray-100"
                          } rounded-full p-1 mr-3 mt-0.5`}
                        >
                          {selectedStartup.status === "Approved" ? (
                            <Check size={14} className="text-green-700" />
                          ) : selectedStartup.status === "Rejected" ? (
                            <X size={14} className="text-red-700" />
                          ) : (
                            <Clock size={14} className="text-gray-700" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Final Decision
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedStartup.status === "Approved" ||
                            selectedStartup.status === "Rejected"
                              ? formatDate(
                                  selectedStartup.updatedAt ||
                                    selectedStartup.foundedDate
                                )
                              : "Pending"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
