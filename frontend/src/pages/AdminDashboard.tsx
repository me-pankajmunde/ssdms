import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Heart, Users, FileText,
  IndianRupee, TrendingUp, LogOut, Settings, Plus
} from 'lucide-react';
import { DashboardStats, DonationCategoryLabels, DonationCategory } from '../types';
import { adminApi, authApi } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [dashboardResponse, userResponse] = await Promise.all([
          adminApi.getDashboard(),
          authApi.getCurrentUser(),
        ]);

        if (dashboardResponse.success) {
          setStats(dashboardResponse.data);
        }

        if (userResponse.success) {
          setUser({
            name: userResponse.data.profile.name,
            role: userResponse.data.role,
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // If unauthorized, redirect to login
        localStorage.removeItem('token');
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-dark text-white p-4 hidden lg:block">
        <div className="mb-8">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-saffron rounded-full flex items-center justify-center text-xl">
              🙏
            </div>
            <div className="ml-3">
              <h1 className="font-bold">SSDMS Temple</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          <Link to="/admin" className="sidebar-link active">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link to="/admin/events" className="sidebar-link">
            <Calendar className="w-5 h-5 mr-3" />
            Events
          </Link>
          <Link to="/admin/donations" className="sidebar-link">
            <Heart className="w-5 h-5 mr-3" />
            Donations
          </Link>
          <Link to="/admin/users" className="sidebar-link">
            <Users className="w-5 h-5 mr-3" />
            Users
          </Link>
          <Link to="/admin/reports" className="sidebar-link">
            <FileText className="w-5 h-5 mr-3" />
            Reports
          </Link>
          <Link to="/admin/settings" className="sidebar-link">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-3 bg-white/10 rounded-lg mb-3">
            <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'Admin'}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-gray-500">Today</span>
            </div>
            <p className="text-2xl font-bold text-dark">
              {formatCurrency(stats?.donations.today.amount || 0)}
            </p>
            <p className="text-sm text-gray-500">
              {stats?.donations.today.count || 0} donations
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500">This Week</span>
            </div>
            <p className="text-2xl font-bold text-dark">
              {formatCurrency(stats?.donations.thisWeek.amount || 0)}
            </p>
            <p className="text-sm text-gray-500">
              {stats?.donations.thisWeek.count || 0} donations
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-gray-500">This Month</span>
            </div>
            <p className="text-2xl font-bold text-dark">
              {formatCurrency(stats?.donations.thisMonth.amount || 0)}
            </p>
            <p className="text-sm text-gray-500">
              {stats?.donations.thisMonth.count || 0} donations
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500">Upcoming</span>
            </div>
            <p className="text-2xl font-bold text-dark">
              {stats?.events.upcoming || 0}
            </p>
            <p className="text-sm text-gray-500">events scheduled</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Events */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Today's Events</h2>
              <Link to="/admin/events" className="text-primary text-sm hover:underline">
                View All
              </Link>
            </div>
            {stats?.events.today && stats.events.today.length > 0 ? (
              <div className="space-y-3">
                {stats.events.today.map((event) => (
                  <div key={event.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium marathi">{event.title.marathi}</p>
                      <p className="text-xs text-gray-500">
                        {event.startTime} • {event.venue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No events today</p>
              </div>
            )}
            <Link
              to="/admin/events/new"
              className="mt-4 btn btn-outline w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Event
            </Link>
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Recent Donations</h2>
              <Link to="/admin/donations" className="text-primary text-sm hover:underline">
                View All
              </Link>
            </div>
            {stats?.recentDonations && stats.recentDonations.length > 0 ? (
              <div className="space-y-3">
                {stats.recentDonations.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <Heart className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{donation.donor}</p>
                        <p className="text-xs text-gray-500">
                          {DonationCategoryLabels[donation.category as DonationCategory]?.marathi || donation.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(donation.amount)}</p>
                      <p className="text-xs text-gray-500">{donation.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No recent donations</p>
              </div>
            )}
          </div>
        </div>

        {/* Donation by Category */}
        {stats?.donations.byCategory && stats.donations.byCategory.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
            <h2 className="font-bold text-lg mb-4">Donations by Category (This Month)</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.donations.byCategory.map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 marathi">
                    {DonationCategoryLabels[item.category as DonationCategory]?.marathi || item.category}
                  </p>
                  <p className="text-xl font-bold text-dark">{formatCurrency(item.amount)}</p>
                  <p className="text-xs text-gray-500">{item.count} donations</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
