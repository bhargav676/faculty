import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  MdDashboard, MdPeople, MdHistory, MdSettings, MdHelp,
  MdSearch, MdNotificationsNone, MdPerson, MdWifi,
  MdArrowBack, MdArrowUpward, MdChevronRight, MdCheckCircle,
  MdCancel, MdFilterList, MdAdd, MdLocationOn, MdAccessTime,
  MdOutlineSchool, MdTrendingUp
} from 'react-icons/md';
import { FiWifi, FiClock, FiZap, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const API_BASE = 'https://facultyserver-lws4.onrender.com/api';
const ACTIVE_THRESHOLD_MS = 90_000;

const GREEN = '#1a5c38';
const GREEN_LIGHT = '#e8f5ee';
const GREEN_MID = '#2d7a4f';

const isActive = (ts) => Date.now() - new Date(ts).getTime() < ACTIVE_THRESHOLD_MS;
const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

/* ── Styles ─────────────────────────────────────────────────────── */
if (!document.getElementById('_donezo_ft')) {
  const el = document.createElement('style');
  el.id = '_donezo_ft';
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100%; min-height: 100vh; }
    body { background: #f5f6fa; font-family: 'Inter', sans-serif; color: #0f172a; }

    /* ── Layout ── */
    .dz-layout { display: flex; min-height: 100vh; }

    /* ── Sidebar ── */
    .dz-sidebar {
      width: 220px; background: #fff;
      border-right: 1px solid #eff0f3;
      padding: 24px 14px;
      display: flex; flex-direction: column; gap: 2px;
      position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
    }
    .dz-logo { display: flex; align-items: center; gap: 10px; padding: 8px 10px; margin-bottom: 28px; }
    .dz-logo-icon {
      width: 38px; height: 38px; border-radius: 10px;
      background: #1a5c38;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 20px;
    }
    .dz-logo-name { font-size: 17px; font-weight: 800; color: #0f172a; letter-spacing: -.02em; }
    .dz-section-label {
      font-size: 10px; font-weight: 700; color: #b0b7c3;
      letter-spacing: .12em; text-transform: uppercase; padding: 12px 12px 5px;
    }
    .dz-nav {
      display: flex; align-items: center; gap: 10px; padding: 10px 12px;
      border-radius: 10px; font-size: 14px; font-weight: 600; color: #64748b;
      cursor: pointer; transition: all .15s; border: none; background: none;
      width: 100%; text-align: left; font-family: inherit; position: relative;
    }
    .dz-nav:hover { background: #f5f6fa; color: #0f172a; }
    .dz-nav.active { background: #e8f5ee; color: #1a5c38; }
    .dz-nav.active::before {
      content: ''; position: absolute; left: 0; top: 20%; bottom: 20%;
      width: 3px; border-radius: 999px; background: #1a5c38;
    }
    .dz-badge {
      margin-left: auto; background: #1a5c38; color: #fff;
      font-size: 10px; font-weight: 700; border-radius: 999px;
      padding: 2px 7px; min-width: 20px; text-align: center;
    }
    .dz-sidebar-footer {
      margin-top: auto; padding: 16px 12px 0;
      border-top: 1px solid #eff0f3;
    }
    .dz-app-promo {
      background: linear-gradient(135deg, #1a5c38, #2d7a4f);
      border-radius: 14px; padding: 18px 16px; color: #fff;
    }
    .dz-app-promo-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
    .dz-app-promo-sub   { font-size: 11px; opacity: .7; margin-bottom: 14px; line-height: 1.4; }
    .dz-app-promo-btn {
      display: inline-block; background: #fff; color: #1a5c38;
      font-size: 12px; font-weight: 700; border-radius: 8px;
      padding: 7px 14px; cursor: pointer; border: none; font-family: inherit;
    }

    /* ── Main ── */
    .dz-main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }

    /* ── Topbar ── */
    .dz-topbar {
      background: #fff; border-bottom: 1px solid #eff0f3;
      padding: 0 32px; height: 64px;
      display: flex; align-items: center; gap: 16px; position: sticky; top: 0; z-index: 50;
    }
    .dz-search {
      flex: 1; max-width: 340px; display: flex; align-items: center; gap: 10px;
      background: #f5f6fa; border: 1.5px solid #e8eaf0; border-radius: 10px;
      padding: 9px 16px; transition: border-color .15s;
    }
    .dz-search:focus-within { border-color: #1a5c38; background: #fff; }
    .dz-search input { border: none; outline: none; background: transparent; font-size: 13px; color: #0f172a; width: 100%; font-family: inherit; }
    .dz-search input::placeholder { color: #b0b7c3; }
    .dz-topbar-actions { margin-left: auto; display: flex; align-items: center; gap: 10px; }
    .dz-icon-btn {
      width: 38px; height: 38px; border-radius: 10px; background: #f5f6fa;
      border: 1px solid #eff0f3; display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #64748b; transition: all .15s;
    }
    .dz-icon-btn:hover { background: #e8f5ee; color: #1a5c38; border-color: #c6e8d6; }
    .dz-user-pill {
      display: flex; align-items: center; gap: 10px;
      background: #f5f6fa; border: 1px solid #eff0f3; border-radius: 10px;
      padding: 6px 12px 6px 6px; cursor: pointer;
    }
    .dz-user-av {
      width: 30px; height: 30px; border-radius: 8px;
      background: linear-gradient(135deg, #1a5c38, #2d7a4f);
      display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px;
    }
    .dz-user-name { font-size: 13px; font-weight: 700; color: #0f172a; }
    .dz-user-role { font-size: 11px; color: #94a3b8; }

    /* ── Content ── */
    .dz-content { padding: 30px 32px; flex: 1; }
    .dz-page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 26px; }
    .dz-page-title { font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -.03em; }
    .dz-page-sub   { font-size: 14px; color: #94a3b8; margin-top: 4px; }
    .dz-header-actions { display: flex; gap: 10px; }
    .dz-btn-primary {
      display: flex; align-items: center; gap: 7px;
      background: #1a5c38; color: #fff; border: none; border-radius: 10px;
      padding: 10px 18px; font-size: 14px; font-weight: 700; cursor: pointer;
      transition: background .15s; font-family: inherit;
    }
    .dz-btn-primary:hover { background: #145030; }
    .dz-btn-outline {
      display: flex; align-items: center; gap: 7px;
      background: #fff; color: #0f172a; border: 1.5px solid #e2e8f0;
      border-radius: 10px; padding: 10px 18px; font-size: 14px;
      font-weight: 600; cursor: pointer; transition: all .15s; font-family: inherit;
    }
    .dz-btn-outline:hover { border-color: #1a5c38; color: #1a5c38; }

    /* ── Stat Cards ── */
    .dz-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 26px; }
    .dz-stat {
      border-radius: 16px; padding: 22px 22px 20px; position: relative;
      overflow: hidden; cursor: pointer;
    }
    .dz-stat-dark  { background: #1a5c38; }
    .dz-stat-white { background: #fff; border: 1.5px solid #eff0f3; }
    .dz-stat-arrow {
      position: absolute; top: 16px; right: 16px;
      width: 30px; height: 30px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .dz-stat-dark  .dz-stat-arrow { background: rgba(255,255,255,.15); color: #fff; }
    .dz-stat-white .dz-stat-arrow { background: #f5f6fa; color: #64748b; }
    .dz-stat-label { font-size: 13px; font-weight: 600; margin-bottom: 14px; }
    .dz-stat-dark  .dz-stat-label { color: rgba(255,255,255,.75); }
    .dz-stat-white .dz-stat-label { color: #64748b; }
    .dz-stat-num { font-size: 38px; font-weight: 800; line-height: 1; margin-bottom: 10px; }
    .dz-stat-dark  .dz-stat-num { color: #fff; }
    .dz-stat-white .dz-stat-num { color: #0f172a; }
    .dz-stat-trend {
      display: flex; align-items: center; gap: 5px;
      font-size: 12px; font-weight: 600;
    }
    .dz-stat-dark  .dz-stat-trend { color: rgba(255,255,255,.8); }
    .dz-stat-trend.up   { color: #16a34a; }
    .dz-stat-trend.down { color: #dc2626; }
    .dz-stat-trend-icon {
      width: 18px; height: 18px; border-radius: 5px;
      display: flex; align-items: center; justify-content: center; font-size: 10px;
    }
    .dz-stat-dark .dz-stat-trend-icon { background: rgba(255,255,255,.15); }
    .dz-stat-trend.up   .dz-stat-trend-icon { background: #dcfce7; color: #16a34a; }
    .dz-stat-trend.down .dz-stat-trend-icon { background: #fee2e2; color: #dc2626; }

    /* ── Columns ── */
    .dz-columns { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
    .dz-columns-3 { display: grid; grid-template-columns: 1fr 1fr 300px; gap: 20px; }
    .dz-card { background: #fff; border: 1.5px solid #eff0f3; border-radius: 18px; padding: 22px; }
    .dz-card-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; }
    .dz-card-title-action {
      display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600;
      color: #1a5c38; background: #e8f5ee; border: 1px solid #c6e8d6;
      border-radius: 7px; padding: 4px 10px; cursor: pointer;
    }

    /* ── Mini Bar Chart ── */
    .dz-chart { display: flex; align-items: flex-end; gap: 8px; height: 100px; }
    .dz-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .dz-bar {
      width: 100%; border-radius: 6px 6px 0 0; position: relative;
      transition: height .4s ease;
    }
    .dz-bar.green { background: #1a5c38; }
    .dz-bar.light { background: #e8f5ee; }
    .dz-bar.stripe {
      background: repeating-linear-gradient(
        45deg, #e8eaf0 0px, #e8eaf0 4px, #f5f6fa 4px, #f5f6fa 8px
      );
    }
    .dz-bar-label { font-size: 11px; color: #94a3b8; font-weight: 500; }
    .dz-bar-pct {
      position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
      font-size: 10px; font-weight: 700; color: #fff; background: #1a5c38;
      border-radius: 4px; padding: 1px 5px;
    }

    /* ── Faculty List ── */
    .dz-fac-row {
      display: flex; align-items: center; gap: 12px; padding: 11px 0;
      border-bottom: 1px solid #f5f6fa; cursor: pointer; transition: background .12s;
      border-radius: 8px; margin: 0 -6px; padding-left: 8px; padding-right: 8px;
    }
    .dz-fac-row:last-child { border-bottom: none; }
    .dz-fac-row:hover { background: #f9fafb; }
    .dz-fac-av {
      width: 38px; height: 38px; border-radius: 50%;
      background: linear-gradient(135deg, #e8f5ee, #c6e8d6);
      display: flex; align-items: center; justify-content: center;
      color: #1a5c38; font-size: 18px; flex-shrink: 0;
    }
    .dz-fac-name { font-size: 14px; font-weight: 600; color: #0f172a; }
    .dz-fac-wifi { font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
    .dz-fac-status {
      margin-left: auto; padding: 3px 10px; border-radius: 999px;
      font-size: 11px; font-weight: 700;
    }
    .dz-fac-status.on  { background: #dcfce7; color: #16a34a; }
    .dz-fac-status.off { background: #fef9ee; color: #b45309; }

    /* ── Right panel: Recent Activity ── */
    .dz-act-row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f5f6fa; }
    .dz-act-row:last-child { border-bottom: none; }
    .dz-act-ic {
      width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 14px;
    }
    .dz-act-ic.green { background: #e8f5ee; color: #1a5c38; }
    .dz-act-ic.blue  { background: #eff6ff; color: #3b82f6; }
    .dz-act-ic.amber { background: #fefce8; color: #b45309; }
    .dz-act-main { flex: 1; }
    .dz-act-name { font-size: 13px; font-weight: 600; color: #0f172a; }
    .dz-act-time { font-size: 11px; color: #94a3b8; margin-top: 1px; }
    .dz-act-badge {
      font-size: 10px; font-weight: 700; border-radius: 5px; padding: 2px 7px;
    }
    .dz-act-badge.done    { background: #dcfce7; color: #16a34a; }
    .dz-act-badge.live    { background: #e8f5ee; color: #1a5c38; }
    .dz-act-badge.offline { background: #fef9ee; color: #b45309; }

    /* ── Time tracker pill ── */
    .dz-time-card {
      background: linear-gradient(135deg, #0f3d24, #1a5c38);
      border-radius: 18px; padding: 22px; color: #fff;
    }
    .dz-time-label { font-size: 12px; color: rgba(255,255,255,.65); font-weight: 600; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
    .dz-time-val   { font-size: 34px; font-weight: 800; letter-spacing: .04em; }

    /* ── Detail ── */
    .dz-detail-banner {
      background: linear-gradient(135deg, #1a5c38, #2d7a4f);
      border-radius: 18px; padding: 30px; display: flex; align-items: center; gap: 20px; margin-bottom: 20px;
    }
    .dz-detail-av {
      width: 64px; height: 64px; border-radius: 16px; background: rgba(255,255,255,.15);
      display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28px;
    }
    .dz-detail-info h2 { font-size: 22px; font-weight: 800; color: #fff; }
    .dz-detail-info p  { font-size: 13px; color: rgba(255,255,255,.65); margin-top: 3px; }
    .dz-ibox {
      display: flex; align-items: center; gap: 14px; background: #f9fafb;
      border: 1.5px solid #eff0f3; border-radius: 14px; padding: 17px 18px; margin-bottom: 12px;
    }
    .dz-ibox:hover { border-color: #c6e8d6; background: #f0f9f4; }
    .dz-ibox-ic { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
    .dz-ibox-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 4px; }
    .dz-ibox-val   { font-size: 17px; font-weight: 700; color: #0f172a; }

    /* ── Skeleton ── */
    .dz-skel { background: linear-gradient(90deg,#f1f5f9 25%,#e8edf5 50%,#f1f5f9 75%); background-size:200% 100%; animation:dz-shimmer 1.2s infinite; border-radius:8px; }
    @keyframes dz-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

    /* ── Animations ── */
    @keyframes dz-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
    .dz-live-dot { width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 6px #22c55e;animation:dz-pulse 1.5s ease-in-out infinite;display:inline-block; }
    @keyframes dz-spin { to{transform:rotate(360deg)} }
    .dz-spinning { animation:dz-spin .7s linear infinite; }

    @media(max-width:900px){
      .dz-sidebar{display:none;} .dz-main{margin-left:0;}
      .dz-stats{grid-template-columns:1fr 1fr;}
      .dz-columns,.dz-columns-3{grid-template-columns:1fr;}
    }
  `;
  document.head.appendChild(el);
}

/* ── Clock ────────────────────────────────────────────────────── */
const Clock = () => {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return <>{t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</>;
};

/* ── Sidebar ─────────────────────────────────────────────────── */
const Sidebar = ({ view, setView, activeCount }) => (
  <div className="dz-sidebar">
    <div className="dz-logo">
      <div className="dz-logo-icon"><MdOutlineSchool /></div>
      <span className="dz-logo-name">FacTrack</span>
    </div>

    <div className="dz-section-label">Menu</div>
    <button className={`dz-nav ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
      <MdDashboard size={17} /> Dashboard
    </button>
    <button className={`dz-nav ${view === 'faculty' ? 'active' : ''}`} onClick={() => setView('faculty')}>
      <MdPeople size={17} /> Faculty
      {activeCount > 0 && <span className="dz-badge">{activeCount}</span>}
    </button>
    <button className={`dz-nav ${view === 'activity' ? 'active' : ''}`} onClick={() => setView('activity')}>
      <MdHistory size={17} /> Activity
    </button>

    <div className="dz-section-label" style={{ marginTop: 10 }}>General</div>
    <button className={`dz-nav ${view === 'settings' ? 'active' : ''}`} onClick={() => setView('settings')}><MdSettings size={17} /> Settings</button>
    <button className={`dz-nav ${view === 'help' ? 'active' : ''}`} onClick={() => setView('help')}><MdHelp size={17} /> Help</button>

    <div className="dz-sidebar-footer">
      <div className="dz-app-promo">
        <div className="dz-app-promo-title">Track Anywhere</div>
        <div className="dz-app-promo-sub">Faculty locations update live every 3 seconds via ESP32</div>
        <button className="dz-app-promo-btn">Learn More</button>
      </div>
    </div>
  </div>
);

/* ── Topbar ──────────────────────────────────────────────────── */
const Topbar = ({ search, setSearch }) => (
  <div className="dz-topbar">
    <div className="dz-search">
      <MdSearch size={16} color="#b0b7c3" />
      <input placeholder="Search faculty or WiFi…" value={search} onChange={e => setSearch(e.target.value)} />
    </div>
    <div className="dz-topbar-actions"></div>
  </div>
);

/* ── Mini bar chart (days of week simulation) ─────────────────── */
const WeekChart = ({ data }) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const max = Math.max(...data, 1);
  const today = new Date().getDay();
  return (
    <div className="dz-chart">
      {days.map((d, i) => {
        const h = Math.round((data[i] / max) * 90);
        const isToday = i === today;
        const cls = isToday ? 'green' : (data[i] > 0 ? 'light' : 'stripe');
        return (
          <div key={i} className="dz-bar-wrap">
            <div className="dz-bar" style={{ height: h || 10, background: undefined }} >
              <div className={`dz-bar ${cls}`} style={{ height: h || 10, position:'relative' }}>
                {isToday && data[i] > 0 && <span className="dz-bar-pct">{data[i]}</span>}
              </div>
            </div>
            <span className="dz-bar-label">{d}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ── Main Dashboard ──────────────────────────────────────────── */
const Dashboard = () => {
  const [facultyData, setFacultyData] = useState([]);
  const [history, setHistory]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [spinning, setSpinning]       = useState(false);
  const [error, setError]             = useState(null);
  const [selected, setSelected]       = useState(null);
  const [search, setSearch]           = useState('');
  const [view, setView]               = useState('list');

  const fetchData = useCallback(async (manual = false) => {
    if (manual) setSpinning(true);
    try {
      const res = await axios.get(`${API_BASE}/location/latest`, { timeout: 8000 });
      setFacultyData(res.data);
      setLoading(false); setError(null);
    } catch {
      if (loading) setError('Cannot connect to tracking server.');
      setLoading(false);
    } finally {
      if (manual) setTimeout(() => setSpinning(false), 700);
    }
  }, [loading]);

  useEffect(() => {
    fetchData();
    const id = setInterval(() => fetchData(), 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!selected) return;
    axios.get(`${API_BASE}/location/history/${selected}`, { timeout: 8000 })
      .then(r => setHistory(r.data)).catch(() => setHistory([]));
  }, [selected]);

  const totalFaculty  = facultyData.length;
  const activeCount   = facultyData.filter(f => isActive(f.timestamp)).length;
  const inactiveCount = totalFaculty - activeCount;

  // Simulated weekly activity from actual data
  const weekData = [0, 0, 0, 0, 0, 0, 0];
  facultyData.forEach(f => {
    const day = new Date(f.timestamp).getDay();
    weekData[day] = (weekData[day] || 0) + 1;
  });

  const filtered = facultyData.filter(f =>
    f.facultyId.toLowerCase().includes(search.toLowerCase()) ||
    f.wifiName.toLowerCase().includes(search.toLowerCase())
  );

  const selectedFaculty = facultyData.find(f => f.facultyId === selected);

  const sidebarProps = { view, setView, activeCount };

  /* Loading */
  if (loading) return (
    <div className="dz-layout">
      <Sidebar {...sidebarProps} />
      <div className="dz-main">
        <Topbar search={search} setSearch={setSearch} />
        <div className="dz-content">
          <div className="dz-stats">
            {[1,2,3,4].map(i => <div key={i} className="dz-skel" style={{ height: 130, borderRadius: 16 }} />)}
          </div>
        </div>
      </div>
    </div>
  );

  /* Error */
  if (error) return (
    <div className="dz-layout">
      <Sidebar {...sidebarProps} />
      <div className="dz-main">
        <Topbar search={search} setSearch={setSearch} />
        <div className="dz-content" style={{ display:'flex', alignItems:'center', justifyContent:'center', marginTop:80 }}>
          <div style={{ textAlign:'center' }}>
            <FiAlertCircle size={40} color="#dc2626" style={{ marginBottom:12 }} />
            <div style={{ fontSize:18, fontWeight:700, color:'#475569' }}>Connection Failed</div>
            <div style={{ fontSize:14, color:'#94a3b8', marginTop:6 }}>{error}</div>
          </div>
        </div>
      </div>
    </div>
  );

  /* Detail */
  if (selected && selectedFaculty) {
    const active = isActive(selectedFaculty.timestamp);
    return (
      <div className="dz-layout">
        <Sidebar {...sidebarProps} />
        <div className="dz-main">
          <Topbar search={search} setSearch={setSearch} />
          <div className="dz-content">
            <button className="dz-btn-outline" style={{ marginBottom: 22, width: 'fit-content' }} onClick={() => { setSelected(null); setHistory([]); }}>
              <MdArrowBack size={16} /> Back to Dashboard
            </button>
            <div style={{ maxWidth: 680 }}>
              <div className="dz-detail-banner">
                <div className="dz-detail-av"><MdPerson /></div>
                <div className="dz-detail-info">
                  <h2>{selectedFaculty.facultyId}</h2>
                  <p>{active ? '● Active – detected recently' : '● Inactive – no recent signal'}</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <div className={`dz-fac-status ${active ? 'on' : 'off'}`}>
                    {active ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              <div className="dz-card">
                <div className="dz-ibox">
                  <div className="dz-ibox-ic" style={{ background: '#eff6ff', color: '#3b82f6' }}><FiWifi /></div>
                  <div><div className="dz-ibox-label">Connected WiFi</div><div className="dz-ibox-val">{selectedFaculty.wifiName}</div></div>
                </div>
                <div className="dz-ibox">
                  <div className="dz-ibox-ic" style={{ background: '#f0fdf4', color: '#16a34a' }}><FiClock /></div>
                  <div><div className="dz-ibox-label">Last Detected</div>
                    <div className="dz-ibox-val">
                      {new Date(selectedFaculty.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="dz-ibox">
                  <div className="dz-ibox-ic" style={{ background: '#fdf4ff', color: '#9333ea' }}><FiZap /></div>
                  <div><div className="dz-ibox-label">Status</div>
                    <div className="dz-ibox-val">{active ? 'Active · ' + timeAgo(selectedFaculty.timestamp) : 'Inactive · last seen ' + timeAgo(selectedFaculty.timestamp)}</div>
                  </div>
                </div>
                {history.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', margin: '18px 0 12px' }}>Connection History</div>
                    {history.slice(0, 6).map((h, i) => (
                      <div key={i} className="dz-act-row">
                        <div className="dz-act-ic green"><MdWifi /></div>
                        <div className="dz-act-main">
                          <div className="dz-act-name">{h.wifiName}</div>
                          <div className="dz-act-time">{new Date(h.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div className="dz-act-badge live">{timeAgo(h.timestamp)}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Settings */
  if (view === 'settings') return (
    <div className="dz-layout">
      <Sidebar {...sidebarProps} />
      <div className="dz-main">
        <Topbar search={search} setSearch={setSearch} />
        <div className="dz-content">
          <div className="dz-page-header">
            <div><div className="dz-page-title">Settings</div><div className="dz-page-sub">System configuration overview</div></div>
          </div>
          <div style={{ maxWidth: 600 }}>
            {[
              { label: 'Poll Interval',      val: 'Every 3 seconds',                             ic: <FiClock />,          icBg: '#faf5ff', icColor: '#8b5cf6' },
              { label: 'Active Threshold',   val: '90 seconds (1.5 min)',                        ic: <FiZap />,            icBg: '#f0fdf4', icColor: '#16a34a' },
              { label: 'Hardware Device',    val: 'ESP32 WiFi Tracker',                          ic: <MdWifi size={18} />, icBg: '#fef9ee', icColor: '#b45309' },
            ].map(r => (
              <div key={r.label} className="dz-ibox">
                <div className="dz-ibox-ic" style={{ background: r.icBg, color: r.icColor }}>{r.ic}</div>
                <div><div className="dz-ibox-label">{r.label}</div><div className="dz-ibox-val">{r.val}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* Help */
  if (view === 'help') return (
    <div className="dz-layout">
      <Sidebar {...sidebarProps} />
      <div className="dz-main">
        <Topbar search={search} setSearch={setSearch} />
        <div className="dz-content">
          <div className="dz-page-header">
            <div><div className="dz-page-title">Help</div><div className="dz-page-sub">How the Faculty Tracker works</div></div>
          </div>
          <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { q: 'How is location tracked?',         a: 'An ESP32 device scans for known WiFi networks. When it connects, it sends the WiFi name to the backend server as the faculty\'s location.' },
              { q: 'What does Active / Inactive mean?', a: 'If a faculty\'s last update arrived within 90 seconds they are Active. Older = Inactive — the ESP32 may be out of range or off.' },
              { q: 'How fast is data updated?',         a: 'The dashboard polls every 3 seconds. The server caches results for 3 seconds to reduce database load.' },
              { q: 'How do I add more faculty?',        a: 'Program an ESP32 with a unique facultyId. The backend automatically tracks any new facultyId it receives via POST.' },
            ].map(item => (
              <div key={item.q} className="dz-card" style={{ padding: '20px 22px' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8, fontSize: 15 }}>{item.q}</div>
                <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* Main list */
  return (
    <div className="dz-layout">
      <Sidebar {...sidebarProps} />
      <div className="dz-main">
        <Topbar search={search} setSearch={setSearch} />
        <div className="dz-content">
          {/* ── Hero Intro ── */}
          <div style={{
            background: 'linear-gradient(135deg, #1a5c38 0%, #2d7a4f 60%, #14532d 100%)',
            borderRadius: 22, padding: '36px 36px 32px', marginBottom: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative blobs */}
            <div style={{ position:'absolute', right:-40, top:-40, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,.06)' }}/>
            <div style={{ position:'absolute', right:80, bottom:-60, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,.04)' }}/>
            <div style={{ position:'absolute', left:'40%', top:-30, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,.03)' }}/>

            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <span className="dz-live-dot" style={{ background:'#4ade80', boxShadow:'0 0 8px #4ade80' }}/>
                <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,.75)', letterSpacing:'.1em', textTransform:'uppercase' }}>
                  System Online
                </span>
              </div>
              <h1 style={{ fontSize:'clamp(22px,3vw,34px)', fontWeight:800, color:'#fff', marginBottom:10, letterSpacing:'-.02em', lineHeight:1.15 }}>
                Welcome to <span style={{ color:'#86efac' }}>FacTrack</span> 
              </h1>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.65)', maxWidth:420, lineHeight:1.6, marginBottom:22 }}>
                Real-time faculty location tracking powered by ESP32 WiFi detection. Monitor who's on campus — instantly.
              </p>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.18)', borderRadius:10, padding:'8px 14px', fontSize:13, fontWeight:600, color:'#fff' }}>
                  <MdPeople size={16}/> {totalFaculty} Faculty Tracked
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:7, background:'rgba(74,222,128,.15)', border:'1px solid rgba(74,222,128,.3)', borderRadius:10, padding:'8px 14px', fontSize:13, fontWeight:600, color:'#86efac' }}>
                  <MdCheckCircle size={16}/> {activeCount} Active Now
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:7, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', borderRadius:10, padding:'8px 14px', fontSize:13, fontWeight:600, color:'rgba(255,255,255,.7)' }}>
                  <FiClock size={14}/> Updates every 3s
                </div>
              </div>
            </div>

            <div style={{ position:'relative', zIndex:1, textAlign:'right', flexShrink:0, display:'flex', flexDirection:'column', gap:12, alignItems:'flex-end' }}>
              <button className="dz-btn-outline" style={{ background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)', color:'#fff', backdropFilter:'blur(8px)' }} onClick={() => fetchData(true)}>
                <FiRefreshCw size={14} className={spinning ? 'dz-spinning' : ''} /> Refresh
              </button>
              <div style={{ background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)', borderRadius:14, padding:'14px 18px', textAlign:'center', minWidth:100 }}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>System Clock</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#fff', letterSpacing:'.04em' }}><Clock /></div>
              </div>
            </div>
          </div>

          {/* ── 3 Quick Feature Cards ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:26 }}>
            {[
              { icon:<MdWifi size={20}/>, ic:'#eff6ff', iconColor:'#3b82f6', label:'WiFi Detection', desc:'ESP32 auto-connects to known networks and reports instantly' },
              { icon:<FiZap size={18}/>, ic:'#f0fdf4', iconColor:'#16a34a', label:'Live Updates', desc:'Server pushes fresh data every 3 seconds with smart caching' },
              { icon:<MdLocationOn size={20}/>, ic:'#faf5ff', iconColor:'#8b5cf6', label:'Location History', desc:'Click any faculty to view their complete connection log' },
            ].map(c => (
              <div key={c.label} style={{ background:'#fff', border:'1.5px solid #eff0f3', borderRadius:16, padding:'18px 18px', display:'flex', gap:13, alignItems:'flex-start' }}>
                <div style={{ width:42, height:42, borderRadius:12, background:c.ic, color:c.iconColor, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontWeight:700, color:'#0f172a', fontSize:14, marginBottom:4 }}>{c.label}</div>
                  <div style={{ color:'#94a3b8', fontSize:12, lineHeight:1.5 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>


          {/* 4 Stat Cards */}
          <div className="dz-stats">
            <div className="dz-stat dz-stat-dark">
              <div className="dz-stat-arrow"><MdChevronRight size={16} /></div>
              <div className="dz-stat-label">Total Faculty</div>
              <div className="dz-stat-num">{totalFaculty}</div>
              <div className="dz-stat-trend">
                <span className="dz-stat-trend-icon"><MdArrowUpward size={10} /></span>
                Tracking active
              </div>
            </div>
            <div className="dz-stat dz-stat-white">
              <div className="dz-stat-arrow"><MdChevronRight size={16} /></div>
              <div className="dz-stat-label">Active Now</div>
              <div className="dz-stat-num">{activeCount}</div>
              <div className={`dz-stat-trend ${activeCount > 0 ? 'up' : ''}`}>
                <span className="dz-stat-trend-icon"><MdCheckCircle size={10} /></span>
                {activeCount > 0 ? 'Online now' : 'None active'}
              </div>
            </div>
            <div className="dz-stat dz-stat-white">
              <div className="dz-stat-arrow"><MdChevronRight size={16} /></div>
              <div className="dz-stat-label">Inactive</div>
              <div className="dz-stat-num">{inactiveCount}</div>
              <div className={`dz-stat-trend ${inactiveCount > 0 ? 'down' : 'up'}`}>
                <span className="dz-stat-trend-icon"><MdCancel size={10} /></span>
                {inactiveCount > 0 ? 'No recent signal' : 'All active'}
              </div>
            </div>
            <div className="dz-stat dz-stat-white">
              <div className="dz-stat-arrow"><MdChevronRight size={16} /></div>
              <div className="dz-stat-label">Update Rate</div>
              <div className="dz-stat-num">3s</div>
              <div className="dz-stat-trend up">
                <span className="dz-stat-trend-icon"><MdTrendingUp size={10} /></span>
                Real-time refresh
              </div>
            </div>
          </div>

          {/* Lower columns */}
          <div className="dz-columns">
            <div>

              {/* Faculty table */}
              <div className="dz-card">
                <div className="dz-card-title">
                  Faculty List
                  <span className="dz-card-title-action"><MdAdd size={14} /> Add Faculty</span>
                </div>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                    <MdPeople size={32} style={{ marginBottom: 8 }} /><br />
                    {search ? 'No results found' : 'Waiting for ESP32 connections…'}
                  </div>
                ) : (
                  filtered.map(f => {
                    const active = isActive(f.timestamp);
                    return (
                      <div key={f.facultyId} className="dz-fac-row" onClick={() => setSelected(f.facultyId)}>
                        <div className="dz-fac-av"><MdPerson /></div>
                        <div>
                          <div className="dz-fac-name">{f.facultyId}</div>
                          <div className="dz-fac-wifi"><MdWifi size={12} color="#1a5c38" />{f.wifiName}</div>
                        </div>
                        <div className={`dz-fac-status ${active ? 'on' : 'off'}`}>
                          {active ? 'Active' : 'Inactive'}
                        </div>
                        <MdChevronRight size={18} color="#cbd5e1" style={{ marginLeft: 4 }} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Time tracker */}
              <div className="dz-time-card">
                <div className="dz-time-label">System Clock</div>
                <div className="dz-time-val"><Clock /></div>
              </div>

              {/* Recent connections */}
              <div className="dz-card" style={{ flex: 1 }}>
                <div className="dz-card-title">
                  Recent
                  <span className="dz-card-title-action">+ New</span>
                </div>
                {facultyData.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>No data yet</div>
                ) : (
                  [...facultyData]
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 6)
                    .map((f, i) => {
                      const active = isActive(f.timestamp);
                      return (
                        <div key={f.facultyId} className="dz-act-row" style={{ cursor: 'pointer' }} onClick={() => setSelected(f.facultyId)}>
                          <div className={`dz-act-ic ${active ? 'green' : 'amber'}`}>
                            <MdPerson />
                          </div>
                          <div className="dz-act-main">
                            <div className="dz-act-name">{f.facultyId}</div>
                            <div className="dz-act-time">{f.wifiName}</div>
                          </div>
                          <div className={`dz-act-badge ${active ? 'live' : 'offline'}`}>
                            {active ? 'Live' : timeAgo(f.timestamp)}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;