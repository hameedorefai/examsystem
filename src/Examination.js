import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Examination.css'; // استيراد ملف CSS إذا كان لديك تنسيق مخصص

const Examination = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch exams from API
    axios.get('https://examinationsystem-dfaxfka2hqhwgncc.westeurope-01.azurewebsites.net/api/Exam/Info?CourseID=1') // قم بتعديل الرابط حسب الحاجة
      .then(response => {
        setExams(response.data);
      })
      .catch(error => {
        console.error("Error fetching exams:", error);
        setMessage('Error fetching exams.'); // تعيين رسالة الخطأ
      });
  }, []);

  const handleExamClick = (examID) => {
    // Fetch exam details when an exam is clicked
    axios.get(`https://examinationsystem-dfaxfka2hqhwgncc.westeurope-01.azurewebsites.net/api/Exam/${examID}`)
      .then(response => {
        setSelectedExam(response.data);
      })
      .catch(error => {
        console.error("Error fetching exam details:", error);
        setMessage('Error fetching exam details.'); // تعيين رسالة الخطأ
      });
  };

  return (
    <div className="examination-container">
      <h1>Examination List</h1>
      {message && <p className="error-message">{message}</p>}
      <table className="examination-table">
        <thead>
          <tr>
            <th>Exam ID</th>
            <th>Course ID</th>
            <th>Exam Type</th>
            <th>Created By</th>
          </tr>
        </thead>
        <tbody>
          {exams.length > 0 ? (
            exams.map(exam => (
              <tr key={exam.examID} onClick={() => handleExamClick(exam.examID)} style={{ cursor: 'pointer' }}>
                <td>{exam.examID}</td>
                <td>{exam.courseID}</td>
                <td>{exam.examType}</td>
                <td>{exam.createdByUserID}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No exams available.</td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedExam && (
        <div className="exam-details">
          <h2>Exam Details</h2>
          <pre>{JSON.stringify(selectedExam, null, 2)}</pre>
          <h3>Questions</h3>
          {selectedExam.questionsList.map(question => (
            <div key={question.questionID} className="question">
              <p><strong>Question:</strong> {question.questionText}</p>
              <div className="options">
                {question.optionsDTO.map(option => (
                  <div key={option.optionID}>
                    <label>
                      <input
                        type="radio"
                        name={`question-${question.questionID}`}
                        value={option.optionID}
                      />
                      {option.optionText}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Examination;
