import { useEffect, useRef, useState } from 'react';
import { DEPARTMENTS } from '../constants/departments';

const MENU_ITEMS = [
  { key: 'enroll', label: '選課' },
  { key: 'enrolled', label: '查看已選課程' },
  { key: 'schedule', label: '查看課表' },
  { key: 'grades', label: '查看成績' },
];

export default function StudentView({
  currentUser,
  courses,
  schedules,
  enrollments,
  onEnrollCourse,
  onDropCourse,
}) {
  // 預設進入「選課」介面
  const [activeTab, setActiveTab] = useState('enroll');

  // 課程查詢狀態：預設尚未查詢，顯示無資料
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterCourseName, setFilterCourseName] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // 上方提示窗狀態：{ type: 'success' | 'error', message: string } | null
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (type, message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const getSchedulesByCourse = (courseId) =>
    schedules.filter((s) => s.course_id === courseId);

  // 目前已選（enrolled）課程
  const enrolledRecords = enrollments.filter(
    (e) =>
      e.student_id === currentUser.user_id &&
      e.enrollment_status === 'enrolled'
  );

  const enrolledCoursesWithInfo = enrolledRecords
    .map((enr) => {
      const course = courses.find((c) => c.id === enr.course_id);
      return course ? { ...enr, course } : null;
    })
    .filter(Boolean);

  const totalCredits = enrolledCoursesWithInfo.reduce(
    (sum, item) => sum + (item.course.credits || 0),
    0
  );

  // 所有選課紀錄（含選修情況與成績）
  const allStudentEnrollments = enrollments
    .filter((e) => e.student_id === currentUser.user_id)
    .map((enr) => {
      const course = courses.find((c) => c.id === enr.course_id);
      return course ? { ...enr, course } : null;
    })
    .filter(Boolean);

  const handleSearchCourses = (e) => {
    e.preventDefault();
    const keyword = filterCourseName.trim().toLowerCase();

    const filtered = courses.filter((course) => {
      const matchDept =
        !filterDepartment ||
        course.department === filterDepartment ||
        course.offering_department === filterDepartment;
      const matchName =
        !keyword || course.course_name?.toLowerCase().includes(keyword);

      return matchDept && matchName;
    });

    setSearchResults(filtered);
    setHasSearched(true);
  };

  const handleResetSearch = () => {
    setFilterDepartment('');
    setFilterCourseName('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleEnrollClick = (courseId) => {
    const result = onEnrollCourse(courseId);
    showToast(result.ok ? 'success' : 'error', result.message);
  };

  const handleDropClick = (courseId) => {
    const result = onDropCourse(courseId);
    showToast(result.ok ? 'success' : 'error', result.message);
  };

  const formatStatusText = (status) => {
    if (status === 'enrolled') return '已選修';
    if (status === 'completed') return '已修畢';
    if (status === 'dropped') return '已退選';
    return status;
  };

  return (
    <div>
      {/* 畫面上方彈出提示窗（3 秒後自動消失） */}
      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            padding: '12px 24px',
            borderRadius: '6px',
            color: '#fff',
            fontWeight: 'bold',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
            backgroundColor:
              toast.type === 'success' ? '#1e8e3e' : '#d93025',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* 左側選單 + 右側內容 */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start',
        }}
      >
        {/* 左側選單 */}
        <aside
          style={{
            width: '190px',
            flexShrink: 0,
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '10px',
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                style={{
                  textAlign: 'left',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: isActive
                    ? '1px solid #1a73e8'
                    : '1px solid transparent',
                  backgroundColor: isActive ? '#1a73e8' : 'transparent',
                  color: isActive ? '#fff' : '#222',
                  fontWeight: isActive ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: '15px',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </aside>

        {/* 右側分頁內容 */}
        <section style={{ flex: 1, minWidth: 0 }}>
          {/* 1. 選課 */}
          {activeTab === 'enroll' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <h2 style={{ margin: 0 }}>選課</h2>
                <div>
                  <strong>已選學分：</strong>
                  {totalCredits} / {currentUser.max_credits ?? 18} 學分
                </div>
              </div>

              <form
                onSubmit={handleSearchCourses}
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
              >
                <div>
                  <label htmlFor="dept-select" style={{ marginRight: '6px' }}>
                    開課系所：
                  </label>
                  <select
                    id="dept-select"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    style={{ padding: '6px 10px' }}
                  >
                    <option value="">全部系所</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="course-name-input"
                    style={{ marginRight: '6px' }}
                  >
                    課程名稱：
                  </label>
                  <input
                    id="course-name-input"
                    type="text"
                    value={filterCourseName}
                    onChange={(e) => setFilterCourseName(e.target.value)}
                    placeholder="請輸入課程名稱"
                    style={{ padding: '6px 10px' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{ padding: '6px 14px', cursor: 'pointer' }}
                >
                  查詢
                </button>
                <button
                  type="button"
                  onClick={handleResetSearch}
                  style={{ padding: '6px 10px', cursor: 'pointer' }}
                >
                  清除
                </button>
              </form>

              {!hasSearched ? (
                <p style={{ color: '#666', padding: '12px 0' }}>
                  無資料（請選擇開課系所或輸入課程名稱後點擊「查詢」）
                </p>
              ) : searchResults.length === 0 ? (
                <p style={{ color: '#666', padding: '12px 0' }}>
                  查無符合條件的課程。
                </p>
              ) : (
                searchResults.map((course) => {
                  const isEnrolled = enrollments.some(
                    (e) =>
                      e.student_id === currentUser.user_id &&
                      e.course_id === course.id &&
                      e.enrollment_status === 'enrolled'
                  );
                  const courseSchedules = getSchedulesByCourse(course.id)
                    .map((s) => `${s.day_period} (${s.classroom})`)
                    .join(', ');
                  const deptName =
                    course.department ||
                    course.offering_department ||
                    '未標示系所';

                  return (
                    <div
                      key={course.id}
                      style={{
                        border: '1px solid #ccc',
                        padding: '12px',
                        marginBottom: '10px',
                        borderRadius: '6px',
                      }}
                    >
                      <div>
                        <strong>
                          {course.course_code} - {course.course_name}
                        </strong>
                        （{deptName}｜{course.credits} 學分｜上限{' '}
                        {course.enrollment_cap} 人）
                      </div>
                      <div>時段／教室：{courseSchedules || '未排定'}</div>
                      <button
                        type="button"
                        onClick={() => handleEnrollClick(course.id)}
                        style={{
                          marginTop: '8px',
                          padding: '6px 14px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          border: isEnrolled
                            ? '1px solid #1e8e3e'
                            : '1px solid #1a73e8',
                          backgroundColor: isEnrolled ? '#e6f4ea' : '#1a73e8',
                          color: isEnrolled ? '#137333' : '#fff',
                        }}
                      >
                        {isEnrolled ? '已加選' : '加選'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 2. 查看已選課程 */}
          {activeTab === 'enrolled' && (
            <div>
              <h2 style={{ marginTop: 0 }}>查看已選課程</h2>
              <p>
                <strong>目前已選學分：</strong>
                {totalCredits} / {currentUser.max_credits ?? 18} 學分
              </p>

              {enrolledCoursesWithInfo.length === 0 ? (
                <p style={{ color: '#666' }}>目前尚無已選課程。</p>
              ) : (
                enrolledCoursesWithInfo.map(({ id, course }) => {
                  const courseSchedules = getSchedulesByCourse(course.id)
                    .map((s) => `${s.day_period} (${s.classroom})`)
                    .join(', ');
                  const deptName =
                    course.department ||
                    course.offering_department ||
                    '未標示系所';

                  return (
                    <div
                      key={id}
                      style={{
                        border: '1px solid #ccc',
                        padding: '12px',
                        marginBottom: '10px',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <div>
                          <strong>
                            {course.course_code} - {course.course_name}
                          </strong>
                          （{deptName}｜{course.credits} 學分）
                        </div>
                        <div>時段／教室：{courseSchedules || '未排定'}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDropClick(course.id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '4px',
                          border: '1px solid #d93025',
                          backgroundColor: '#fce8e6',
                          color: '#d93025',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        退選
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 3. 查看課表 */}
          {activeTab === 'schedule' && (
            <div>
              <h2 style={{ marginTop: 0 }}>查看課表</h2>
              <p style={{ color: '#666' }}>（待定）</p>
            </div>
          )}

          {/* 4. 查看成績 */}
          {activeTab === 'grades' && (
            <div>
              <h2 style={{ marginTop: 0 }}>查看成績</h2>
              <table
                border="1"
                cellPadding="8"
                style={{
                  borderCollapse: 'collapse',
                  width: '100%',
                }}
              >
                <thead>
                  <tr>
                    <th>課程代碼</th>
                    <th>課程名稱</th>
                    <th>學分</th>
                    <th>選修情況</th>
                    <th>成績</th>
                  </tr>
                </thead>
                <tbody>
                  {allStudentEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan="5">尚無選課紀錄</td>
                    </tr>
                  ) : (
                    allStudentEnrollments.map((item) => (
                      <tr key={item.id}>
                        <td>{item.course.course_code}</td>
                        <td>{item.course.course_name}</td>
                        <td>{item.course.credits}</td>
                        <td>{formatStatusText(item.enrollment_status)}</td>
                        <td>{item.score === null ? '未評分' : item.score}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}