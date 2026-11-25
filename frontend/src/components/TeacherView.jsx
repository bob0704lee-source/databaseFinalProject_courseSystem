export default function TeacherView({
  currentUser,
  selectedSemester,
  courses,
  users,
  enrollments,
  onScoreChange,
}) {
  const teacherCourses = courses.filter(
    (c) =>
      c.instructor_id === currentUser.user_id
  );

  return (
    <div>
      <h2>教師視角（授課課程與成績登記）</h2>
      {teacherCourses.length === 0 ? (
        <p>此學期沒有指派給 {currentUser.name} 的課程。</p>
      ) : (
        teacherCourses.map((course) => {
          const courseEnrollments = enrollments.filter(
            (e) => e.course_id === course.id
          );

          return (
            <div
              key={course.id}
              style={{
                border: '1px solid #ccc',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <h3>
                {course.course_code} - {course.course_name}（{course.credits}{' '}
                學分）
              </h3>
              <table
                border="1"
                cellPadding="8"
                style={{ borderCollapse: 'collapse', width: '100%' }}
              >
                <thead>
                  <tr>
                    <th>學號</th>
                    <th>學生姓名</th>
                    <th>選課狀態</th>
                    <th>成績（空白代表未評分）</th>
                  </tr>
                </thead>
                <tbody>
                  {courseEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan="4">目前尚無學生選修此課程</td>
                    </tr>
                  ) : (
                    courseEnrollments.map((enr) => {
                      const student = users.find(
                        (u) => u.user_id === enr.student_id
                      );
                      return (
                        <tr key={enr.id}>
                          <td>{enr.student_id}</td>
                          <td>{student ? student.name : '未知學生'}</td>
                          <td>{enr.enrollment_status}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              placeholder="未評分"
                              value={enr.score ?? ''}
                              onChange={(e) =>
                                onScoreChange(enr.id, e.target.value)
                              }
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}