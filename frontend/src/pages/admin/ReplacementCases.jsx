import React, { useEffect, useState } from "react";
import { resolveImageUrl } from "../../lib/images";
import api from "../../lib/api";
import Swal, { errorAlert, toastSuccess, warningConfirm } from "../../lib/swal";

export default function AdminReplacementCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [search, setSearch] = useState("");

  const loadCases = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== "all") params.append("status", filters.status);
      params.append("page", page);
      params.append("per_page", 15);

      const { data } = await api.get(`/admin/replacement-cases?${params}`);
      setCases(data.data.data || []);
      setTotalPages(data.data.last_page || 1);
      setCurrentPage(page);
    } catch (e) {
      console.error("Failed to load replacement cases", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases(1);
  }, [filters]);

  const showCaseDetails = async (caseItem) => {
    setSelectedCase(caseItem);
    setShowDetails(true);
  };

  const handleApprove = async () => {
    const confirmRes = await warningConfirm({
      khTitle: "អនុម័តសំណើប្តូរ",
      enTitle: "Approve replacement",
      khText: "តើអ្នកចង់អនុម័តសំណើនេះមែនទេ?",
      enText: "Approve this replacement case?",
    });
    if (!confirmRes.isConfirmed) return;
    setActionInProgress(true);
    try {
      const { data } = await api.post(`/admin/replacement-cases/${selectedCase.id}/approve`);
      loadCases(currentPage);
      setSelectedCase(data.data || selectedCase);
      await toastSuccess({ khText: "បានអនុម័តសំណើដោយជោគជ័យ", enText: "Replacement approved" });
    } catch (e) {
      console.error("Failed to approve case", e);
      await errorAlert({
        khTitle: "អនុម័តបរាជ័យ",
        enTitle: "Approve failed",
        detail: "Failed to approve: " + (e.response?.data?.message || e.message),
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async () => {
    const inputRes = await Swal.fire({
      icon: "warning",
      title: "សរសេរមូលហេតុបដិសេធ (Enter rejection reason)",
      input: "text",
      inputPlaceholder: "Enter rejection reason",
      showCancelButton: true,
      confirmButtonColor: "#497869",
      confirmButtonText: "បញ្ជាក់ (Confirm)",
      cancelButtonText: "បោះបង់ (Cancel)",
    });
    const reason = inputRes.value?.trim();
    if (!inputRes.isConfirmed || !reason) return;
    setActionInProgress(true);
    try {
      await api.post(`/admin/replacement-cases/${selectedCase.id}/reject`, {
        notes: reason,
      });
      loadCases(currentPage);
      setShowDetails(false);
      await toastSuccess({ khText: "បានបដិសេធសំណើដោយជោគជ័យ", enText: "Replacement rejected" });
    } catch (e) {
      console.error("Failed to reject case", e);
      await errorAlert({
        khTitle: "បដិសេធបរាជ័យ",
        enTitle: "Reject failed",
        detail: "Failed to reject: " + (e.response?.data?.message || e.message),
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleComplete = async () => {
    const confirmRes = await warningConfirm({
      khTitle: "បញ្ចប់សំណើ",
      enTitle: "Complete case",
      khText: "តើអ្នកចង់សម្គាល់សំណើនេះថាបានបញ្ចប់មែនទេ?",
      enText: "Mark this case as completed?",
    });
    if (!confirmRes.isConfirmed) return;
    setActionInProgress(true);
    try {
      const { data } = await api.post(`/admin/replacement-cases/${selectedCase.id}/complete`);
      loadCases(currentPage);
      setSelectedCase(data.data || selectedCase);
      await toastSuccess({ khText: "បានបញ្ចប់សំណើដោយជោគជ័យ", enText: "Case completed" });
    } catch (e) {
      console.error("Failed to complete case", e);
      await errorAlert({
        khTitle: "បញ្ចប់បរាជ័យ",
        enTitle: "Complete failed",
        detail: "Failed to complete: " + (e.response?.data?.message || e.message),
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-100",
      approved: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-100",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-100",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100",
      completed: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-100",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-100";
  };

  const filteredCases = cases.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(c.id || "").toLowerCase().includes(q) ||
      String(c.order?.order_number || "").toLowerCase().includes(q) ||
      String(c.order?.user?.name || c.order?.user?.email || "").toLowerCase().includes(q) ||
      String(c.reason || "").toLowerCase().includes(q) ||
      String(c.status || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 dark:text-slate-100">
            Replacement Cases
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage customer replacement requests
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-black focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: "all" })}
                className="w-full px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Reset
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">
                Search
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cases..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-black focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-black dark:border-slate-800"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              Loading replacement cases...
            </p>
          </div>
        )}

        {/* Cases Table */}
        {!loading && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            {filteredCases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">
                  No replacement cases found
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Products
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Handled By
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredCases.map((caseItem) => (
                        <tr
                          key={caseItem.id}
                          className="hover:bg-slate-50 transition dark:hover:bg-slate-800"
                        >
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium dark:text-slate-100">
                            #{caseItem.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">
                            {caseItem.order?.order_number || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">
                            {caseItem.order?.user?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">
                            {caseItem.reason}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                caseItem.status
                              )}`}
                            >
                              {caseItem.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex flex-wrap gap-2">
                              {(caseItem.order?.items || []).slice(0, 4).map((item) => (
                                <div key={item.id} className="h-10 w-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                                  <img
                                    src={resolveImageUrl(item.product?.image_url)}
                                    alt={item.product?.name || item.name || ""}
                                    onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">
                            {caseItem.handled_by ? (caseItem.handledBy?.name || caseItem.handledBy?.email || "Admin") : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">
                            {new Date(caseItem.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => showCaseDetails(caseItem)}
                              title="View details"
                              className="h-9 w-9 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg inline-flex items-center justify-center dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 dark:border-slate-800">
                    <p className="text-sm text-slate-500 shrink-0 dark:text-slate-300">
                      Page <span className="font-medium text-slate-700 dark:text-slate-100">{currentPage}</span> of <span className="font-medium text-slate-700 dark:text-slate-100">{totalPages}</span>
                    </p>
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => loadCases(1)}
                        disabled={currentPage === 1}
                        className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-35 disabled:cursor-not-allowed transition text-xs dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="First page"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                      </button>
                      <button
                        onClick={() => loadCases(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-35 disabled:cursor-not-allowed transition dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="Previous page"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      {(() => {
                        const delta = 1;
                        const range = [];
                        const rangeWithDots = [];
                        let l;
                        for (let i = 1; i <= totalPages; i++) {
                          if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                            range.push(i);
                          }
                        }
                        for (const i of range) {
                          if (l !== undefined) {
                            if (i - l === 2) rangeWithDots.push(l + 1);
                            else if (i - l > 2) rangeWithDots.push("...");
                          }
                          rangeWithDots.push(i);
                          l = i;
                        }
                        return rangeWithDots.map((item, idx) =>
                          item === "..." ? (
                            <span key={"dot-" + idx} className="h-9 w-9 flex items-center justify-center text-sm text-slate-400 select-none dark:text-slate-600">…</span>
                          ) : (
                            <button
                              key={item}
                              onClick={() => loadCases(item)}
                              className={"h-9 w-9 flex items-center justify-center rounded-lg text-sm font-medium transition " + (currentPage === item
                                ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                                : "border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                              )}
                            >
                              {item}
                            </button>
                          )
                        );
                      })()}
                      <button
                        onClick={() => loadCases(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-35 disabled:cursor-not-allowed transition dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="Next page"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </button>
                      <button
                        onClick={() => loadCases(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-35 disabled:cursor-not-allowed transition text-xs dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="Last page"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Case Details Modal */}
        {showDetails && selectedCase && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 dark:border dark:border-slate-700 dark:bg-slate-900">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Replacement Case Details
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Case ID
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      #{selectedCase.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Order
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {selectedCase.order?.order_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Customer
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {selectedCase.order?.user?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Status
                    </p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${getStatusBadge(
                        selectedCase.status
                      )}`}
                    >
                      {selectedCase.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Handled By
                    </p>
                    <p className="text-slate-900 dark:text-slate-100">
                      {selectedCase.handled_by ? (selectedCase.handledBy?.name || selectedCase.handledBy?.email || "Admin") : "-"}
                    </p>
                  </div>
                </div>

                {selectedCase.order?.items?.length ? (
                  <div>
                    <p className="text-sm text-slate-500 mb-2 dark:text-slate-400">
                      Products
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {selectedCase.order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 border border-slate-200 rounded-lg p-2 dark:border-slate-700">
                          <div className="h-12 w-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                            <img
                              src={resolveImageUrl(item.product?.image_url)}
                              alt={item.product?.name || item.name || ""}
                              onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {item.product?.name || item.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Qty: {item.qty ?? item.quantity ?? 1}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Reason
                  </p>
                  <p className="text-slate-900 dark:text-slate-100">
                    {selectedCase.reason}
                  </p>
                </div>

                {selectedCase.notes && (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Notes
                    </p>
                    <p className="text-slate-900 dark:text-slate-100">
                      {selectedCase.notes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Submitted
                    </p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">
                      {new Date(selectedCase.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 dark:border-slate-800">
                {selectedCase.status === "pending" && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={actionInProgress}
                      className="h-9 px-4 bg-black text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition text-sm font-medium dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white/80"
                    >
                      Approve
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionInProgress}
                      className="h-9 px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition text-sm font-medium dark:border-red-400/60 dark:text-red-200 dark:hover:bg-red-900/30"
                    >
                      Reject
                    </button>
                  </>
                )}
                {selectedCase.status === "approved" && (
                  <button
                    onClick={handleComplete}
                    disabled={actionInProgress}
                    className="h-9 px-4 bg-black text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition text-sm font-medium dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white/80"
                  >
                    Mark Complete
                  </button>
                )}
                <button
                  onClick={() => setShowDetails(false)}
                  className="h-9 px-4 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
