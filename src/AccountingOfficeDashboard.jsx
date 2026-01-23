import React, { useState, useEffect, useCallback, useRef } from 'react';
import './dashboard.css';
import { 
  Upload, FileText, Users, Building2, LayoutDashboard, Settings, 
  ChevronRight, ChevronDown, Search, Bell, Plus, Filter, 
  Download, Eye, Check, X, AlertTriangle, Clock, Sparkles,
  FileSpreadsheet, Receipt, CreditCard, Banknote, TrendingUp,
  HelpCircle, MessageSquare, ArrowRight, MoreHorizontal, 
  CheckCircle2, XCircle, AlertCircle, Zap, Brain, Shield,
  Calendar, DollarSign, Percent, Tag, Folder, Archive,
  RefreshCw, ChevronLeft, Maximize2, Minimize2, RotateCw,
  ZoomIn, ZoomOut, Split, Merge, Trash2, Edit3, Save,
  Send, Printer, FileDown, ClipboardList, BarChart3,
  PieChart, TrendingDown, Building, Briefcase, Car, Home,
  Utensils, Plane, Laptop, Phone, Wifi, Heart, GraduationCap,
  Gift, Stethoscope, Scale, Landmark, Coins, Wallet, 
  ChevronsUpDown, Command, CornerDownLeft, Hash, Layers
} from 'lucide-react';

// ============================================================================
// CRA CATEGORY SYSTEM
// ============================================================================

const CRA_CATEGORIES = {
  income: {
    'INC-EMP': { name: 'Employment Income', code: 'T4 Box 14', description: 'Salary, wages, bonuses' },
    'INC-SE': { name: 'Self-Employment Income', code: 'T2125 Line 8299', description: 'Business revenue' },
    'INC-RENT': { name: 'Rental Income', code: 'T776 Line 8141', description: 'Gross rental receipts' },
    'INC-INV': { name: 'Investment Income', code: 'T5 Various', description: 'Interest, dividends' },
    'INC-CAP': { name: 'Capital Gains', code: 'Schedule 3', description: 'Realized gains on dispositions' },
    'INC-OTH': { name: 'Other Income', code: 'Line 13000', description: 'Miscellaneous income' },
  },
  expenses: {
    'EXP-ADV': { name: 'Advertising', code: 'T2125 Line 8521', description: 'Marketing, promotion costs', limit: null },
    'EXP-MEAL': { name: 'Meals & Entertainment', code: 'T2125 Line 8523', description: 'Business meals', limit: '50%', warning: 'Only 50% deductible' },
    'EXP-FUEL': { name: 'Fuel & Auto', code: 'T2125 Line 9281', description: 'Vehicle operating costs', prompt: 'Requires km log for business use %' },
    'EXP-INS': { name: 'Insurance', code: 'T2125 Line 8690', description: 'Business insurance premiums' },
    'EXP-INT': { name: 'Interest & Bank', code: 'T2125 Line 8710', description: 'Loan interest, bank fees' },
    'EXP-OFFICE': { name: 'Office Expenses', code: 'T2125 Line 8810', description: 'Supplies, small equipment' },
    'EXP-PRO': { name: 'Professional Fees', code: 'T2125 Line 8860', description: 'Legal, accounting, consulting' },
    'EXP-RENT': { name: 'Rent', code: 'T2125 Line 8910', description: 'Business premises rent' },
    'EXP-HOME': { name: 'Home Office', code: 'T2125 Line 9945', description: 'Workspace in home', prompt: 'T2200 required? Calculate workspace %' },
    'EXP-TEL': { name: 'Telephone & Internet', code: 'T2125 Line 9220', description: 'Communication costs' },
    'EXP-TRAVEL': { name: 'Travel', code: 'T2125 Line 9200', description: 'Transportation, accommodation' },
    'EXP-UTIL': { name: 'Utilities', code: 'T2125 Line 9224', description: 'Heat, electricity, water' },
    'EXP-WAGE': { name: 'Wages & Benefits', code: 'T2125 Line 9060', description: 'Employee compensation' },
    'EXP-SUB': { name: 'Subcontracts', code: 'T2125 Line 8871', description: 'Contract labor' },
    'EXP-SUPP': { name: 'Supplies', code: 'T2125 Line 8811', description: 'Materials consumed' },
    'EXP-CCA': { name: 'Capital Cost Allowance', code: 'T2125 Area A', description: 'Depreciation on assets' },
    'EXP-OTH': { name: 'Other Expenses', code: 'T2125 Line 9270', description: 'Miscellaneous deductions' },
  },
  personal: {
    'PER-MED': { name: 'Medical Expenses', code: 'Line 33099', description: 'Eligible medical costs' },
    'PER-DON': { name: 'Donations', code: 'Line 34900', description: 'Charitable gifts' },
    'PER-EDU': { name: 'Tuition & Education', code: 'T2202', description: 'Post-secondary tuition' },
    'PER-CHILD': { name: 'Childcare', code: 'Line 21400', description: 'Daycare, camps' },
    'PER-RRSP': { name: 'RRSP Contribution', code: 'Line 20800', description: 'Retirement savings' },
    'PER-MOVE': { name: 'Moving Expenses', code: 'Line 21900', description: 'Relocation costs' },
  },
  transfer: {
    'TRF-INT': { name: 'Internal Transfer', code: null, description: 'Between own accounts' },
    'TRF-LOAN': { name: 'Loan/Repayment', code: null, description: 'Lending activity' },
    'TRF-INV': { name: 'Investment Transfer', code: null, description: 'To/from investment accounts' },
  },
  excluded: {
    'EXC-PER': { name: 'Personal (Non-Deductible)', code: null, description: 'Not tax-relevant' },
    'EXC-DUP': { name: 'Duplicate', code: null, description: 'Already recorded elsewhere' },
  }
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_CLIENTS = [
  {
    id: 1,
    name: 'Sarah Chen',
    type: 'Individual',
    status: 'needs_review',
    province: 'BC',
    taxYears: [2024, 2023, 2022],
    gstRegistered: false,
    lastUpload: '2024-01-15',
    pendingItems: 1,
    totalIncome: 142500,
    totalExpenses: 34200,
    engagement: 'T1 Personal'
  }
];

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    date: '2024-01-15',
    description: 'UBER *EATS',
    originalDescription: 'UBER *EATS 8X7JK2',
    merchant: 'Uber Eats',
    amount: -45.67,
    currency: 'CAD',
    account: 'TD Business Visa ****4521',
    suggestedCategory: 'EXP-MEAL',
    confidence: 0.92,
    rationale: 'Food delivery service - classified as meals. Note: Only 50% deductible for business meals.',
    status: 'pending',
    flags: ['50% limitation'],
    gstHst: 5.94,
    sourceDoc: 'td-visa-jan-2024.pdf',
    sourcePage: 2
  }
];

const MOCK_DOCUMENTS = [
  { id: 1, name: 'td-visa-jan-2024.pdf', type: 'Bank Statement', status: 'processed', pages: 8, transactions: 1, uploadedAt: '2024-01-15 10:30 AM' }
];

const MOCK_QUESTIONS = [
  { id: 1, transaction: 'Uber Eats - Jan 15', question: 'Was this meal for a business meeting?', status: 'pending', createdAt: '2024-01-16' }
];

// ============================================================================
// COMPONENT: SIDEBAR NAVIGATION
// ============================================================================

