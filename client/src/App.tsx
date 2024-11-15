import React, {useEffect, useState} from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/hello')
      .then(response => response.json())
      .then(data => {
        setMessage(data.message); 
      })
      .catch(error => {
        console.error('Error fetching data from backend:', error);
      });
  }, []);

  return (
    <div>
      <h1>Message from Backend:</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;