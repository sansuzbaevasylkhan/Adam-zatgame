import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  'https://oizbljpetnhvijytgwxk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pemJsanBldG5odmlqeXRnd3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NDAyMDgsImV4cCI6MjA4ODMxNjIwOH0.WCtowKRg2fo4beR7lUAw-iNJGUllHrHIcfteaud8xAQ'
);

// --- Ultra Max Premium Styles (Inline) ---
const theme = {
  bgDeep: '#0A0A0C',
  bgSurface: '#121216',
  bgElevated: '#1C1C24',
  goldPrimary: '#D4AF37',
  goldGlow: 'rgba(212, 175, 55, 0.3)',
  textMain: '#FFFFFF',
  textSecondary: '#A0A0AA',
  borderColor: '#2A2A32',
  redAccent: '#EF4444',
};

const styles = {
  adminContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: theme.bgDeep,
    color: theme.textMain,
    fontFamily: 'Inter, sans-serif',
  },
  sidebar: {
    width: '300px',
    backgroundColor: theme.bgSurface,
    borderRight: `1px solid ${theme.borderColor}`,
    display: 'flex',
    flexDirection: 'column',
    padding: '60px 25px',
    position: 'fixed',
    height: '100vh',
    zIndex: 100,
    transition: 'all 0.3s ease',
  },
  brand: {
    textAlign: 'center',
    marginBottom: '60px',
    paddingBottom: '30px',
    borderBottom: `1px solid ${theme.borderColor}`,
  },
  brandTitle: {
    fontSize: '28px',
    fontWeight: '900',
    color: theme.goldPrimary,
    letterSpacing: '4px',
    textTransform: 'uppercase',
    margin: 0,
    textShadow: `0 0 20px ${theme.goldGlow}`,
  },
  brandSubtitle: {
    fontSize: '12px',
    color: theme.textSecondary,
    letterSpacing: '5px',
    textTransform: 'uppercase',
    marginTop: '10px',
    fontWeight: '600',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    flex: 1,
    marginTop: '20px',
  },
  navItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '18px 25px',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    color: active ? theme.goldPrimary : theme.textSecondary,
    backgroundColor: active ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
    borderLeft: active ? `6px solid ${theme.goldPrimary}` : '6px solid transparent',
    fontWeight: '600',
    fontSize: '16px',
    userSelect: 'none',
    transform: active ? 'translateX(10px)' : 'translateX(0)',
  }),
  mainContent: {
    marginLeft: '300px',
    flex: 1,
    padding: '60px',
    backgroundColor: theme.bgDeep,
    minHeight: '100vh',
  },
  pageHeader: {
    marginBottom: '50px',
    paddingLeft: '30px',
  },
  pageTitle: {
    fontSize: '42px',
    fontWeight: '800',
    margin: 0,
    color: theme.textMain,
    letterSpacing: '-1px',
    textAlign: 'left',
  },
  pageSubtitle: {
    color: theme.textSecondary,
    fontSize: '18px',
    marginTop: '10px',
    fontWeight: '400',
    textAlign: 'left',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '25px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: theme.bgSurface,
    padding: '25px',
    borderRadius: '20px',
    border: `1px solid ${theme.borderColor}`,
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  statIcon: {
    width: '60px',
    height: '60px',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.goldPrimary,
    fontSize: '24px',
  },
  statInfoLabel: {
    color: theme.textSecondary,
    fontSize: '14px',
    display: 'block',
    marginBottom: '5px',
  },
  statInfoValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: theme.goldPrimary,
  },
  tableContainer: {
    backgroundColor: theme.bgSurface,
    borderRadius: '20px',
    border: `1px solid ${theme.borderColor}`,
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  },
  tableHeader: {
    backgroundColor: theme.bgElevated,
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.borderColor}`,
  },
  searchBox: {
    backgroundColor: theme.bgDeep,
    border: `1px solid ${theme.borderColor}`,
    color: 'white',
    padding: '10px 15px',
    borderRadius: '10px',
    width: '300px',
    outline: 'none',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '18px 20px',
    color: theme.goldPrimary,
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: `1px solid ${theme.borderColor}`,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  td: {
    padding: '16px 20px',
    borderBottom: `1px solid ${theme.borderColor}`,
    color: theme.textMain,
    fontSize: '15px',
  },
  rankBadge: (rank) => {
    let style = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      fontWeight: 'bold',
      marginRight: '10px',
      color: '#000',
    };
    if (rank === 1) style.background = 'linear-gradient(45deg, #FFD700, #B8860B)';
    else if (rank === 2) style.background = 'linear-gradient(45deg, #C0C0C0, #708090)';
    else if (rank === 3) style.background = 'linear-gradient(45deg, #CD7F32, #8B4513)';
    else style.background = theme.borderColor;
    if (rank > 3) style.color = theme.textSecondary;
    return style;
  }
};

// --- Pages ---

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, games: 0, totalScore: 0 });

  useEffect(() => {
    async function loadStats() {
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: gameCount } = await supabase.from('game_rooms').select('*', { count: 'exact', head: true });
      const { data: scores } = await supabase.from('player_answers').select('score');
      const total = scores?.reduce((sum, item) => sum + (item.score || 0), 0) || 0;
      setStats({ users: userCount || 0, games: gameCount || 0, totalScore: total });
    }
    loadStats();
  }, []);

  return (
    <div style={{ padding: '0' }}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Жүйе Статистикасы</h2>
        <p style={styles.pageSubtitle}>Жалпы белсенділік пен көрсеткіштер</p>
      </div>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statInfo}>
            <span style={styles.statInfoLabel}>Пайдаланушылар</span>
            <span style={styles.statInfoValue}>{stats.users}</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎮</div>
          <div style={styles.statInfo}>
            <span style={styles.statInfoLabel}>Ойындар саны</span>
            <span style={styles.statInfoValue}>{stats.games}</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⭐</div>
          <div style={styles.statInfo}>
            <span style={styles.statInfoLabel}>Жалпы ұпай</span>
            <span style={styles.statInfoValue}>{stats.totalScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase.from('profiles').select('display_name, created_at').order('created_at', { ascending: false });
      if (data) setUsers(data);
    }
    fetchUsers();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
  };

  return (
    <div style={{ padding: '0' }}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Тіркелгендер</h2>
        <p style={styles.pageSubtitle}>Барлық қолданушылардың тізімі</p>
      </div>
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <input
            style={styles.searchBox}
            placeholder="Аты-жөнін іздеу..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Аты-жөні</th>
              <th style={styles.th}>Тіркелген күні</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.display_name?.toLowerCase().includes(search.toLowerCase())).map((user, i) => (
              <tr key={i}>
                <td style={styles.td}>{user.display_name || 'Белгісіз'}</td>
                <td style={styles.td}>{formatDate(user.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Ranking = () => {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    async function fetchRankings() {
      const { data: answers } = await supabase.from('player_answers').select('user_id, score');
      const scoreMap = {};
      answers?.forEach(ans => { scoreMap[ans.user_id] = (scoreMap[ans.user_id] || 0) + (ans.score || 0); });
      const { data: profiles } = await supabase.from('profiles').select('id, display_name, created_at');
      if (profiles) {
        const res = profiles.map(p => ({ ...p, total_score: scoreMap[p.id] || 0 }));
        setRankings(res.sort((a, b) => b.total_score - a.total_score));
      }
    }
    fetchRankings();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
  };

  return (
    <div style={{ padding: '0' }}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Жалпы Рейтинг</h2>
        <p style={styles.pageSubtitle}>Ең үздік ойыншылар тізімі (Hall of Fame)</p>
      </div>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Орын</th>
              <th style={styles.th}>Аты-жөні</th>
              <th style={styles.th}>Тіркелген күні</th>
              <th style={styles.th}>Ұпай</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((user, i) => (
              <tr key={user.id}>
                <td style={styles.td}><span style={styles.rankBadge(i + 1)}>{i + 1}</span></td>
                <td style={styles.td}>{user.display_name}</td>
                <td style={styles.td}>{formatDate(user.created_at)}</td>
                <td style={{ ...styles.td, color: theme.goldPrimary, fontWeight: 'bold' }}>{user.total_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function AdminWeb() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div style={styles.adminContainer}>
      <div style={styles.sidebar}>
        <div style={styles.brand}>
          <h1 style={styles.brandTitle}>ADAM ZAT</h1>
          <div style={styles.brandSubtitle}>GAMES ADMIN</div>
        </div>
        <div style={styles.navMenu}>
          {[
            { id: 'dashboard', name: 'Басты бет', icon: '📊' },
            { id: 'users', name: 'Тіркелгендер', icon: '👥' },
            { id: 'ranking', name: 'Рейтинг', icon: '🏆' },
          ].map(item => (
            <div
              key={item.id}
              style={styles.navItem(activePage === item.id)}
              onClick={() => setActivePage(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
        <div style={styles.logoutBtn} onClick={() => alert('Шығу...')}>
          <span>🚪</span>
          <span>Шығу</span>
        </div>
      </div>
      <div style={styles.mainContent}>
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'users' && <UsersList />}
        {activePage === 'ranking' && <Ranking />}
      </div>
    </div>
  );
}