const Sidebar = ({ activeView, setActiveView, collapsed, setCollapsed }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { id: 'clients', icon: Users, label: 'Clients', badge: 1 },
    { id: 'upload', icon: Upload, label: 'Upload Center', badge: null },
    { id: 'review', icon: ClipboardList, label: 'Transaction Review', badge: 1 },
    { id: 'questions', icon: MessageSquare, label: 'Client Questions', badge: 1 },
    { id: 'reports', icon: FileText, label: 'Reports', badge: null },
    { id: 'rules', icon: Sparkles, label: 'AI Rules', badge: null },
    { id: 'settings', icon: Settings, label: 'Settings', badge: null },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <Landmark size={24} />
          </div>
          {!collapsed && <span className="logo-text">TaxFlow</span>}
        </div>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.badge && <span className="badge">{item.badge}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">JD</div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-name">Jessica Davis</span>
              <span className="user-role">Senior Accountant</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

// ============================================================================
// COMPONENT: TOP HEADER
// ============================================================================

const TopHeader = ({ currentClient, setCurrentClient, onNotify }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  
  return (
    <header className="top-header">
      <div className="header-left">
        {currentClient && (
          <div className="breadcrumb">
            <button onClick={() => setCurrentClient(null)} className="breadcrumb-link">
              Clients
            </button>
            <ChevronRight size={16} />
            <span className="breadcrumb-current">{currentClient.name}</span>
            <span className={`status-pill ${currentClient.status}`}>
              {currentClient.status.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>
      
      <div className="header-center">
        <div className={`global-search ${searchOpen ? 'expanded' : ''}`}>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search clients, transactions, documents... (⌘K)"
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          />
          <kbd>⌘K</kbd>
        </div>
      </div>
      
      <div className="header-right">
        <button className="header-btn" onClick={() => onNotify?.('Notifications opened.')}>
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <button className="header-btn" onClick={() => onNotify?.('Help center opened.')}>
          <HelpCircle size={20} />
        </button>
      </div>
    </header>
  );
};

// ============================================================================
// COMPONENT: DASHBOARD VIEW
// ============================================================================

const DashboardView = ({ clients, setActiveView, setCurrentClient }) => {
  const workQueue = [
    { status: 'needs_review', label: 'Needs Review', count: 1, color: '#f59e0b', icon: Clock },
    { status: 'needs_client', label: 'Needs Client Info', count: 0, color: '#8b5cf6', icon: MessageSquare },
    { status: 'ready_report', label: 'Ready for Report', count: 0, color: '#10b981', icon: FileText },
    { status: 'ready_file', label: 'Ready to File', count: 0, color: '#3b82f6', icon: Send },
    { status: 'filed', label: 'Filed / Archived', count: 0, color: '#6b7280', icon: Archive },
  ];

  const recentActivity = [
    { time: '10 min ago', action: 'Uploaded 1 document', client: 'Sarah Chen', type: 'upload' }
  ];

  return (
    <div className="dashboard-view">
      <div className="view-header">
        <h1>Dashboard</h1>
        <p className="view-subtitle">Good morning, Jessica. Here's your work queue.</p>
      </div>

      <div className="work-queue-grid">
        {workQueue.map(item => (
          <button 
            key={item.status} 
            className="queue-card"
            onClick={() => setActiveView('clients')}
          >
            <div className="queue-icon" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
              <item.icon size={24} />
            </div>
            <div className="queue-info">
              <span className="queue-count">{item.count}</span>
              <span className="queue-label">{item.label}</span>
            </div>
            <ChevronRight size={20} className="queue-arrow" />
          </button>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section clients-needing-attention">
          <div className="section-header">
            <h2>Clients Needing Attention</h2>
            <button className="text-btn" onClick={() => setActiveView('clients')}>View All</button>
          </div>
          <div className="client-list">
            {clients.filter(c => c.status !== 'filed').slice(0, 4).map(client => (
              <button 
                key={client.id} 
                className="client-row"
                onClick={() => {
                  setCurrentClient(client);
                  setActiveView('review');
                }}
              >
                <div className="client-avatar">
                  {client.type === 'Corporation' ? <Building2 size={18} /> : client.name.charAt(0)}
                </div>
                <div className="client-details">
                  <span className="client-name">{client.name}</span>
                  <span className="client-meta">{client.engagement} • {client.province}</span>
                </div>
                <div className="client-stats">
                  {client.pendingItems > 0 && (
                    <span className="pending-badge">{client.pendingItems} pending</span>
                  )}
                  <span className={`status-dot ${client.status}`}></span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-section recent-activity">
          <div className="section-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'upload' && <Upload size={14} />}
                  {activity.type === 'approve' && <Check size={14} />}
                  {activity.type === 'report' && <FileText size={14} />}
                  {activity.type === 'answer' && <MessageSquare size={14} />}
                </div>
                <div className="activity-content">
                  <span className="activity-action">{activity.action}</span>
                  <span className="activity-client">{activity.client}</span>
                </div>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section quick-stats">
          <div className="section-header">
            <h2>This Week</h2>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">1</span>
              <span className="stat-label">Documents Processed</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">1</span>
              <span className="stat-label">Transactions Reviewed</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">92%</span>
              <span className="stat-label">AI Accuracy</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">0</span>
              <span className="stat-label">Reports Generated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT: CLIENTS VIEW
// ============================================================================

const ClientsView = ({ clients, setClients, setCurrentClient, setActiveView, onNotify }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [draftClient, setDraftClient] = useState({
    name: '',
    type: 'Individual',
    province: 'BC',
    engagement: 'T1 Personal',
    status: 'needs_review'
  });

  const filteredClients = clients.filter(client => {
    if (filter !== 'all' && client.status !== filter) return false;
    if (search && !client.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreateClient = () => {
    if (!draftClient.name.trim()) {
      onNotify?.('Add a client name to continue.');
      return;
    }

    const newClient = {
      id: Date.now(),
      name: draftClient.name.trim(),
      type: draftClient.type,
      status: 'needs_review',
      province: draftClient.province,
      taxYears: [2024],
      gstRegistered: false,
      lastUpload: '—',
      pendingItems: 0,
      totalIncome: 0,
      totalExpenses: 0,
      engagement: draftClient.engagement
    };

    setClients(prev => [newClient, ...prev]);
    setDraftClient({ name: '', type: 'Individual', province: 'BC', engagement: 'T1 Personal', status: 'needs_review' });
    setShowNewClientModal(false);
    onNotify?.(`Client ${newClient.name} added.`);
  };

  const handleEditClient = () => {
    if (!draftClient.name.trim()) {
      onNotify?.('Add a client name to continue.');
      return;
    }

    setClients(prev => prev.map(c =>
      c.id === editingClient.id
        ? {
            ...c,
            name: draftClient.name.trim(),
            type: draftClient.type,
            province: draftClient.province,
            engagement: draftClient.engagement,
            status: draftClient.status
          }
        : c
    ));
    setShowEditClientModal(false);
    setEditingClient(null);
    setDraftClient({ name: '', type: 'Individual', province: 'BC', engagement: 'T1 Personal', status: 'needs_review' });
    onNotify?.(`Client ${draftClient.name.trim()} updated.`);
  };

  const handleDeleteClient = (client) => {
    setClients(prev => prev.filter(c => c.id !== client.id));
    setShowDeleteConfirm(null);
    onNotify?.(`Client ${client.name} deleted.`);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setDraftClient({
      name: client.name,
      type: client.type,
      province: client.province,
      engagement: client.engagement,
      status: client.status
    });
    setShowEditClientModal(true);
    setActiveContextMenu(null);
  };

  const openDeleteConfirm = (client) => {
    setShowDeleteConfirm(client);
    setActiveContextMenu(null);
  };

  const closeEditModal = () => {
    setShowEditClientModal(false);
    setEditingClient(null);
    setDraftClient({ name: '', type: 'Individual', province: 'BC', engagement: 'T1 Personal', status: 'needs_review' });
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveContextMenu(null);
    if (activeContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeContextMenu]);

  return (
    <div className="clients-view">
      <div className="view-header">
        <div>
          <h1>Clients</h1>
          <p className="view-subtitle">{clients.length} total clients</p>
        </div>
        <button className="primary-btn" onClick={() => setShowNewClientModal(true)}>
          <Plus size={18} />
          New Client
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          {['all', 'needs_review', 'needs_client', 'ready_report', 'filed'].map(f => (
            <button
              key={f}
              className={`filter-pill ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="clients-table">
        <div className="table-header">
          <span className="col-client">Client</span>
          <span className="col-type">Type</span>
          <span className="col-engagement">Engagement</span>
          <span className="col-status">Status</span>
          <span className="col-pending">Pending</span>
          <span className="col-income">Income</span>
          <span className="col-actions"></span>
        </div>
        {filteredClients.map(client => (
          <div
            key={client.id}
            className="table-row"
            onClick={() => {
              setCurrentClient(client);
              setActiveView('review');
            }}
          >
            <div className="col-client">
              <div className="client-avatar">
                {client.type === 'Corporation' ? <Building2 size={18} /> : client.name.charAt(0)}
              </div>
              <div className="client-info">
                <span className="client-name">{client.name}</span>
                <span className="client-province">{client.province}</span>
              </div>
            </div>
            <span className="col-type">{client.type}</span>
            <span className="col-engagement">{client.engagement}</span>
            <span className="col-status">
              <span className={`status-pill ${client.status}`}>
                {client.status.replace('_', ' ')}
              </span>
            </span>
            <span className="col-pending">
              {client.pendingItems > 0 ? (
                <span className="pending-count">{client.pendingItems}</span>
              ) : (
                <CheckCircle2 size={16} className="complete-icon" />
              )}
            </span>
            <span className="col-income">${client.totalIncome.toLocaleString()}</span>
            <span className="col-actions" style={{ position: 'relative' }}>
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveContextMenu(activeContextMenu === client.id ? null : client.id);
                }}
              >
                <MoreHorizontal size={18} />
              </button>
              {activeContextMenu === client.id && (
                <div className="context-menu" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      setCurrentClient(client);
                      setActiveView('review');
                      setActiveContextMenu(null);
                    }}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  <button
                    className="context-menu-item"
                    onClick={() => openEditModal(client)}
                  >
                    <Edit3 size={16} />
                    Edit Client
                  </button>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      setCurrentClient(client);
                      setActiveView('upload');
                      setActiveContextMenu(null);
                    }}
                  >
                    <Upload size={16} />
                    Upload Documents
                  </button>
                  <div className="context-menu-divider"></div>
                  <button
                    className="context-menu-item danger"
                    onClick={() => openDeleteConfirm(client)}
                  >
                    <Trash2 size={16} />
                    Delete Client
                  </button>
                </div>
              )}
            </span>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="empty-state">
            <Users size={48} />
            <h3>No clients found</h3>
            <p>{search ? 'Try adjusting your search or filters' : 'Add your first client to get started'}</p>
            {!search && (
              <button className="primary-btn" onClick={() => setShowNewClientModal(true)}>
                <Plus size={18} />
                Add Client
              </button>
            )}
          </div>
        )}
      </div>

      {/* New Client Modal */}
      {showNewClientModal && (
        <div className="category-picker-overlay" onClick={() => setShowNewClientModal(false)}>
          <div className="category-picker" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header">
              <h3>Add New Client</h3>
              <div className="picker-search">
                <input
                  type="text"
                  placeholder="Client name"
                  value={draftClient.name}
                  onChange={(e) => setDraftClient(prev => ({ ...prev, name: e.target.value }))}
                  autoFocus
                />
              </div>
            </div>
            <div className="picker-content">
              <div className="settings-form" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label>Client Type</label>
                  <select
                    value={draftClient.type}
                    onChange={(e) => setDraftClient(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="Individual">Individual</option>
                    <option value="Corporation">Corporation</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Province</label>
                  <select
                    value={draftClient.province}
                    onChange={(e) => setDraftClient(prev => ({ ...prev, province: e.target.value }))}
                  >
                    <option value="BC">British Columbia</option>
                    <option value="AB">Alberta</option>
                    <option value="ON">Ontario</option>
                    <option value="QC">Quebec</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Engagement</label>
                  <select
                    value={draftClient.engagement}
                    onChange={(e) => setDraftClient(prev => ({ ...prev, engagement: e.target.value }))}
                  >
                    <option value="T1 Personal">T1 Personal</option>
                    <option value="T2 Corporate">T2 Corporate</option>
                    <option value="T3 Trust">T3 Trust</option>
                    <option value="T4 Payroll">T4 Payroll</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="picker-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="secondary-btn" onClick={() => setShowNewClientModal(false)}>
                Cancel
              </button>
              <button className="primary-btn" onClick={handleCreateClient}>
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditClientModal && editingClient && (
        <div className="category-picker-overlay" onClick={closeEditModal}>
          <div className="category-picker" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header">
              <h3>Edit Client</h3>
              <div className="picker-search">
                <input
                  type="text"
                  placeholder="Client name"
                  value={draftClient.name}
                  onChange={(e) => setDraftClient(prev => ({ ...prev, name: e.target.value }))}
                  autoFocus
                />
              </div>
            </div>
            <div className="picker-content">
              <div className="settings-form" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label>Client Type</label>
                  <select
                    value={draftClient.type}
                    onChange={(e) => setDraftClient(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="Individual">Individual</option>
                    <option value="Corporation">Corporation</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Province</label>
                  <select
                    value={draftClient.province}
                    onChange={(e) => setDraftClient(prev => ({ ...prev, province: e.target.value }))}
                  >
                    <option value="BC">British Columbia</option>
                    <option value="AB">Alberta</option>
                    <option value="ON">Ontario</option>
                    <option value="QC">Quebec</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Engagement</label>
                  <select
                    value={draftClient.engagement}
                    onChange={(e) => setDraftClient(prev => ({ ...prev, engagement: e.target.value }))}
                  >
                    <option value="T1 Personal">T1 Personal</option>
                    <option value="T2 Corporate">T2 Corporate</option>
                    <option value="T3 Trust">T3 Trust</option>
                    <option value="T4 Payroll">T4 Payroll</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={draftClient.status}
                    onChange={(e) => setDraftClient(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="needs_review">Needs Review</option>
                    <option value="needs_client">Needs Client Info</option>
                    <option value="ready_report">Ready for Report</option>
                    <option value="filed">Filed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="picker-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="secondary-btn" onClick={closeEditModal}>
                Cancel
              </button>
              <button className="primary-btn" onClick={handleEditClient}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="category-picker-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="category-picker delete-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header">
              <h3>Delete Client</h3>
            </div>
            <div className="picker-content" style={{ padding: '20px' }}>
              <div className="delete-warning">
                <AlertTriangle size={48} />
                <p>Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>?</p>
                <p className="warning-text">This action cannot be undone. All associated data will be permanently removed.</p>
              </div>
            </div>
            <div className="picker-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="secondary-btn" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="danger-btn" onClick={() => handleDeleteClient(showDeleteConfirm)}>
                <Trash2 size={16} />
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENT: UPLOAD CENTER
// ============================================================================

const UploadCenter = ({ clients, currentClient, setCurrentClient, onNotify }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState(MOCK_DOCUMENTS);
  const [clientSelectorOpen, setClientSelectorOpen] = useState(false);
  const fileInputRef = useRef(null);

  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'Bank Statement';
    if (['jpg', 'jpeg', 'png'].includes(ext)) return 'Receipt';
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'Spreadsheet';
    return 'Document';
  };

  const processFiles = useCallback((files) => {
    if (!currentClient) {
      onNotify?.('Select a client before uploading documents.');
      return;
    }

    const fileArray = Array.from(files);
    const newUploads = fileArray.map(file => ({
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
      type: 'detecting...'
    }));

    setUploading(true);
    setUploadProgress(newUploads);

    // Simulate progress for each file
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => prev.map(f => ({
        ...f,
        progress: Math.min(progress, 100),
        status: progress >= 100 ? 'processing' : 'uploading',
        type: progress >= 50 ? getFileType(f.name) : 'detecting...'
      })));
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploadProgress(prev => prev.map(f => ({ ...f, status: 'complete' })));
          // Add to uploaded documents list
          const newDocs = fileArray.map((file, idx) => ({
            id: Date.now() + idx,
            name: file.name,
            type: getFileType(file.name),
            status: 'processed',
            pages: Math.floor(Math.random() * 10) + 1,
            transactions: Math.floor(Math.random() * 50) + 1,
            uploadedAt: new Date().toLocaleString()
          }));
          setUploadedDocuments(prev => [...newDocs, ...prev]);
          setUploading(false);
          onNotify?.(`Successfully uploaded ${fileArray.length} file${fileArray.length > 1 ? 's' : ''}.`);
        }, 1500);
      }
    }, 200);
  }, [currentClient, onNotify, getFileType]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileInput = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const handleClick = () => {
    if (!currentClient) {
      setClientSelectorOpen(true);
      onNotify?.('Select a client to enable uploads.');
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="upload-view">
      <div className="view-header">
        <div>
          <h1>Upload Center</h1>
          <p className="view-subtitle">
            {currentClient ? `Uploading for ${currentClient.name}` : 'Select a client to upload documents'}
          </p>
        </div>
        <div className="client-selector-container">
          <button
            className="client-selector-btn"
            onClick={() => setClientSelectorOpen(!clientSelectorOpen)}
          >
            <Users size={18} />
            {currentClient ? currentClient.name : 'Select Client'}
            <ChevronDown size={16} className={clientSelectorOpen ? 'rotated' : ''} />
          </button>
          {clientSelectorOpen && (
            <div className="client-selector-dropdown">
              {clients.map(client => (
                <button
                  key={client.id}
                  className={`client-option ${currentClient?.id === client.id ? 'selected' : ''}`}
                  onClick={() => {
                    setCurrentClient(client);
                    setClientSelectorOpen(false);
                  }}
                >
                  <div className="client-option-info">
                    <span className="client-option-name">{client.name}</span>
                    <span className="client-option-type">{client.type}</span>
                  </div>
                  {currentClient?.id === client.id && <Check size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={`upload-zone ${dragActive ? 'active' : ''} ${!currentClient ? 'disabled' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.csv,.xlsx,.xls,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        <div className="upload-zone-content">
          <div className="upload-icon">
            <Upload size={48} />
          </div>
          <h3>{currentClient ? 'Drop files here or click to browse' : 'Select a client to start uploading'}</h3>
          <p>Supports PDF, CSV, XLSX, JPG, PNG • Max 50MB per file</p>
          <div className="supported-types">
            <span><FileText size={14} /> Bank Statements</span>
            <span><Receipt size={14} /> Receipts</span>
            <span><FileSpreadsheet size={14} /> Spreadsheets</span>
            <span><CreditCard size={14} /> Tax Slips</span>
          </div>
        </div>
      </div>

      {uploadProgress.length > 0 && (
        <div className="upload-progress-section">
          <h3>Upload Progress</h3>
          {uploadProgress.map((file, idx) => (
            <div key={idx} className="upload-progress-item">
              <div className="file-icon">
                <FileText size={20} />
              </div>
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-type">{file.type}</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${file.progress}%` }}></div>
              </div>
              <span className={`upload-status ${file.status}`}>
                {file.status === 'uploading' && `${file.progress}%`}
                {file.status === 'processing' && <><Sparkles size={14} /> Processing</>}
                {file.status === 'complete' && <><CheckCircle2 size={14} /> Complete</>}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="recent-uploads-section">
        <h3>Recent Uploads</h3>
        <div className="documents-grid">
          {uploadedDocuments.map(doc => (
            <div key={doc.id} className="document-card">
              <div className={`doc-icon ${doc.type.toLowerCase().replace(' ', '-')}`}>
                {doc.type === 'Bank Statement' && <Banknote size={24} />}
                {doc.type === 'Receipt' && <Receipt size={24} />}
                {doc.type === 'Tax Slip' && <FileText size={24} />}
                {doc.type === 'Spreadsheet' && <FileSpreadsheet size={24} />}
              </div>
              <div className="doc-info">
                <span className="doc-name">{doc.name}</span>
                <span className="doc-meta">{doc.type} • {doc.uploadedAt}</span>
              </div>
              <div className="doc-stats">
                {doc.pages && <span>{doc.pages} pages</span>}
                {doc.transactions && <span>{doc.transactions} transactions</span>}
              </div>
              <span className={`doc-status ${doc.status}`}>
                {doc.status === 'processed' && <CheckCircle2 size={14} />}
                {doc.status === 'processing' && <RefreshCw size={14} className="spinning" />}
                {doc.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT: TRANSACTION REVIEW WORKSPACE
// ============================================================================

const TransactionReview = ({ currentClient, onNotify }) => {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [selectedTransaction, setSelectedTransaction] = useState(MOCK_TRANSACTIONS[0]);
  const [filter, setFilter] = useState('pending');
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [bulkSelected, setBulkSelected] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minAmount: '',
    maxAmount: '',
    dateFrom: '',
    dateTo: '',
    category: 'all',
    searchTerm: ''
  });

  const filteredTransactions = transactions.filter(t => {
    // Basic status filter
    if (filter === 'pending' && t.status !== 'pending') return false;
    if (filter === 'approved' && t.status !== 'approved') return false;
    if (filter === 'flagged' && t.flags.length === 0) return false;

    // Advanced filters
    if (advancedFilters.minAmount && Math.abs(t.amount) < parseFloat(advancedFilters.minAmount)) return false;
    if (advancedFilters.maxAmount && Math.abs(t.amount) > parseFloat(advancedFilters.maxAmount)) return false;
    if (advancedFilters.dateFrom && t.date < advancedFilters.dateFrom) return false;
    if (advancedFilters.dateTo && t.date > advancedFilters.dateTo) return false;
    if (advancedFilters.category !== 'all' && t.suggestedCategory !== advancedFilters.category) return false;
    if (advancedFilters.searchTerm && !t.description.toLowerCase().includes(advancedFilters.searchTerm.toLowerCase()) &&
        !t.merchant?.toLowerCase().includes(advancedFilters.searchTerm.toLowerCase())) return false;

    return true;
  });

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      minAmount: '',
      maxAmount: '',
      dateFrom: '',
      dateTo: '',
      category: 'all',
      searchTerm: ''
    });
    onNotify?.('Filters cleared.');
  };

  const hasActiveAdvancedFilters = advancedFilters.minAmount || advancedFilters.maxAmount ||
    advancedFilters.dateFrom || advancedFilters.dateTo ||
    advancedFilters.category !== 'all' || advancedFilters.searchTerm;

  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const approvedCount = transactions.filter(t => t.status === 'approved').length;
  const flaggedCount = transactions.filter(t => t.flags.length > 0).length;

  const handleApprove = (txn) => {
    setTransactions(prev => prev.map(t =>
      t.id === txn.id ? { ...t, status: 'approved' } : t
    ));
    // Update selected transaction if it's the one being approved
    if (selectedTransaction?.id === txn.id) {
      setSelectedTransaction(prev => ({ ...prev, status: 'approved' }));
    }
  };

  const handleReject = (txn) => {
    setTransactions(prev => prev.map(t =>
      t.id === txn.id ? { ...t, status: 'rejected' } : t
    ));
  };

  const handleBulkApprove = () => {
    setTransactions(prev => prev.map(t =>
      bulkSelected.includes(t.id) ? { ...t, status: 'approved' } : t
    ));
    setBulkSelected([]);
  };

  const handleCategoryChange = (categoryCode) => {
    if (!selectedTransaction) return;

    setTransactions(prev => prev.map(t =>
      t.id === selectedTransaction.id ? { ...t, suggestedCategory: categoryCode, confidence: 1.0 } : t
    ));
    setSelectedTransaction(prev => ({ ...prev, suggestedCategory: categoryCode, confidence: 1.0 }));
    setCategoryPickerOpen(false);
  };

  return (
    <div className="review-view">
      <div className="view-header compact">
        <div>
          <h1>Transaction Review</h1>
          <p className="view-subtitle">
            {currentClient ? currentClient.name : 'All Clients'} • {filteredTransactions.length} transactions
          </p>
        </div>
        <div className="header-actions">
          {bulkSelected.length > 0 && (
            <button className="primary-btn" onClick={handleBulkApprove}>
              <Check size={18} />
              Approve {bulkSelected.length} Selected
            </button>
          )}
          <button
            className={`secondary-btn ${hasActiveAdvancedFilters ? 'active-filter' : ''}`}
            onClick={() => setShowAdvancedFilters(true)}
          >
            <Filter size={18} />
            Filters
            {hasActiveAdvancedFilters && <span className="filter-indicator"></span>}
          </button>
        </div>
      </div>

      <div className="review-workspace">
        {/* Left Panel - Document Preview */}
        <div className="preview-panel">
          <div className="panel-header">
            <h3>Document Preview</h3>
            <div className="preview-controls">
              <button className="icon-btn" onClick={() => onNotify?.('Zoomed out.')}><ZoomOut size={16} /></button>
              <button className="icon-btn" onClick={() => onNotify?.('Zoomed in.')}><ZoomIn size={16} /></button>
              <button className="icon-btn" onClick={() => onNotify?.('Document rotated.')}><RotateCw size={16} /></button>
              <button className="icon-btn" onClick={() => onNotify?.('Maximized view.')}><Maximize2 size={16} /></button>
            </div>
          </div>
          <div className="document-preview">
            <div className="preview-placeholder">
              <FileText size={48} />
              <p>{selectedTransaction?.sourceDoc || 'No document selected'}</p>
              {selectedTransaction?.sourcePage && (
                <span className="page-indicator">Page {selectedTransaction.sourcePage}</span>
              )}
            </div>
          </div>
          <div className="preview-pagination">
            <button className="icon-btn" onClick={() => onNotify?.('Previous page.')}><ChevronLeft size={18} /></button>
            <span>Page {selectedTransaction?.sourcePage || 1} of 8</span>
            <button className="icon-btn" onClick={() => onNotify?.('Next page.')}><ChevronRight size={18} /></button>
          </div>
        </div>

        {/* Center Panel - Transaction Table */}
        <div className="transactions-panel">
          <div className="panel-header">
            <div className="filter-tabs">
              {['all', 'pending', 'approved', 'flagged'].map(f => (
                <button
                  key={f}
                  className={`filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' && `All (${transactions.length})`}
                  {f === 'pending' && <>Pending <span className="count">{pendingCount}</span></>}
                  {f === 'approved' && <>Approved <span className="count">{approvedCount}</span></>}
                  {f === 'flagged' && <>Flagged <span className="count">{flaggedCount}</span></>}
                </button>
              ))}
            </div>
            <div className="search-small">
              <Search size={16} />
              <input type="text" placeholder="Search..." />
            </div>
          </div>

          <div className="transactions-list">
            {filteredTransactions.map(txn => (
              <div 
                key={txn.id}
                className={`transaction-row ${selectedTransaction?.id === txn.id ? 'selected' : ''} ${txn.status}`}
                onClick={() => setSelectedTransaction(txn)}
              >
                <input 
                  type="checkbox" 
                  checked={bulkSelected.includes(txn.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    setBulkSelected(prev => 
                      prev.includes(txn.id) 
                        ? prev.filter(id => id !== txn.id)
                        : [...prev, txn.id]
                    );
                  }}
                />
                <div className="txn-date">{txn.date}</div>
                <div className="txn-details">
                  <span className="txn-description">{txn.description}</span>
                  <span className="txn-merchant">{txn.merchant || 'Unknown merchant'}</span>
                </div>
                <div className={`txn-amount ${txn.amount >= 0 ? 'income' : 'expense'}`}>
                  {txn.amount >= 0 ? '+' : ''}{txn.amount.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}
                </div>
                <div className="txn-category">
                  <span className="category-badge">
                    {CRA_CATEGORIES.expenses[txn.suggestedCategory]?.name || 
                     CRA_CATEGORIES.income[txn.suggestedCategory]?.name ||
                     CRA_CATEGORIES.transfer[txn.suggestedCategory]?.name ||
                     txn.suggestedCategory}
                  </span>
                </div>
                <div className="txn-confidence">
                  <div className={`confidence-bar ${txn.confidence >= 0.9 ? 'high' : txn.confidence >= 0.7 ? 'medium' : 'low'}`}>
                    <div style={{ width: `${txn.confidence * 100}%` }}></div>
                  </div>
                  <span>{Math.round(txn.confidence * 100)}%</span>
                </div>
                <div className="txn-flags">
                  {txn.flags.map((flag, idx) => (
                    <span key={idx} className={`flag-badge ${flag === '50% limitation' ? 'meal-limitation' : flag.replace('_', '-')}`}>
                      {flag === '50% limitation' && <Percent size={12} />}
                      {flag === 'needs_receipt' && <Receipt size={12} />}
                      {flag === 'needs_km_log' && <Car size={12} />}
                      {flag === 'low_confidence' && <AlertTriangle size={12} />}
                      {flag === 'mixed_use_possible' && <Home size={12} />}
                    </span>
                  ))}
                </div>
                <div className="txn-actions">
                  {txn.status === 'pending' ? (
                    <>
                      <button className="approve-btn" onClick={(e) => { e.stopPropagation(); handleApprove(txn); }}>
                        <Check size={16} />
                      </button>
                      <button className="reject-btn" onClick={(e) => { e.stopPropagation(); handleReject(txn); }}>
                        <X size={16} />
                      </button>
                    </>
                  ) : txn.status === 'approved' ? (
                    <CheckCircle2 size={18} className="approved-icon" />
                  ) : (
                    <XCircle size={18} className="rejected-icon" style={{ color: 'var(--accent-error)' }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="keyboard-hints">
            <span><kbd>↑↓</kbd> Navigate</span>
            <span><kbd>A</kbd> Approve</span>
            <span><kbd>C</kbd> Category</span>
            <span><kbd>S</kbd> Split</span>
            <span><kbd>Q</kbd> Question</span>
          </div>
        </div>

        {/* Right Panel - AI Insights */}
        <div className="ai-panel">
          <div className="panel-header">
            <h3><Sparkles size={18} /> AI Analysis</h3>
          </div>
          
          {selectedTransaction && (
            <div className="ai-content">
              <div className="ai-section suggested-category">
                <label>Suggested Category</label>
                <button 
                  className="category-selector"
                  onClick={() => setCategoryPickerOpen(!categoryPickerOpen)}
                >
                  <span className="category-name">
                    {CRA_CATEGORIES.expenses[selectedTransaction.suggestedCategory]?.name || 
                     CRA_CATEGORIES.income[selectedTransaction.suggestedCategory]?.name ||
                     selectedTransaction.suggestedCategory}
                  </span>
                  <ChevronsUpDown size={16} />
                </button>
                <div className="cra-code">
                  CRA: {CRA_CATEGORIES.expenses[selectedTransaction.suggestedCategory]?.code || 
                        CRA_CATEGORIES.income[selectedTransaction.suggestedCategory]?.code || 
                        'N/A'}
                </div>
              </div>

              <div className="ai-section confidence">
                <label>Confidence</label>
                <div className="confidence-display">
                  <div className={`confidence-ring ${selectedTransaction.confidence >= 0.9 ? 'high' : selectedTransaction.confidence >= 0.7 ? 'medium' : 'low'}`}>
                    <svg viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${selectedTransaction.confidence * 100}, 100`}
                      />
                    </svg>
                    <span>{Math.round(selectedTransaction.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              <div className="ai-section rationale">
                <label>Rationale</label>
                <p>{selectedTransaction.rationale}</p>
              </div>

              {selectedTransaction.flags.length > 0 && (
                <div className="ai-section flags">
                  <label>Flags & Alerts</label>
                  <div className="flags-list">
                    {selectedTransaction.flags.includes('50% limitation') && (
                      <div className="flag-item warning">
                        <Percent size={16} />
                        <div>
                          <strong>50% Limitation</strong>
                          <p>Meals & entertainment only 50% deductible per CRA rules.</p>
                        </div>
                      </div>
                    )}
                    {selectedTransaction.flags.includes('needs_receipt') && (
                      <div className="flag-item info">
                        <Receipt size={16} />
                        <div>
                          <strong>Receipt Needed</strong>
                          <p>No matching receipt found. Request from client.</p>
                        </div>
                      </div>
                    )}
                    {selectedTransaction.flags.includes('needs_km_log') && (
                      <div className="flag-item info">
                        <Car size={16} />
                        <div>
                          <strong>KM Log Required</strong>
                          <p>Vehicle expense requires business use percentage.</p>
                        </div>
                      </div>
                    )}
                    {selectedTransaction.flags.includes('mixed_use_possible') && (
                      <div className="flag-item warning">
                        <Home size={16} />
                        <div>
                          <strong>Mixed Use</strong>
                          <p>May include personal use. Verify with client.</p>
                        </div>
                      </div>
                    )}
                    {selectedTransaction.flags.includes('low_confidence') && (
                      <div className="flag-item alert">
                        <AlertTriangle size={16} />
                        <div>
                          <strong>Low Confidence</strong>
                          <p>AI uncertain about this categorization. Manual review required.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedTransaction.prompt && (
                <div className="ai-section client-question">
                  <label>Question for Client</label>
                  <div className="question-preview">
                    <p>{selectedTransaction.prompt}</p>
                    <button className="text-btn" onClick={() => onNotify?.('Question added to client questions.')}>
                      <MessageSquare size={14} />
                      Add to Questions
                    </button>
                  </div>
                </div>
              )}

              {selectedTransaction.gstHst && (
                <div className="ai-section gst-hst">
                  <label>GST/HST Detected</label>
                  <div className="gst-display">
                    <span className="gst-amount">${selectedTransaction.gstHst.toFixed(2)}</span>
                    <span className="gst-label">Potential ITC</span>
                  </div>
                </div>
              )}

              <div className="ai-actions">
                <button
                  className="action-btn primary"
                  onClick={() => handleApprove(selectedTransaction)}
                  disabled={selectedTransaction?.status === 'approved'}
                >
                  <Check size={16} />
                  {selectedTransaction?.status === 'approved' ? 'Approved' : 'Approve Category'}
                </button>
                <button className="action-btn secondary" onClick={() => setCategoryPickerOpen(true)}>
                  <Edit3 size={16} />
                  Change Category
                </button>
                <button className="action-btn secondary" onClick={() => onNotify?.('Split transaction workflow coming soon.')}>
                  <Split size={16} />
                  Split Transaction
                </button>
                <button className="action-btn secondary" onClick={() => onNotify?.('Client question drafted and queued.')}>
                  <MessageSquare size={16} />
                  Ask Client
                </button>
              </div>

              <div className="ai-section create-rule">
                <button className="rule-btn" onClick={() => onNotify?.('Rule created and saved to AI rules.')}>
                  <Sparkles size={16} />
                  Create Rule: "{selectedTransaction.merchant}" → {CRA_CATEGORIES.expenses[selectedTransaction.suggestedCategory]?.name || selectedTransaction.suggestedCategory}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Picker Modal */}
      {categoryPickerOpen && (
        <div className="category-picker-overlay" onClick={() => setCategoryPickerOpen(false)}>
          <div className="category-picker" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header">
              <h3>Select Category</h3>
              <div className="picker-search">
                <Search size={16} />
                <input type="text" placeholder="Search categories..." autoFocus />
              </div>
            </div>
            <div className="picker-content">
              <div className="category-group">
                <h4>Income</h4>
                {Object.entries(CRA_CATEGORIES.income).map(([code, cat]) => (
                  <button
                    key={code}
                    className={`category-option ${selectedTransaction?.suggestedCategory === code ? 'selected' : ''}`}
                    onClick={() => handleCategoryChange(code)}
                  >
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-code">{cat.code}</span>
                  </button>
                ))}
              </div>
              <div className="category-group">
                <h4>Expenses</h4>
                {Object.entries(CRA_CATEGORIES.expenses).map(([code, cat]) => (
                  <button
                    key={code}
                    className={`category-option ${selectedTransaction?.suggestedCategory === code ? 'selected' : ''}`}
                    onClick={() => handleCategoryChange(code)}
                  >
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-code">{cat.code}</span>
                    {cat.limit && <span className="cat-limit">{cat.limit}</span>}
                  </button>
                ))}
              </div>
              <div className="category-group">
                <h4>Transfers</h4>
                {Object.entries(CRA_CATEGORIES.transfer).map(([code, cat]) => (
                  <button
                    key={code}
                    className={`category-option ${selectedTransaction?.suggestedCategory === code ? 'selected' : ''}`}
                    onClick={() => handleCategoryChange(code)}
                  >
                    <span className="cat-name">{cat.name}</span>
                  </button>
                ))}
              </div>
              <div className="category-group">
                <h4>Personal / Excluded</h4>
                {Object.entries(CRA_CATEGORIES.personal).map(([code, cat]) => (
                  <button
                    key={code}
                    className={`category-option ${selectedTransaction?.suggestedCategory === code ? 'selected' : ''}`}
                    onClick={() => handleCategoryChange(code)}
                  >
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-code">{cat.code}</span>
                  </button>
                ))}
                {Object.entries(CRA_CATEGORIES.excluded).map(([code, cat]) => (
                  <button
                    key={code}
                    className={`category-option ${selectedTransaction?.suggestedCategory === code ? 'selected' : ''}`}
                    onClick={() => handleCategoryChange(code)}
                  >
                    <span className="cat-name">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="picker-footer">
              <kbd>↑↓</kbd> Navigate <kbd>Enter</kbd> Select <kbd>Esc</kbd> Close
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters Modal */}
      {showAdvancedFilters && (
        <div className="category-picker-overlay" onClick={() => setShowAdvancedFilters(false)}>
          <div className="category-picker advanced-filters-modal" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header">
              <h3>Advanced Filters</h3>
              {hasActiveAdvancedFilters && (
                <button className="text-btn" onClick={clearAdvancedFilters}>
                  Clear All
                </button>
              )}
            </div>
            <div className="picker-content">
              <div className="settings-form" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label>Search</label>
                  <div className="search-input">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search description or merchant..."
                      value={advancedFilters.searchTerm}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Min Amount ($)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={advancedFilters.minAmount}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Amount ($)</label>
                    <input
                      type="number"
                      placeholder="10000.00"
                      value={advancedFilters.maxAmount}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date From</label>
                    <input
                      type="date"
                      value={advancedFilters.dateFrom}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date To</label>
                    <input
                      type="date"
                      value={advancedFilters.dateTo}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={advancedFilters.category}
                    onChange={(e) => setAdvancedFilters(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="all">All Categories</option>
                    <optgroup label="Expenses">
                      {Object.entries(CRA_CATEGORIES.expenses).map(([code, cat]) => (
                        <option key={code} value={code}>{cat.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Income">
                      {Object.entries(CRA_CATEGORIES.income).map(([code, cat]) => (
                        <option key={code} value={code}>{cat.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
            <div className="picker-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="filter-count">
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} matching
              </span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="secondary-btn" onClick={() => setShowAdvancedFilters(false)}>
                  Close
                </button>
                <button className="primary-btn" onClick={() => {
                  setShowAdvancedFilters(false);
                  onNotify?.('Filters applied.');
                }}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENT: CLIENT QUESTIONS
// ============================================================================

const QuestionsView = ({ currentClient, onNotify, questions, setQuestions }) => {
  const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [draftQuestion, setDraftQuestion] = useState({
    transaction: '',
    question: ''
  });

  const pendingCount = questions.filter(q => q.status === 'pending').length;

  const handleCreateQuestion = () => {
    if (!draftQuestion.question.trim()) {
      onNotify?.('Please enter a question.');
      return;
    }

    const newQuestion = {
      id: Date.now(),
      transaction: draftQuestion.transaction.trim() || 'General Question',
      question: draftQuestion.question.trim(),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      answer: null
    };

    setQuestions(prev => [newQuestion, ...prev]);
    setDraftQuestion({ transaction: '', question: '' });
    setShowNewQuestionModal(false);
    onNotify?.('Question added.');
  };

  const handleEditQuestion = () => {
    if (!draftQuestion.question.trim()) {
      onNotify?.('Please enter a question.');
      return;
    }

    setQuestions(prev => prev.map(q =>
      q.id === editingQuestion.id
        ? { ...q, transaction: draftQuestion.transaction.trim() || 'General Question', question: draftQuestion.question.trim() }
        : q
    ));
    setShowEditQuestionModal(false);
    setEditingQuestion(null);
    setDraftQuestion({ transaction: '', question: '' });
    onNotify?.('Question updated.');
  };

  const handleDeleteQuestion = (question) => {
    setQuestions(prev => prev.filter(q => q.id !== question.id));
    onNotify?.('Question removed.');
  };

  const handleMarkAnswered = (question) => {
    setQuestions(prev => prev.map(q =>
      q.id === question.id
        ? { ...q, status: 'answered', answer: 'Client confirmed via email.' }
        : q
    ));
    onNotify?.('Question marked as answered.');
  };

  const handleSendQuestions = () => {
    const pendingQuestions = questions.filter(q => q.status === 'pending');
    if (pendingQuestions.length === 0) {
      onNotify?.('No pending questions to send.');
      return;
    }
    onNotify?.(`${pendingQuestions.length} question${pendingQuestions.length > 1 ? 's' : ''} sent to client.`);
  };

  const openEditModal = (question) => {
    setEditingQuestion(question);
    setDraftQuestion({ transaction: question.transaction, question: question.question });
    setShowEditQuestionModal(true);
  };

  const closeEditModal = () => {
    setShowEditQuestionModal(false);
    setEditingQuestion(null);
    setDraftQuestion({ transaction: '', question: '' });
  };

  return (
    <div className="questions-view">
      <div className="view-header">
        <div>
          <h1>Client Questions</h1>
          <p className="view-subtitle">
            {currentClient ? currentClient.name : 'All Clients'} • {pendingCount} pending
          </p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={() => setShowNewQuestionModal(true)}>
            <Plus size={18} />
            New Question
          </button>
          <button className="primary-btn" onClick={handleSendQuestions}>
            <Send size={18} />
            Send to Client
          </button>
        </div>
      </div>

      <div className="questions-list">
        {questions.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} />
            <h3>No questions yet</h3>
            <p>Create a question to ask your client for clarification</p>
            <button className="primary-btn" onClick={() => setShowNewQuestionModal(true)}>
              <Plus size={18} />
              Add Question
            </button>
          </div>
        ) : (
          questions.map(q => (
            <div key={q.id} className={`question-card ${q.status}`}>
              <div className="question-header">
                <span className="question-transaction">{q.transaction}</span>
                <span className={`question-status ${q.status}`}>
                  {q.status === 'pending' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                  {q.status}
                </span>
              </div>
              <p className="question-text">{q.question}</p>
              {q.answer && (
                <div className="question-answer">
                  <strong>Client Answer:</strong> {q.answer}
                </div>
              )}
              <div className="question-footer">
                <span className="question-date">Created {q.createdAt}</span>
                <div className="question-actions">
                  {q.status === 'pending' && (
                    <button className="icon-btn" onClick={() => handleMarkAnswered(q)} title="Mark as answered">
                      <Check size={16} />
                    </button>
                  )}
                  <button className="icon-btn" onClick={() => openEditModal(q)} title="Edit question">
                    <Edit3 size={16} />
                  </button>
                  <button className="icon-btn" onClick={() => handleDeleteQuestion(q)} title="Delete question">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Question Modal */}
      {showNewQuestionModal && (
        <div className="category-picker-overlay" onClick={() => setShowNewQuestionModal(false)}>
          <div className="category-picker" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header">
              <h3>Add New Question</h3>
            </div>
            <div className="picker-content">
              <div className="settings-form" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label>Related Transaction (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Uber Eats - Jan 15"
                    value={draftQuestion.transaction}
                    onChange={(e) => setDraftQuestion(prev => ({ ...prev, transaction: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Question for Client</label>
                  <textarea
                    placeholder="Enter your question..."
                    value={draftQuestion.question}
                    onChange={(e) => setDraftQuestion(prev => ({ ...prev, question: e.target.value }))}
                    autoFocus
                    rows={4}
                    style={{ resize: 'vertical', minHeight: '100px' }}
                  />
                </div>
              </div>
            </div>
            <div className="picker-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="secondary-btn" onClick={() => setShowNewQuestionModal(false)}>
                Cancel
              </button>
              <button className="primary-btn" onClick={handleCreateQuestion}>
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {showEditQuestionModal && editingQuestion && (
        <div className="category-picker-overlay" onClick={closeEditModal}>
          <div className="category-picker" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header">
              <h3>Edit Question</h3>
            </div>
            <div className="picker-content">
              <div className="settings-form" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label>Related Transaction</label>
                  <input
                    type="text"
                    placeholder="e.g., Uber Eats - Jan 15"
                    value={draftQuestion.transaction}
                    onChange={(e) => setDraftQuestion(prev => ({ ...prev, transaction: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Question for Client</label>
                  <textarea
                    placeholder="Enter your question..."
                    value={draftQuestion.question}
                    onChange={(e) => setDraftQuestion(prev => ({ ...prev, question: e.target.value }))}
                    autoFocus
                    rows={4}
                    style={{ resize: 'vertical', minHeight: '100px' }}
                  />
                </div>
              </div>
            </div>
            <div className="picker-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="secondary-btn" onClick={closeEditModal}>
                Cancel
              </button>
              <button className="primary-btn" onClick={handleEditQuestion}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENT: REPORTS VIEW
// ============================================================================

const ReportsView = ({ currentClient, onNotify }) => {
  return (
    <div className="reports-view">
      <div className="view-header">
        <div>
          <h1>Reports</h1>
          <p className="view-subtitle">Generate client review packages and exports</p>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card generate">
          <div className="report-icon">
            <FileText size={32} />
          </div>
          <h3>Client Review Package</h3>
          <p>Summary of income, expenses, flagged items, and questions for client approval.</p>
          <button className="primary-btn" onClick={() => onNotify?.('Generating report package...')}>
            <Sparkles size={18} />
            Generate Report
          </button>
        </div>

        <div className="report-card export">
          <div className="report-icon">
            <FileSpreadsheet size={32} />
          </div>
          <h3>Categorized Ledger</h3>
          <p>Export all transactions with CRA categories for tax software or bookkeeping.</p>
          <div className="export-options">
            <button className="secondary-btn" onClick={() => onNotify?.('Exporting ledger as CSV...')}>
              <Download size={16} />
              CSV
            </button>
            <button className="secondary-btn" onClick={() => onNotify?.('Exporting ledger as XLSX...')}>
              <Download size={16} />
              XLSX
            </button>
          </div>
        </div>

        <div className="report-card export">
          <div className="report-icon">
            <Folder size={32} />
          </div>
          <h3>Supporting Documents</h3>
          <p>Index of all uploaded documents with transaction links for audit defense.</p>
          <button className="secondary-btn" onClick={() => onNotify?.('Downloading document index...')}>
            <Download size={16} />
            Download Index
          </button>
        </div>

        <div className="report-card export">
          <div className="report-icon">
            <BarChart3 size={32} />
          </div>
          <h3>Summary Dashboard</h3>
          <p>Visual overview of income vs expenses by category and month.</p>
          <button className="secondary-btn" onClick={() => onNotify?.('Opening summary dashboard...')}>
            <Eye size={16} />
            View Dashboard
          </button>
        </div>
      </div>

      {currentClient && (
        <div className="client-summary-section">
          <h2>Summary for {currentClient.name}</h2>
          <div className="summary-cards">
            <div className="summary-card income">
              <TrendingUp size={24} />
              <div className="summary-content">
                <span className="summary-label">Total Income</span>
                <span className="summary-value">${currentClient.totalIncome.toLocaleString()}</span>
              </div>
            </div>
            <div className="summary-card expenses">
              <TrendingDown size={24} />
              <div className="summary-content">
                <span className="summary-label">Total Expenses</span>
                <span className="summary-value">${currentClient.totalExpenses.toLocaleString()}</span>
              </div>
            </div>
            <div className="summary-card net">
              <DollarSign size={24} />
              <div className="summary-content">
                <span className="summary-label">Net Income</span>
                <span className="summary-value">${(currentClient.totalIncome - currentClient.totalExpenses).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENT: AI RULES
// ============================================================================

const RulesView = ({ onNotify, rules, setRules }) => {
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [showEditRuleModal, setShowEditRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [draftRule, setDraftRule] = useState({
    merchant: '',
    category: 'EXP-MEAL',
    scope: 'Firm-wide'
  });

  const categoryOptions = [
    ...Object.entries(CRA_CATEGORIES.income).map(([code, cat]) => ({ code, name: cat.name, group: 'Income' })),
    ...Object.entries(CRA_CATEGORIES.expenses).map(([code, cat]) => ({ code, name: cat.name, group: 'Expenses' })),
    ...Object.entries(CRA_CATEGORIES.personal).map(([code, cat]) => ({ code, name: cat.name, group: 'Personal' })),
    ...Object.entries(CRA_CATEGORIES.transfer).map(([code, cat]) => ({ code, name: cat.name, group: 'Transfers' })),
    ...Object.entries(CRA_CATEGORIES.excluded).map(([code, cat]) => ({ code, name: cat.name, group: 'Excluded' })),
  ];

  const getCategoryName = (code) => {
    const category = categoryOptions.find(c => c.code === code);
    return category ? category.name : code;
  };

  const handleCreateRule = () => {
    if (!draftRule.merchant.trim()) {
      onNotify?.('Please enter a merchant pattern.');
      return;
    }

    const newRule = {
      id: Date.now(),
      merchant: draftRule.merchant.trim().toUpperCase(),
      category: getCategoryName(draftRule.category),
      categoryCode: draftRule.category,
      scope: draftRule.scope,
      uses: 0
    };

    setRules(prev => [...prev, newRule]);
    setDraftRule({ merchant: '', category: 'EXP-MEAL', scope: 'Firm-wide' });
    setShowNewRuleModal(false);
    onNotify?.(`Rule created for "${newRule.merchant}".`);
  };

  const handleEditRule = () => {
    if (!draftRule.merchant.trim()) {
      onNotify?.('Please enter a merchant pattern.');
      return;
    }

    setRules(prev => prev.map(r =>
      r.id === editingRule.id
        ? {
            ...r,
            merchant: draftRule.merchant.trim().toUpperCase(),
            category: getCategoryName(draftRule.category),
            categoryCode: draftRule.category,
            scope: draftRule.scope
          }
        : r
    ));
    setShowEditRuleModal(false);
    setEditingRule(null);
    setDraftRule({ merchant: '', category: 'EXP-MEAL', scope: 'Firm-wide' });
    onNotify?.('Rule updated.');
  };

  const handleDeleteRule = (rule) => {
    setRules(prev => prev.filter(r => r.id !== rule.id));
    onNotify?.(`Rule for "${rule.merchant}" removed.`);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setDraftRule({
      merchant: rule.merchant,
      category: rule.categoryCode || 'EXP-MEAL',
      scope: rule.scope
    });
    setShowEditRuleModal(true);
  };

  const closeEditModal = () => {
    setShowEditRuleModal(false);
    setEditingRule(null);
    setDraftRule({ merchant: '', category: 'EXP-MEAL', scope: 'Firm-wide' });
  };

  return (
    <div className="rules-view">
      <div className="view-header">
        <div>
          <h1>AI Rules</h1>
          <p className="view-subtitle">Manage categorization rules and teach the AI</p>
        </div>
        <button className="primary-btn" onClick={() => setShowNewRuleModal(true)}>
          <Plus size={18} />
          Create Rule
        </button>
      </div>

      <div className="rules-content">
        <div className="rules-section">
          <h3>Merchant → Category Rules</h3>
          <p className="section-description">When a transaction matches a merchant, automatically suggest this category.</p>

          <div className="rules-table">
            <div className="rules-header">
              <span>Merchant Pattern</span>
              <span>Category</span>
              <span>Scope</span>
              <span>Uses</span>
              <span></span>
            </div>
            {rules.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <Sparkles size={48} />
                <h3>No rules yet</h3>
                <p>Create rules to automatically categorize transactions</p>
                <button className="primary-btn" onClick={() => setShowNewRuleModal(true)}>
                  <Plus size={18} />
                  Create First Rule
                </button>
              </div>
            ) : (
              rules.map(rule => (
                <div key={rule.id} className="rule-row">
                  <span className="rule-merchant">
                    <code>{rule.merchant}</code>
                  </span>
                  <span className="rule-category">{rule.category}</span>
                  <span className="rule-scope">
                    <span className={`scope-badge ${rule.scope.includes('Client') ? 'client' : 'firm'}`}>
                      {rule.scope}
                    </span>
                  </span>
                  <span className="rule-uses">{rule.uses} matches</span>
                  <span className="rule-actions">
                    <button className="icon-btn" onClick={() => openEditModal(rule)} title="Edit rule">
                      <Edit3 size={16} />
                    </button>
                    <button className="icon-btn" onClick={() => handleDeleteRule(rule)} title="Delete rule">
                      <Trash2 size={16} />
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rules-section">
          <h3>AI Suggestions</h3>
          <p className="section-description">Based on your review patterns, the AI suggests these new rules.</p>

          <div className="suggestions-list">
            <div className="suggestion-card">
              <div className="suggestion-content">
                <Sparkles size={18} />
                <div>
                  <strong>No suggestions yet</strong>
                  <p>Review more transactions to receive AI-powered rule suggestions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Rule Modal */}
      {showNewRuleModal && (
        <div className="category-picker-overlay" onClick={() => setShowNewRuleModal(false)}>
          <div className="category-picker" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header">
              <h3>Create New Rule</h3>
            </div>
            <div className="picker-content">
              <div className="settings-form" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label>Merchant Pattern</label>
                  <input
                    type="text"
                    placeholder="e.g., UBER *EATS, AMAZON, STARBUCKS"
                    value={draftRule.merchant}
                    onChange={(e) => setDraftRule(prev => ({ ...prev, merchant: e.target.value }))}
                    autoFocus
                  />
                  <span className="form-hint">Use * as wildcard. Pattern is case-insensitive.</span>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={draftRule.category}
                    onChange={(e) => setDraftRule(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <optgroup label="Expenses">
                      {Object.entries(CRA_CATEGORIES.expenses).map(([code, cat]) => (
                        <option key={code} value={code}>{cat.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Income">
                      {Object.entries(CRA_CATEGORIES.income).map(([code, cat]) => (
                        <option key={code} value={code}>{cat.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Personal">
                      {Object.entries(CRA_CATEGORIES.personal).map(([code, cat]) => (
                        <option key={code} value={code}>{cat.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Transfers">
                      {Object.entries(CRA_CATEGORIES.transfer).map(([code, cat]) => (
                        <option key={code} value={code}>{cat.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Excluded">
                      {Object.entries(CRA_CATEGORIES.excluded).map(([code, cat]) => (
                        <option key={code} value={code}>{cat.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="form-group">
                  <label>Scope</label>
                  <select
                    value={draftRule.scope}
                    onChange={(e) => setDraftRule(prev => ({ ...prev, scope: e.target.value }))}
                  >
                    <option value="Firm-wide">Firm-wide (all clients)</option>
                    <option value="Client-specific">Client-specific</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="picker-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="secondary-btn" onClick={() => setShowNewRuleModal(false)}>
                Cancel
              </button>
              <button className="primary-btn" onClick={handleCreateRule}>
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rule Modal */}
      {showEditRuleModal && editingRule && (
        <div className="category-picker-overlay" onClick={closeEditModal}>
          <div className="category-picker" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header">
              <h3>Edit Rule</h3>
            </div>
            <div className="picker-content">
              <div className="settings-form" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label>Merchant Pattern</label>
                  <input
                    type="text"
                    placeholder="e.g., UBER *EATS, AMAZON, STARBUCKS"
                    value={draftRule.merchant}
                    onChange={(e) => setDraftRule(prev => ({ ...prev, merchant: e.target.value }))}
                    autoFocus
                  />
                  <span className="form-hint">Use * as wildcard. Pattern is case-insensitive.</span>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={draftRule.category}
                    onChange={(e) => setDraftRule(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <optgroup label="Expenses">
                      {Object.entries(CRA_CATEGORIES.expenses).map(([code, cat]) => (
                        <option key={code} value={code}>{cat.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Income">
                      {Object.entries(CRA_CATEGORIES.income).map(([code, cat]) => (
                        <option key={code} value={code}>{cat.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Personal">
                      {Object.entries(CRA_CATEGORIES.personal).map(([code, cat]) => (
                        <option key={code} value={code}>{cat.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Transfers">
                      {Object.entries(CRA_CATEGORIES.transfer).map(([code, cat]) => (
                        <option key={code} value={code}>{cat.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Excluded">
                      {Object.entries(CRA_CATEGORIES.excluded).map(([code, cat]) => (
                        <option key={code} value={code}>{cat.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="form-group">
                  <label>Scope</label>
                  <select
                    value={draftRule.scope}
                    onChange={(e) => setDraftRule(prev => ({ ...prev, scope: e.target.value }))}
                  >
                    <option value="Firm-wide">Firm-wide (all clients)</option>
                    <option value="Client-specific">Client-specific</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="picker-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="secondary-btn" onClick={closeEditModal}>
                Cancel
              </button>
              <button className="primary-btn" onClick={handleEditRule}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENT: SETTINGS
// ============================================================================

const SettingsView = ({ teamMembers, setTeamMembers, onNotify }) => {
  const [showNewMemberModal, setShowNewMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [draftMember, setDraftMember] = useState({
    name: '',
    email: '',
    role: 'Staff Accountant'
  });

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCreateMember = () => {
    if (!draftMember.name.trim()) {
      onNotify?.('Please enter a name for the team member.');
      return;
    }
    if (!draftMember.email.trim()) {
      onNotify?.('Please enter an email for the team member.');
      return;
    }

    const newMember = {
      id: Date.now(),
      name: draftMember.name.trim(),
      email: draftMember.email.trim(),
      role: draftMember.role,
      initials: getInitials(draftMember.name.trim())
    };

    setTeamMembers(prev => [...prev, newMember]);
    setDraftMember({ name: '', email: '', role: 'Staff Accountant' });
    setShowNewMemberModal(false);
    onNotify?.(`Team member ${newMember.name} added successfully.`);
  };

  const handleUpdateMember = () => {
    if (!draftMember.name.trim()) {
      onNotify?.('Please enter a name for the team member.');
      return;
    }
    if (!draftMember.email.trim()) {
      onNotify?.('Please enter an email for the team member.');
      return;
    }

    setTeamMembers(prev => prev.map(m =>
      m.id === editingMember.id
        ? { ...m, name: draftMember.name.trim(), email: draftMember.email.trim(), role: draftMember.role, initials: getInitials(draftMember.name.trim()) }
        : m
    ));
    setDraftMember({ name: '', email: '', role: 'Staff Accountant' });
    setEditingMember(null);
    setShowNewMemberModal(false);
    onNotify?.(`Team member updated successfully.`);
  };

  const handleDeleteMember = (member) => {
    setTeamMembers(prev => prev.filter(m => m.id !== member.id));
    onNotify?.(`Team member ${member.name} removed.`);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setDraftMember({ name: member.name, email: member.email || '', role: member.role });
    setShowNewMemberModal(true);
  };

  const closeModal = () => {
    setShowNewMemberModal(false);
    setEditingMember(null);
    setDraftMember({ name: '', email: '', role: 'Staff Accountant' });
  };

  return (
    <div className="settings-view">
      <div className="view-header">
        <h1>Settings</h1>
        <p className="view-subtitle">Configure your firm and preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>Firm Profile</h3>
          <div className="settings-form">
            <div className="form-group">
              <label>Firm Name</label>
              <input type="text" defaultValue="Davis & Associates CPA" />
            </div>
            <div className="form-group">
              <label>Default Province</label>
              <select defaultValue="BC">
                <option value="BC">British Columbia</option>
                <option value="AB">Alberta</option>
                <option value="ON">Ontario</option>
                <option value="QC">Quebec</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Team Members</h3>
          <div className="team-list">
            {teamMembers.map(member => (
              <div key={member.id} className="team-member">
                <div className="avatar">{member.initials}</div>
                <div className="member-info">
                  <span className="member-name">{member.name}</span>
                  <span className="member-role">{member.role}</span>
                </div>
                <button className="icon-btn" onClick={() => openEditModal(member)}>
                  <Edit3 size={16} />
                </button>
                {teamMembers.length > 1 && (
                  <button className="icon-btn" onClick={() => handleDeleteMember(member)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="text-btn" onClick={() => setShowNewMemberModal(true)}>
            <Plus size={16} />
            Add Team Member
          </button>
        </div>

        {showNewMemberModal && (
          <div className="category-picker-overlay" onClick={closeModal}>
            <div className="category-picker" onClick={(e) => e.stopPropagation()}>
              <div className="picker-header">
                <h3>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h3>
              </div>
              <div className="picker-content">
                <div className="settings-form" style={{ gap: '16px' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={draftMember.name}
                      onChange={(e) => setDraftMember(prev => ({ ...prev, name: e.target.value }))}
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={draftMember.email}
                      onChange={(e) => setDraftMember(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={draftMember.role}
                      onChange={(e) => setDraftMember(prev => ({ ...prev, role: e.target.value }))}
                    >
                      <option value="Admin Partner">Admin Partner</option>
                      <option value="Partner">Partner</option>
                      <option value="Senior Accountant">Senior Accountant</option>
                      <option value="Staff Accountant">Staff Accountant</option>
                      <option value="Bookkeeper">Bookkeeper</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="picker-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button className="primary-btn" onClick={editingMember ? handleUpdateMember : handleCreateMember}>
                  {editingMember ? 'Save Changes' : 'Add Team Member'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="settings-section">
          <h3>AI Configuration</h3>
          <div className="settings-toggles">
            <div className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Auto-categorize high confidence (90%+)</span>
                <span className="toggle-description">Automatically approve transactions with very high AI confidence</span>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Learn from corrections</span>
                <span className="toggle-description">Use manual corrections to improve future suggestions</span>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Flag personal expenses</span>
                <span className="toggle-description">Automatically flag transactions that appear personal</span>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const INITIAL_TEAM_MEMBERS = [
  { id: 1, name: 'Jessica Davis', email: 'jessica@davis-cpa.com', role: 'Admin Partner', initials: 'JD' }
];

const INITIAL_QUESTIONS = [
  { id: 1, transaction: 'Uber Eats - Jan 15', question: 'Was this meal for a business meeting?', status: 'pending', createdAt: '2024-01-16', answer: null }
];

const INITIAL_RULES = [
  { id: 1, merchant: 'UBER *EATS', category: 'Meals & Entertainment', categoryCode: 'EXP-MEAL', scope: 'Firm-wide', uses: 1 }
];

const AccountingOfficeDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [teamMembers, setTeamMembers] = useState(INITIAL_TEAM_MEMBERS);
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [toast, setToast] = useState(null);

  const handleNotify = useCallback((message) => {
    if (!message) return;
    setToast({ id: Date.now(), message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timeout);
  }, [toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            document.querySelector('.global-search input')?.focus();
            break;
          case '1':
            e.preventDefault();
            setActiveView('dashboard');
            break;
          case '2':
            e.preventDefault();
            setActiveView('clients');
            break;
          case '3':
            e.preventDefault();
            setActiveView('review');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            clients={clients}
            setActiveView={setActiveView}
            setCurrentClient={setCurrentClient}
          />
        );
      case 'clients':
        return (
          <ClientsView
            clients={clients}
            setClients={setClients}
            setCurrentClient={setCurrentClient}
            setActiveView={setActiveView}
            onNotify={handleNotify}
          />
        );
      case 'upload':
        return (
          <UploadCenter
            clients={clients}
            currentClient={currentClient}
            setCurrentClient={setCurrentClient}
            onNotify={handleNotify}
          />
        );
      case 'review':
        return <TransactionReview currentClient={currentClient} onNotify={handleNotify} />;
      case 'questions':
        return <QuestionsView currentClient={currentClient} onNotify={handleNotify} questions={questions} setQuestions={setQuestions} />;
      case 'reports':
        return <ReportsView currentClient={currentClient} onNotify={handleNotify} />;
      case 'rules':
        return <RulesView onNotify={handleNotify} rules={rules} setRules={setRules} />;
      case 'settings':
        return <SettingsView teamMembers={teamMembers} setTeamMembers={setTeamMembers} onNotify={handleNotify} />;
      default:
        return (
          <DashboardView
            clients={clients}
            setActiveView={setActiveView}
            setCurrentClient={setCurrentClient}
          />
        );
    }
  };

  return (
    <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="main-content">
        <TopHeader
          currentClient={currentClient}
          setCurrentClient={setCurrentClient}
          onNotify={handleNotify}
        />
        <main className="content-area">
          {renderView()}
        </main>
      </div>
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <Sparkles size={16} />
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AccountingOfficeDashboard;
