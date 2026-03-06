import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../Navbar/Navbar.jsx";
import ClientFilter from "./ClientFilter.jsx";
import ClientTable from "./ClientTable.jsx";
import "./Admin.css";

const VITE_API_URL_FORM = import.meta.env.VITE_API_URL_FORM;

const Admin = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    total: 0,
    today: 0,
  });               

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const [clientsRes, statsRes] = await Promise.all([
        axios.get(VITE_API_URL_FORM),
        axios.get(`${VITE_API_URL_FORM}/stats/overview`),
      ]);

      // Force array - handles object/null/undefined safely
      const clientsArray = Array.isArray(clientsRes.data.clients)
        ? clientsRes.data.clients
        : Array.isArray(clientsRes.data)
          ? clientsRes.data
          : [];
      setClients(clientsArray);
      setAnalytics({
        total: statsRes.data?.data?.total || clientsArray.length || 0,
        today: statsRes.data?.data?.today || 0,
      });
    } catch (err) {
      console.error("Error fetching clients:", err);
      setClients([]); // Ensure array on error
      setAnalytics({ total: 0, today: 0 });
      toast.error("❌ Failed to load clients");
    } finally {
      setLoading(false);
    }
  };


  const filterClients = () => {
    if (!searchTerm) {
      setFilteredClients(clients);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = clients.filter(
      (client) =>
        client.clientName?.toLowerCase().includes(term) ||
        client.surname?.toLowerCase().includes(term) ||
        client.contact?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.nationality?.toLowerCase().includes(term) ||
        client.fatherName?.toLowerCase().includes(term) ||
        client.motherName?.toLowerCase().includes(term)
    );
    setFilteredClients(filtered);
  };

  // ✅ VIEW BUTTON HANDLER - Opens ClientDetail page
  const handleEdit = (client) => {
    navigate(`/admin/client/${client._id}`, {
      state: { client }
    });
  };

  // ✅ DELETE BUTTON HANDLER
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await axios.delete(`${VITE_API_URL_FORM}/${id}`);
        toast.success("✅ Client deleted successfully");
        fetchClients(); // Refresh list
      } catch (err) {
        console.error("Error deleting client:", err);
        toast.error("❌ Failed to delete client");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const analyticsMax = Math.max(analytics.total, analytics.today, 1);
  const totalWidth = (analytics.total / analyticsMax) * 100;
  const todayWidth = (analytics.today / analyticsMax) * 100;

  return (
    <>
      <Navbar />
      <div className="admin-wrapper">
        <div className="admin-container">
          <div className="admin-header">
            <h2>Client Management</h2>
            <button
              onClick={() => navigate("/form")}
              className="btn-action edit"
            >
              Add Client
            </button>
          </div>

          <ClientFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalClients={filteredClients.length}
            onRefresh={fetchClients}
            loading={loading}
          />

          <div className="analytics-card">
            <div className="analytics-header">
              <h3>Records Analytics</h3>
              <span>Today vs Total</span>
            </div>

            <div className="analytics-bars">
              <div className="analytics-row">
                <div className="analytics-label">Total Records</div>
                <div className="analytics-track">
                  <div
                    className="analytics-fill analytics-fill-total"
                    style={{ width: `${totalWidth}%` }}
                  />
                </div>
                <div className="analytics-value">{analytics.total}</div>
              </div>

              <div className="analytics-row">
                <div className="analytics-label">Saved Today</div>
                <div className="analytics-track">
                  <div
                    className="analytics-fill analytics-fill-today"
                    style={{ width: `${todayWidth}%` }}
                  />
                </div>
                <div className="analytics-value">{analytics.today}</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="no-results">
              <p>⏳ Loading clients...</p>
            </div>
          ) : (
            <ClientTable
              clients={filteredClients}
              onEdit={handleEdit}  // ✅ This handles View button click
              onDelete={handleDelete}
              formatDate={formatDate}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Admin;