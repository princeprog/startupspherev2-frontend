import React, { useState, useEffect } from "react";
import { Search, X, UserPlus, Users, Mail, Phone, MapPin, ChevronRight, Loader2 } from "lucide-react";

const StakeholderBrowser = ({ 
  isOpen, 
  onClose, 
  onSelectStakeholder, 
  onCreateNew,
  startupId 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stakeholders, setStakeholders] = useState([]);
  const [filteredStakeholders, setFilteredStakeholders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [isAssociating, setIsAssociating] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingStakeholder, setPendingStakeholder] = useState(null);
  const [associationRole, setAssociationRole] = useState("Mentor");
  const [associationStatus, setAssociationStatus] = useState("Active");

  // Fetch all stakeholders from database
  useEffect(() => {
    if (isOpen) {
      fetchStakeholders();
    }
  }, [isOpen]);

  // Filter stakeholders based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStakeholders(stakeholders);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = stakeholders.filter(
        (stakeholder) =>
          stakeholder.name?.toLowerCase().includes(query) ||
          stakeholder.email?.toLowerCase().includes(query) ||
          stakeholder.role?.toLowerCase().includes(query) ||
          stakeholder.city?.toLowerCase().includes(query) ||
          stakeholder.province?.toLowerCase().includes(query)
      );
      setFilteredStakeholders(filtered);
    }
  }, [searchQuery, stakeholders]);

  const fetchStakeholders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/stakeholders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stakeholders");
      }

      const data = await response.json();
      setStakeholders(data);
      setFilteredStakeholders(data);
    } catch (error) {
      console.error("Error fetching stakeholders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAndAssociate = async (stakeholder) => {
    // Show role selection modal first
    setPendingStakeholder(stakeholder);
    setAssociationRole(stakeholder.role || "Mentor");
    setAssociationStatus(stakeholder.status || "Active");
    setShowRoleModal(true);
  };

  const confirmAssociation = async () => {
    if (!pendingStakeholder) return;
    
    setSelectedStakeholder(pendingStakeholder);
    setIsAssociating(true);
    
    try {
      // Associate the selected stakeholder with the startup
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startup-stakeholders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            startupId: startupId,
            stakeholderId: pendingStakeholder.id,
            role: associationRole,
            status: associationStatus,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to associate stakeholder");
      }

      // Call the parent callback with success
      onSelectStakeholder({
        ...pendingStakeholder,
        role: associationRole,
        status: associationStatus,
      });
      handleClose();
    } catch (error) {
      console.error("Error associating stakeholder:", error);
      alert(error.message || "Failed to associate stakeholder with startup");
      setIsAssociating(false);
    } finally {
      setShowRoleModal(false);
      setPendingStakeholder(null);
      setSelectedStakeholder(null);
      setIsAssociating(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedStakeholder(null);
    setIsAssociating(false);
    setShowRoleModal(false);
    setPendingStakeholder(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="mr-3 text-blue-600" size={28} />
              Select Stakeholder
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Browse existing stakeholders or create a new one
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isAssociating}
            className="rounded-full p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search and Create New Section */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, role, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 text-gray-800 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Create New Button */}
            <button
              type="button"
              onClick={() => {
                handleClose();
                onCreateNew();
              }}
              disabled={isAssociating}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus size={18} className="mr-2" />
              Create New
            </button>
          </div>
          
          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600">
            {loading ? (
              <span>Loading stakeholders...</span>
            ) : (
              <span>
                Showing {filteredStakeholders.length} of {stakeholders.length} stakeholders
              </span>
            )}
          </div>
        </div>

        {/* Stakeholder List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-gray-600">Loading stakeholders...</p>
            </div>
          ) : filteredStakeholders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="text-gray-300 mb-4" size={64} />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchQuery ? "No stakeholders found" : "No stakeholders available"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Start by creating your first stakeholder"}
              </p>
              <button
                onClick={() => {
                  handleClose();
                  onCreateNew();
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
              >
                <UserPlus size={18} className="mr-2" />
                Create First Stakeholder
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStakeholders.map((stakeholder) => (
                <div
                  key={stakeholder.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white"
                  onClick={() => !isAssociating && handleSelectAndAssociate(stakeholder)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {stakeholder.name}
                        </h3>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {stakeholder.role || "Stakeholder"}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        {stakeholder.email && (
                          <div className="flex items-center">
                            <Mail size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{stakeholder.email}</span>
                          </div>
                        )}
                        
                        {stakeholder.phoneNumber && (
                          <div className="flex items-center">
                            <Phone size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                            <span>{stakeholder.phoneNumber}</span>
                          </div>
                        )}
                        
                        {(stakeholder.city || stakeholder.province) && (
                          <div className="flex items-center md:col-span-2">
                            <MapPin size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {[stakeholder.city, stakeholder.province]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {stakeholder.status && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            stakeholder.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {stakeholder.status}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {isAssociating && selectedStakeholder?.id === stakeholder.id ? (
                      <div className="ml-4 flex items-center text-blue-600">
                        <Loader2 className="animate-spin" size={20} />
                      </div>
                    ) : (
                      <div className="ml-4 flex items-center text-gray-400">
                        <ChevronRight size={20} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isAssociating}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Role and Status Selection Modal */}
      {showRoleModal && pendingStakeholder && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Set Role and Status
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Configure how <span className="font-semibold">{pendingStakeholder.name}</span> will be associated with this startup
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={associationRole}
                  onChange={(e) => setAssociationRole(e.target.value)}
                  className="w-full px-4 py-2.5 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isAssociating}
                >
                  <option value="Founder">Founder</option>
                  <option value="Co-Founder">Co-Founder</option>
                  <option value="CEO">CEO</option>
                  <option value="CTO">CTO</option>
                  <option value="CFO">CFO</option>
                  <option value="COO">COO</option>
                  <option value="Board Member">Board Member</option>
                  <option value="Investor">Investor</option>
                  <option value="Advisor">Advisor</option>
                  <option value="Mentor">Mentor</option>
                  <option value="Partner">Partner</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Employee">Employee</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={associationStatus}
                  onChange={(e) => setAssociationStatus(e.target.value)}
                  className="w-full px-4 py-2.5 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isAssociating}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Former">Former</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> The role and status you select here will be specific to this startup. 
                  The stakeholder's general profile will remain unchanged.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRoleModal(false);
                  setPendingStakeholder(null);
                }}
                disabled={isAssociating}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAssociation}
                disabled={isAssociating}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssociating ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Associating...
                  </>
                ) : (
                  <>
                    <ChevronRight size={18} className="mr-1" />
                    Associate Stakeholder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StakeholderBrowser;
