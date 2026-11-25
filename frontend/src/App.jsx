import { useState } from 'react';
import Login from './components/Login';
import StudentView from './components/StudentView';
import TeacherView from './components/TeacherView';
import AgentChatPanel from './components/AgentChatPanel';
import {
  MOCK_USERS,
  MOCK_COURSES,
  MOCK_COURSE_SCHEDULES,
  MOCK_ENROLLMENTS,
} from './mockData';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('course_system_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [enrollments, setEnrollments] = useState(MOCK_ENROLLMENTS);

  if (!currentUser) {
    return (
      <Login
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem(
            'course_system_current_user',
            JSON.stringify(user)
          );
        }}
      />
    );
  }

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('course_system_current_user');
  };

  // 加選處理：回傳 { ok: boolean, message: string }
  const handleEnrollCourse = (courseId) => {
  const targetCourse = MOCK_COURSES.find(
    (c) => String(c.id) === String(courseId)
  );
  if (!targetCourse) {
    return { ok: false, message: '加選失敗：找不到該門課程。' };
  }

  const studentId = String(currentUser.user_id).trim();
  const targetCourseId = targetCourse.id;

  const existing = enrollments.find(
    (e) =>
      String(e.student_id).trim() === studentId &&
      String(e.course_id) === String(targetCourseId)
  );

  if (existing && existing.enrollment_status === 'enrolled') {
    return {
      ok: false,
      message: `加選失敗：${targetCourse.course_name} 已加選。`,
    };
  }

  const currentCredits = enrollments
    .filter(
      (e) =>
        String(e.student_id).trim() === studentId &&
        e.enrollment_status === 'enrolled'
    )
    .reduce((sum, e) => {
      const c = MOCK_COURSES.find((item) => String(item.id) === String(e.course_id));
      return sum + Number(c?.credits || 0);
    }, 0);

  const maxCredits = Number(currentUser.max_credits ?? 18);
  const courseCredits = Number(targetCourse.credits || 0);

  if (currentCredits + courseCredits > maxCredits) {
    return {
      ok: false,
      message: `加選失敗：已選 ${currentCredits} 學分，加上 ${courseCredits} 學分將超過上限 ${maxCredits} 學分。`,
    };
  }

  const enrolledCount = enrollments.filter(
    (e) =>
      String(e.course_id) === String(targetCourseId) &&
      e.enrollment_status === 'enrolled'
  ).length;

  if (
    targetCourse.enrollment_cap != null &&
    enrolledCount >= Number(targetCourse.enrollment_cap)
  ) {
    return {
      ok: false,
      message: `加選失敗：${targetCourse.course_name} 名額已滿。`,
    };
  }

  if (existing) {
    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === existing.id
          ? { ...e, enrollment_status: 'enrolled', score: null }
          : e
      )
    );
  } else {
    setEnrollments((prev) => [
      ...prev,
      {
        id: Date.now(),
        student_id: studentId,
        course_id: targetCourseId,
        enrollment_status: 'enrolled',
        score: null,
      },
    ]);
  }

  return {
    ok: true,
    message: `加選成功：已加入「${targetCourse.course_name}」。`,
  };
};

  // 退選處理：回傳 { ok: boolean, message: string }
  const handleDropCourse = (courseId) => {
    const targetCourse = MOCK_COURSES.find((c) => c.id === courseId);
    const existing = enrollments.find(
      (e) =>
        e.student_id === currentUser.user_id &&
        e.course_id === courseId &&
        e.enrollment_status === 'enrolled'
    );

    if (!existing) {
      return {
        ok: false,
        message: `退選失敗：尚未選修「${targetCourse?.course_name || '此課程'}」。`,
      };
    }

    setEnrollments((prev) =>
      prev.filter(
        (e) =>
          !(
            e.student_id === currentUser.user_id && e.course_id === courseId
          )
      )
    );

    return {
      ok: true,
      message: `退選成功：已移除「${targetCourse?.course_name || '此課程'}」。`,
    };
  };

  const handleScoreChange = (enrollmentId, value) => {
    const numericScore = value === '' ? null : Number(value);
    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === enrollmentId ? { ...e, score: numericScore } : e
      )
    );
  };

  return (
    <div
      style={{
        maxWidth: '1140px',
        margin: '0 auto',
        padding: '24px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* 頂部標題與登入資訊 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 6px 0' }}>XX大學選課系統</h1>
          <div style={{ fontSize: '14px', color: '#f7f7f7' }}>
            <strong>目前登入：</strong>
            {currentUser.name}（{currentUser.user_id}｜
            {currentUser.role === 'student' ? '學生' : '教師'}／
            {currentUser.department}）
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{ padding: '6px 14px', cursor: 'pointer' }}
        >
          登出
        </button>
      </div>

      {/* 主內容區 */}
      {currentUser.role === 'student' ? (
        <StudentView
          currentUser={currentUser}
          courses={MOCK_COURSES}
          schedules={MOCK_COURSE_SCHEDULES}
          enrollments={enrollments}
          onEnrollCourse={handleEnrollCourse}
          onDropCourse={handleDropCourse}
        />
      ) : (
        <TeacherView
          currentUser={currentUser}
          courses={MOCK_COURSES}
          users={MOCK_USERS}
          enrollments={enrollments}
          onScoreChange={handleScoreChange}
        />
      )}

      <AgentChatPanel />
    </div>
  );
}