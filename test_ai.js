async function testAISuggestion() {
  try {
    const response = await fetch('http://localhost:5000/api/ai/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dailyCalories: 2000,
        preference: 'healthy'
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAISuggestion();
