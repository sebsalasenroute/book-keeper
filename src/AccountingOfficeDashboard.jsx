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
    pendingItems: 12,
    totalIncome: 142500,
    totalExpenses: 34200,
    engagement: 'T1 Personal'
  },
  { 
    id: 2, 
    name: 'TechFlow Solutions Inc.', 
    type: 'Corporation', 
    status: 'needs_client',
    province: 'ON',
    taxYears: [2024, 2023],
    gstRegistered: true,
    yearEnd: 'Dec 31',
    lastUpload: '2024-01-12',
    pendingItems: 45,
    totalIncome: 890000,
    totalExpenses: 620000,
    engagement: 'T2 Corporate + HST'
  },
  { 
    id: 3, 
    name: 'Michael Rodriguez', 
    type: 'Individual', 
    status: 'ready_report',
    province: 'AB',
    taxYears: [2024],
    gstRegistered: true,
    lastUpload: '2024-01-10',
    pendingItems: 0,
    totalIncome: 95000,
    totalExpenses: 22400,
    engagement: 'T1 + T2125 Self-Employed'
  },
  { 
    id: 4, 
    name: 'Maple Leaf Properties', 
    type: 'Corporation', 
    status: 'filed',
    province: 'BC',
    taxYears: [2024, 2023, 2022],
    gstRegistered: true,
    yearEnd: 'Mar 31',
    lastUpload: '2023-12-20',
    pendingItems: 0,
    totalIncome: 340000,
    totalExpenses: 210000,
    engagement: 'T2 Corporate'
  },
  { 
    id: 5, 
    name: 'Jennifer Walsh', 
    type: 'Individual', 
    status: 'needs_review',
    province: 'ON',
    taxYears: [2024],
    gstRegistered: false,
    lastUpload: '2024-01-18',
    pendingItems: 28,
    totalIncome: 78000,
    totalExpenses: 15600,
    engagement: 'T1 Personal + Rental'
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
  },
  {
    id: 2,
    date: '2024-01-14',
    description: 'AMAZON.CA *2K8MN1',
    originalDescription: 'AMAZON.CA *2K8MN1 AMZN.CA/BI',
    merchant: 'Amazon',
    amount: -234.99,
    currency: 'CAD',
    account: 'TD Business Visa ****4521',
    suggestedCategory: 'EXP-OFFICE',
    confidence: 0.78,
    rationale: 'Amazon purchase - likely office supplies or equipment. Review receipt for exact items.',
    status: 'pending',
    flags: ['needs_receipt', 'mixed_use_possible'],
    gstHst: 30.55,
    sourceDoc: 'td-visa-jan-2024.pdf',
    sourcePage: 2
  },
  {
    id: 3,
    date: '2024-01-13',
    description: 'STRIPE TRANSFER',
    originalDescription: 'STRIPE PAYOUT - TechFlow Sol',
    merchant: 'Stripe',
    amount: 4250.00,
    currency: 'CAD',
    account: 'TD Business Chequing ****8832',
    suggestedCategory: 'INC-SE',
    confidence: 0.98,
    rationale: 'Payment processor deposit - business revenue from online sales or services.',
    status: 'approved',
    flags: [],
    gstHst: null,
    sourceDoc: 'td-chequing-jan-2024.pdf',
    sourcePage: 1
  },
  {
    id: 4,
    date: '2024-01-12',
    description: 'SHELL OIL 12345',
    originalDescription: 'SHELL 12345 VANCOUVER BC',
    merchant: 'Shell',
    amount: -89.45,
    currency: 'CAD',
    account: 'TD Business Visa ****4521',
    suggestedCategory: 'EXP-FUEL',
    confidence: 0.95,
    rationale: 'Gas station - vehicle fuel expense. Requires km log for business use percentage.',
    status: 'pending',
    flags: ['needs_km_log'],
    gstHst: 11.63,
    sourceDoc: 'td-visa-jan-2024.pdf',
    sourcePage: 3,
    prompt: 'What is the business use % for this vehicle?'
  },
  {
    id: 5,
    date: '2024-01-11',
    description: 'TRANSFER TO SAVINGS',
    originalDescription: 'TFR TO SAV ****9921',
    merchant: null,
    amount: -5000.00,
    currency: 'CAD',
    account: 'TD Business Chequing ****8832',
    suggestedCategory: 'TRF-INT',
    confidence: 0.99,
    rationale: 'Internal account transfer - not a taxable event.',
    status: 'approved',
    flags: [],
    gstHst: null,
    sourceDoc: 'td-chequing-jan-2024.pdf',
    sourcePage: 1
  },
  {
    id: 6,
    date: '2024-01-10',
    description: 'GOOGLE *ADS',
    originalDescription: 'GOOGLE *ADS CAN CC@GOOGLE',
    merchant: 'Google Ads',
    amount: -750.00,
    currency: 'CAD',
    account: 'TD Business Visa ****4521',
    suggestedCategory: 'EXP-ADV',
    confidence: 0.99,
    rationale: 'Digital advertising expense - fully deductible.',
    status: 'approved',
    flags: [],
    gstHst: 97.50,
    sourceDoc: 'td-visa-jan-2024.pdf',
    sourcePage: 3
  },
  {
    id: 7,
    date: '2024-01-09',
    description: 'SHOPPERS DRUG MART',
    originalDescription: 'SHOPPERS #1234 VANCOUVER',
    merchant: 'Shoppers Drug Mart',
    amount: -67.89,
    currency: 'CAD',
    account: 'TD Business Visa ****4521',
    suggestedCategory: 'EXP-OTH',
    confidence: 0.45,
    rationale: 'Pharmacy/retail - could be personal or business supplies. Needs receipt review.',
    status: 'pending',
    flags: ['low_confidence', 'needs_receipt', 'mixed_use_possible'],
    gstHst: 8.83,
    sourceDoc: 'td-visa-jan-2024.pdf',
    sourcePage: 4
  },
  {
    id: 8,
    date: '2024-01-08',
    description: 'MONTHLY RENT - OFFICE',
    originalDescription: 'E-TRANSFER RENT JAN 2024',
    merchant: 'Landlord - 123 Main St',
    amount: -2200.00,
    currency: 'CAD',
    account: 'TD Business Chequing ****8832',
    suggestedCategory: 'EXP-RENT',
    confidence: 0.97,
    rationale: 'Recurring monthly payment - office rent based on memo and amount pattern.',
    status: 'approved',
    flags: [],
    gstHst: null,
    sourceDoc: 'td-chequing-jan-2024.pdf',
    sourcePage: 2
  },
  {
    id: 9,
    date: '2024-01-07',
    description: 'CLIENT PAYMENT - ACME CORP',
    originalDescription: 'EFT CR ACME CORP INV-2024-001',
    merchant: 'Acme Corp',
    amount: 12500.00,
    currency: 'CAD',
    account: 'TD Business Chequing ****8832',
    suggestedCategory: 'INC-SE',
    confidence: 0.99,
    rationale: 'Client payment - invoice reference detected. Business revenue.',
    status: 'approved',
    flags: [],
    gstHst: null,
    sourceDoc: 'td-chequing-jan-2024.pdf',
    sourcePage: 2
  },
  {
    id: 10,
    date: '2024-01-05',
    description: 'ROGERS WIRELESS',
    originalDescription: 'ROGERS WIRELESS PAY',
    merchant: 'Rogers',
    amount: -125.00,
    currency: 'CAD',
    account: 'TD Business Visa ****4521',
    suggestedCategory: 'EXP-TEL',
    confidence: 0.94,
    rationale: 'Telecommunications expense. If personal phone used for business, prorate.',
    status: 'pending',
    flags: ['mixed_use_possible'],
    gstHst: 16.25,
    sourceDoc: 'td-visa-jan-2024.pdf',
    sourcePage: 4,
    prompt: 'What % of this phone is used for business?'
  }
];

