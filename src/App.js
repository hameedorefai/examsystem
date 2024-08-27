import React from 'react';
import ExamCreator from './ExamCreator';
import Examination from './Examination'; // استيراد Examination

function App() {
  return (
    <div className="App">
      <ExamCreator />
      <Examination /> {/* إضافة Examination إلى التطبيق */}
    </div>
  );
}

export default App;
