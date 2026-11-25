import { useState } from 'react';
import { MOCK_USERS } from '../mockData';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'student' | 'teacher'

  const filteredUsers = MOCK_USERS.filter((u) => {
    if (roleFilter === 'all') return true;
    return u.role === roleFilter;
  });

  const handleSelectAccount = (user) => {
    setEmail(user.email ?? '');
    setPassword(user.user_id ?? '');
    setErrorMessage('');
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setErrorMessage('帳號輸入錯誤');
      return;
    }

    // 測試階段允許多筆相同信箱對應不同年級／身分帳號，先找出所有符合信箱的帳號
    const usersWithEmail = MOCK_USERS.filter(
      (u) => u.email?.toLowerCase() === trimmedEmail.toLowerCase()
    );

    if (usersWithEmail.length === 0) {
      setErrorMessage('帳號輸入錯誤');
      return;
    }

    if (!trimmedPassword) {
      setErrorMessage('密碼輸入錯誤');
      return;
    }

    // 比對密碼（學號或教師編號 user_id）
    const matchedUser = usersWithEmail.find(
      (u) => u.user_id === trimmedPassword
    );

    if (!matchedUser) {
      setErrorMessage('密碼輸入錯誤');
      return;
    }

    onLoginSuccess(matchedUser);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h1 style={styles.title}>XX大學選課系統</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label htmlFor="email" style={styles.label}>
              帳號
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="請輸入信箱"
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="password" style={styles.label}>
              密碼
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入id(學號或教師編號)"
              style={styles.input}
            />
          </div>

          {errorMessage && (
            <div style={styles.errorText} role="alert">
              {errorMessage}
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.primaryButton}>
              登入
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              style={styles.secondaryButton}
            >
              檢視可使用帳號
            </button>
          </div>
        </form>
      </div>

      {/* 檢視可使用帳號：帳號列表彈出視窗 */}
      {isModalOpen && (
        <div
          style={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>可使用帳號列表</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>

            {/* 身分篩選按鈕 */}
            <div style={styles.filterBar}>
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                style={{
                  ...styles.filterBtn,
                  ...(roleFilter === 'all' ? styles.filterBtnActive : {}),
                }}
              >
                全部 ({MOCK_USERS.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('student')}
                style={{
                  ...styles.filterBtn,
                  ...(roleFilter === 'student' ? styles.filterBtnActive : {}),
                }}
              >
                學生 ({MOCK_USERS.filter((u) => u.role === 'student').length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('teacher')}
                style={{
                  ...styles.filterBtn,
                  ...(roleFilter === 'teacher' ? styles.filterBtnActive : {}),
                }}
              >
                教師 ({MOCK_USERS.filter((u) => u.role === 'teacher').length})
              </button>
            </div>

            {/* 帳號列表 */}
            <div style={styles.modalBody}>
              {filteredUsers.length === 0 ? (
                <p style={{ color: '#666' }}>目前沒有符合的測試帳號。</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>姓名</th>
                      <th style={styles.th}>身分</th>
                      <th style={styles.th}>帳號（信箱）</th>
                      <th style={styles.th}>密碼（ID）</th>
                      <th style={styles.th}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id}>
                        <td style={styles.td}>{user.name}</td>
                        <td style={styles.td}>
                          {user.role === 'student' ? '學生' : '教師'}
                        </td>
                        <td style={styles.td}>{user.email || '（未設定信箱）'}</td>
                        <td style={styles.td}>{user.user_id}</td>
                        <td style={styles.td}>
                          <button
                            type="button"
                            onClick={() => handleSelectAccount(user)}
                            style={styles.fillButton}
                          >
                            填入
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7fa',
    fontFamily: 'sans-serif',
    padding: '16px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  title: {
    textAlign: 'center',
    fontSize: '24px',
    marginTop: 0,
    marginBottom: '24px',
    color: '#222',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    padding: '10px 12px',
    fontSize: '15px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    outline: 'none',
  },
  errorText: {
    color: '#d93025',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '8px',
  },
  primaryButton: {
    padding: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#1a73e8',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '10px',
    fontSize: '14px',
    color: '#1a73e8',
    backgroundColor: '#fff',
    border: '1px solid #1a73e8',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '680px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    paddingBottom: '12px',
    marginBottom: '12px',
  },
  closeButton: {
    border: 'none',
    background: 'transparent',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#666',
  },
  filterBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  filterBtn: {
    padding: '6px 12px',
    fontSize: '13px',
    color: '#0c1520', 
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  filterBtnActive: {
    backgroundColor: '#e8f0fe', 
    borderColor: '#1a73e8',
  },
  modalBody: {
    overflowY: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    textAlign: 'left',
    padding: '8px',
    borderBottom: '2px solid #ddd',
    backgroundColor: '#f8f9fa',
    position: 'sticky',
    top: 0,
  },
  td: {
    padding: '8px',
    borderBottom: '1px solid #eee',
  },
  fillButton: {
    padding: '4px 10px',
    fontSize: '12px',
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    border: '1px solid #1a73e8',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};