const MOCK_DOCUMENTS = [
  { id: 1, name: 'td-visa-jan-2024.pdf', type: 'Bank Statement', status: 'processed', pages: 8, transactions: 42, uploadedAt: '2024-01-15 10:30 AM' },
  { id: 2, name: 'td-chequing-jan-2024.pdf', type: 'Bank Statement', status: 'processed', pages: 4, transactions: 18, uploadedAt: '2024-01-15 10:30 AM' },
  { id: 3, name: 'receipt-amazon-jan14.jpg', type: 'Receipt', status: 'processed', pages: 1, transactions: 1, uploadedAt: '2024-01-15 10:32 AM' },
  { id: 4, name: 'T4-2023-employer.pdf', type: 'Tax Slip', status: 'processed', pages: 1, transactions: null, uploadedAt: '2024-01-14 2:15 PM' },
  { id: 5, name: 'bookkeeping-export.xlsx', type: 'Spreadsheet', status: 'processing', pages: null, transactions: null, uploadedAt: '2024-01-18 9:00 AM' },
];

const MOCK_QUESTIONS = [
  { id: 1, transaction: 'Shell Gas - Jan 12', question: 'What percentage of vehicle use is for business?', status: 'pending', createdAt: '2024-01-16' },
  { id: 2, transaction: 'Amazon - Jan 14', question: 'What items were purchased? Were they for business use?', status: 'pending', createdAt: '2024-01-16' },
  { id: 3, transaction: 'Shoppers Drug Mart - Jan 9', question: 'Was this purchase for business supplies or personal?', status: 'pending', createdAt: '2024-01-16' },
  { id: 4, transaction: 'Rogers Wireless', question: 'What percentage of your phone plan is used for business?', status: 'answered', answer: '60% business use', createdAt: '2024-01-15' },
];

