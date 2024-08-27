import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExamCreator.css'; // استيراد ملف CSS

const ExamCreator = () => {
  const [courses, setCourses] = useState([]);
  const [examData, setExamData] = useState({
    courseID: '', // تعيين القيمة الفارغة بشكل افتراضي
    examType: '', // تعيين القيمة الفارغة بشكل افتراضي
    createdByUserID: 18,
    addQuestionsList: [],
  });
  const [message, setMessage] = useState(''); // لإظهار الرسائل
  const [examDetails, setExamDetails] = useState(null); // لتخزين تفاصيل الامتحان المسترجعة

  useEffect(() => {
    axios.get('https://localhost:7023/api/Course/List')
      .then(response => {
        setCourses(response.data);
      })
      .catch(error => {
        console.error("Error fetching courses:", error);
      });
  }, []);

  const addDefaultOptions = (type) => {
    if (type === 1) {
      return Array.from({ length: 4 }, (_, index) => ({
        optionText: '',
      }));
    } else if (type === 2) {
      return [
        { optionText: 'صح', isCorrect: false },
        { optionText: 'خطأ', isCorrect: false },
      ];
    }
    return [];
  };

  const handleAddQuestion = () => {
    const questionWithDefaults = {
      questionText: '',
      questionTypeID: 0, // Default
      optionsDTO: addDefaultOptions(0),
    };

    setExamData(prevState => ({
      ...prevState,
      addQuestionsList: [...prevState.addQuestionsList, questionWithDefaults],
    }));
  };

  const handleRemoveQuestion = (questionIndex) => {
    const updatedQuestions = examData.addQuestionsList.filter((_, index) => index !== questionIndex);
    setExamData({ ...examData, addQuestionsList: updatedQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, event) => {
    const updatedQuestions = [...examData.addQuestionsList];
    updatedQuestions[questionIndex].optionsDTO[optionIndex].optionText = event.target.value;
    setExamData({ ...examData, addQuestionsList: updatedQuestions });
  };

  const handleIsCorrectChange = (questionIndex, optionIndex) => {
    const updatedQuestions = examData.addQuestionsList.map((question, i) => {
      if (i === questionIndex) {
        return {
          ...question,
          optionsDTO: question.optionsDTO.map((option, j) => ({
            ...option,
            isCorrect: j === optionIndex,
          })),
        };
      }
      return question;
    });
    setExamData({ ...examData, addQuestionsList: updatedQuestions });
  };
  const handleReset = () => {
    setExamData({
      courseID: '',
      examType: '',
      createdByUserID: 18,
      addQuestionsList: [],
    });
    setMessage('');
    setExamDetails(null);
  };

  const handleQuestionTypeChange = (questionIndex, event) => {
    const selectedType = parseInt(event.target.value);
    const updatedQuestions = [...examData.addQuestionsList];
    updatedQuestions[questionIndex].questionTypeID = selectedType;
    updatedQuestions[questionIndex].optionsDTO = addDefaultOptions(selectedType); // تحديث الخيارات بناءً على النوع
    setExamData({ ...examData, addQuestionsList: updatedQuestions });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setMessage(''); // مسح الرسائل السابقة
    setExamDetails(null); // مسح تفاصيل الامتحان السابقة

    if (!examData.courseID) { // استخدام القيمة الفارغة هنا
      alert("Please select a course before submitting the exam.");
      return;
    }
    if (!examData.examType == "Select Exam Type") { // استخدام القيمة الفارغة هنا
      alert("Please select a Exam Type before submitting the exam.");
      return;
    }

    let hasErrors = false;

    for (let i = 0; i < examData.addQuestionsList.length; i++) {
      const question = examData.addQuestionsList[i];
      const hasCorrectAnswer = question.optionsDTO.some(option => option.isCorrect);

      if (!hasCorrectAnswer) {
        alert(`Please select a correct answer for question ${i + 1}.`);
        hasErrors = true;
      }

      if (question.questionTypeID === 0) {
        alert(`Please select a type for question ${i + 1}.`);
        hasErrors = true;
      }
    }

    if (hasErrors) {
      return; // أخرج من الدالة إذا كان هناك أخطاء
    }

    axios.post('https://localhost:7023/api/Exam/Add', examData)
      .then(response => {
        const newExamID = response.data; // تأكد من أن القيمة هنا صحيحة

        console.log("New Exam ID:", newExamID); // يجب أن يطبع 106

        setMessage('Exam created successfully. Fetching exam details...');

        // تحقق من أنه يمكن استخدام newExamID في الطلب الثاني
        console.log("Fetching details for Exam ID:", newExamID);

        return axios.get(`https://localhost:7023/api/Exam/${newExamID}`);
      })
      .then(response => {
        setExamDetails(response.data);
        setMessage('Exam details fetched successfully.');
      })
      .catch(error => {
        setMessage(`An error occurred: ${error.message}`);
        console.error("There was an error:", error);
      });
  };

  return (
    <div className="container">
      <h1>Create a New Exam</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Course:</label>
          <select
            value={examData.courseID}
            onChange={e => setExamData({ ...examData, courseID: e.target.value })}>
            <option value="">Select a course</option> {/* تعيين قيمة فارغة بشكل صحيح */}
            {courses.map(course => (
              <option key={course.courseID} value={course.courseID}>
                {course.courseName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Exam Type:</label>
          <select
            value={examData.examType}
            onChange={e => setExamData({ ...examData, examType: e.target.value })}>
            <option value="">Select Exam Type</option> {/* تعيين قيمة فارغة بشكل صحيح */}
            <option value="MidExam">Mid Exam</option>
            <option value="FinalExam">Final Exam</option>
            <option value="Test">Test</option>
            <option value="Other">Other</option>
            <option value="Placement">Placement</option>
          </select>
        </div>

        <h2>Questions</h2>
        {examData.addQuestionsList.map((question, questionIndex) => (
          <div key={questionIndex} className="question-block">
            <div key={questionIndex} className="question-block">
              <div className="question-type-container">
                <label>Question Type:</label>
                <select
                  onChange={event => handleQuestionTypeChange(questionIndex, event)}>
                  <option value="0">Select question type</option> {/* خيار فارغ */}
                  <option value="1">Multiple Choice</option>
                  <option value="2">True/False</option>
                  <option value="3">Essay</option>
                </select>
              </div>
            </div>

            <textarea
              value={question.questionText}
              onChange={e => {
                const updatedQuestions = [...examData.addQuestionsList];
                updatedQuestions[questionIndex].questionText = e.target.value;
                setExamData({ ...examData, addQuestionsList: updatedQuestions });
              }}
              placeholder="Question text"
              required
              className="question-textarea"
              style={{ resize: 'none', padding: '10px' }} // منع التعديل بالحجم يدوياً
            />
            <ul className="options-list">
              {question.optionsDTO && question.optionsDTO.length > 0 ? (
                question.optionsDTO.map((option, optionIndex) => (
                  <div key={optionIndex} className="option-block">
                    <input
                      type="text"
                      value={option.optionText}
                      onChange={event => handleOptionChange(questionIndex, optionIndex, event)}
                      placeholder="Option text"
                      required
                      className="option-input"
                    />
                    {question.questionTypeID === 1 && (
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`correct-option-${questionIndex}`}
                          checked={option.isCorrect}
                          onChange={() => handleIsCorrectChange(questionIndex, optionIndex)}
                        />
                        Correct
                      </label>
                    )}
                    {question.questionTypeID === 2 && (
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={`correct-option-${questionIndex}`}
                          checked={option.isCorrect}
                          onChange={() => handleIsCorrectChange(questionIndex, optionIndex)}
                        />
                        Correct
                      </label>
                    )}
                  </div>
                ))
              ) : (
                <p>No options available for this question.</p>
              )}
            </ul>
            <button
              type="button"
              className="remove-question-btn"
              onClick={() => handleRemoveQuestion(questionIndex)}
              style={{ backgroundColor: 'red', color: 'white' }} // إضافة الأنماط هنا
            >
              Delete Question
            </button>
          </div>
        ))}

        <button type="button" className="add-question-btn" onClick={handleAddQuestion}>+ Add Question</button>
        <br /><br /><br />
        <button type="submit" className="submit-btn">Create Exam</button>
        <button
          type="button"
          onClick={handleReset}
          className="reset-button"
        >
          Reset
        </button>

      </form>

      {message && <p className="message">{message}</p>}
      {examDetails && (
        <div className="exam-details">
          <h2>Exam Details</h2>
          <ul>
            <li><strong>Exam ID:</strong> {examDetails.examID}</li>
            <li><strong>Course ID:</strong> {examDetails.courseID}</li>
            <li><strong>Exam Type:</strong> {examDetails.examType}</li>
            <li><strong>Created By User ID:</strong> {examDetails.createdByUserID}</li>
            <li>
              <strong>Questions List:</strong>
              <ol> {/* استخدام <ol> للقائمة المرقمة */}
                {examDetails.questionsList.map((question, index) => (
                  <li key={question.questionID}>
                    <h4>Question {index + 1}: {question.questionText}</h4>
                    <strong>Options:</strong>
                    <ol> {/* استخدام <ol> للقائمة المرقمة للخيارات */}
                      {question.optionsDTO.map((option, optionIndex) => (
                        <li key={option.optionID}>
                          {option.optionText}
                        </li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ol>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExamCreator;