// ============================================================================
// COMPONENT: SIDEBAR NAVIGATION
// ============================================================================

const Sidebar = ({ activeView, setActiveView, collapsed, setCollapsed }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { id: 'clients', icon: Users, label: 'Clients', badge: 5 },
    { id: 'upload', icon: Upload, label: 'Upload Center', badge: null },
    { id: 'review', icon: ClipboardList, label: 'Transaction Review', badge: 12 },
    { id: 'questions', icon: MessageSquare, label: 'Client Questions', badge: 3 },
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

const TopHeader = ({ currentClient, setCurrentClient }) => {
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
        <button className="header-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <button className="header-btn">
          <HelpCircle size={20} />
        </button>
      </div>
    </header>
  );
};

// ============================================================================
// COMPONENT: DASHBOARD VIEW
// ============================================================================

const DashboardView = ({ setActiveView, setCurrentClient }) => {
  const workQueue = [
    { status: 'needs_review', label: 'Needs Review', count: 3, color: '#f59e0b', icon: Clock },
    { status: 'needs_client', label: 'Needs Client Info', count: 2, color: '#8b5cf6', icon: MessageSquare },
    { status: 'ready_report', label: 'Ready for Report', count: 1, color: '#10b981', icon: FileText },
    { status: 'ready_file', label: 'Ready to File', count: 0, color: '#3b82f6', icon: Send },
    { status: 'filed', label: 'Filed / Archived', count: 4, color: '#6b7280', icon: Archive },
  ];

  const recentActivity = [
    { time: '10 min ago', action: 'Uploaded 3 documents', client: 'Sarah Chen', type: 'upload' },
    { time: '1 hour ago', action: 'Approved 15 transactions', client: 'TechFlow Solutions', type: 'approve' },
    { time: '2 hours ago', action: 'Generated review report', client: 'Michael Rodriguez', type: 'report' },
    { time: '3 hours ago', action: 'Client answered 2 questions', client: 'Jennifer Walsh', type: 'answer' },
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
            {MOCK_CLIENTS.filter(c => c.status !== 'filed').slice(0, 4).map(client => (
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
              <span className="stat-value">47</span>
              <span className="stat-label">Documents Processed</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">234</span>
              <span className="stat-label">Transactions Reviewed</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">89%</span>
              <span className="stat-label">AI Accuracy</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">3</span>
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

const ClientsView = ({ setCurrentClient, setActiveView }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredClients = MOCK_CLIENTS.filter(client => {
    if (filter !== 'all' && client.status !== filter) return false;
    if (search && !client.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="clients-view">
      <div className="view-header">
        <div>
          <h1>Clients</h1>
          <p className="view-subtitle">{MOCK_CLIENTS.length} total clients</p>
        </div>
        <button className="primary-btn">
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
            <span className="col-actions">
              <button className="icon-btn" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal size={18} />
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT: UPLOAD CENTER
// ============================================================================

const UploadCenter = ({ currentClient }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState(MOCK_DOCUMENTS);
  const fileInputRef = useRef(null);

  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'Bank Statement';
    if (['jpg', 'jpeg', 'png'].includes(ext)) return 'Receipt';
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'Spreadsheet';
    return 'Document';
  };

  const processFiles = useCallback((files) => {
    if (!currentClient) return;

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
        }, 1500);
      }
    }, 200);
  }, [currentClient]);

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
    if (currentClient && fileInputRef.current) {
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
          <h3>Drop files here or click to browse</h3>
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

const TransactionReview = ({ currentClient }) => {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [selectedTransaction, setSelectedTransaction] = useState(MOCK_TRANSACTIONS[0]);
  const [filter, setFilter] = useState('pending');
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [bulkSelected, setBulkSelected] = useState([]);

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'approved') return t.status === 'approved';
    if (filter === 'flagged') return t.flags.length > 0;
    return true;
  });

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
          <button className="secondary-btn">
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      <div className="review-workspace">
        {/* Left Panel - Document Preview */}
        <div className="preview-panel">
          <div className="panel-header">
            <h3>Document Preview</h3>
            <div className="preview-controls">
              <button className="icon-btn"><ZoomOut size={16} /></button>
              <button className="icon-btn"><ZoomIn size={16} /></button>
              <button className="icon-btn"><RotateCw size={16} /></button>
              <button className="icon-btn"><Maximize2 size={16} /></button>
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
            <button className="icon-btn"><ChevronLeft size={18} /></button>
            <span>Page {selectedTransaction?.sourcePage || 1} of 8</span>
            <button className="icon-btn"><ChevronRight size={18} /></button>
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
                    <span key={idx} className={`flag-badge ${flag.replace('_', '-')}`}>
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
                    <button className="text-btn">
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
                <button className="action-btn secondary">
                  <Split size={16} />
                  Split Transaction
                </button>
                <button className="action-btn secondary">
                  <MessageSquare size={16} />
                  Ask Client
                </button>
              </div>

              <div className="ai-section create-rule">
                <button className="rule-btn">
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
    </div>
  );
};

// ============================================================================
// COMPONENT: CLIENT QUESTIONS
// ============================================================================

const QuestionsView = ({ currentClient }) => {
  return (
    <div className="questions-view">
      <div className="view-header">
        <div>
          <h1>Client Questions</h1>
          <p className="view-subtitle">
            {currentClient ? currentClient.name : 'All Clients'} • {MOCK_QUESTIONS.filter(q => q.status === 'pending').length} pending
          </p>
        </div>
        <button className="primary-btn">
          <Send size={18} />
          Send to Client
        </button>
      </div>

      <div className="questions-list">
        {MOCK_QUESTIONS.map(q => (
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
                <button className="icon-btn"><Edit3 size={16} /></button>
                <button className="icon-btn"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT: REPORTS VIEW
// ============================================================================

const ReportsView = ({ currentClient }) => {
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
          <button className="primary-btn">
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
            <button className="secondary-btn">
              <Download size={16} />
              CSV
            </button>
            <button className="secondary-btn">
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
          <button className="secondary-btn">
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
          <button className="secondary-btn">
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

const RulesView = () => {
  const rules = [
    { id: 1, merchant: 'UBER *EATS', category: 'Meals & Entertainment', scope: 'Firm-wide', uses: 47 },
    { id: 2, merchant: 'GOOGLE *ADS', category: 'Advertising', scope: 'Firm-wide', uses: 23 },
    { id: 3, merchant: 'SHELL', category: 'Fuel & Auto', scope: 'Firm-wide', uses: 89 },
    { id: 4, merchant: 'STRIPE', category: 'Self-Employment Income', scope: 'Client: TechFlow', uses: 12 },
    { id: 5, merchant: 'ROGERS', category: 'Telephone & Internet', scope: 'Firm-wide', uses: 34 },
  ];

  return (
    <div className="rules-view">
      <div className="view-header">
        <div>
          <h1>AI Rules</h1>
          <p className="view-subtitle">Manage categorization rules and teach the AI</p>
        </div>
        <button className="primary-btn">
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
            {rules.map(rule => (
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
                  <button className="icon-btn"><Edit3 size={16} /></button>
                  <button className="icon-btn"><Trash2 size={16} /></button>
                </span>
              </div>
            ))}
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
                  <strong>AMAZON.CA → Office Expenses</strong>
                  <p>You've categorized 12 Amazon transactions as Office Expenses. Create a rule?</p>
                </div>
              </div>
              <div className="suggestion-actions">
                <button className="approve-btn"><Check size={16} /></button>
                <button className="reject-btn"><X size={16} /></button>
              </div>
            </div>
            <div className="suggestion-card">
              <div className="suggestion-content">
                <Sparkles size={18} />
                <div>
                  <strong>COSTCO → Supplies</strong>
                  <p>You've categorized 8 Costco transactions as Supplies. Create a rule?</p>
                </div>
              </div>
              <div className="suggestion-actions">
                <button className="approve-btn"><Check size={16} /></button>
                <button className="reject-btn"><X size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT: SETTINGS
// ============================================================================

const SettingsView = () => {
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
            <div className="team-member">
              <div className="avatar">JD</div>
              <div className="member-info">
                <span className="member-name">Jessica Davis</span>
                <span className="member-role">Admin Partner</span>
              </div>
              <button className="icon-btn"><Edit3 size={16} /></button>
            </div>
            <div className="team-member">
              <div className="avatar">MK</div>
              <div className="member-info">
                <span className="member-name">Michael Kim</span>
                <span className="member-role">Staff Accountant</span>
              </div>
              <button className="icon-btn"><Edit3 size={16} /></button>
            </div>
          </div>
          <button className="text-btn">
            <Plus size={16} />
            Add Team Member
          </button>
        </div>

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

const AccountingOfficeDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);

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
        return <DashboardView setActiveView={setActiveView} setCurrentClient={setCurrentClient} />;
      case 'clients':
        return <ClientsView setCurrentClient={setCurrentClient} setActiveView={setActiveView} />;
      case 'upload':
        return <UploadCenter currentClient={currentClient} />;
      case 'review':
        return <TransactionReview currentClient={currentClient} />;
      case 'questions':
        return <QuestionsView currentClient={currentClient} />;
      case 'reports':
        return <ReportsView currentClient={currentClient} />;
      case 'rules':
        return <RulesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView setActiveView={setActiveView} setCurrentClient={setCurrentClient} />;
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
        <TopHeader currentClient={currentClient} setCurrentClient={setCurrentClient} />
        <main className="content-area">
          {renderView()}
        </main>
      </div>

    </div>
  );
};

export default AccountingOfficeDashboard;
