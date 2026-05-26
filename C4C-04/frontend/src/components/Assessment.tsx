import React, { useState } from 'react';

const questions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating"
];

const Assessment: React.FC = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);

  const answer = (score: number) => {
    const newScores = [...scores, score];
    if (currentQ < questions.length - 1) {
      setScores(newScores);
      setCurrentQ(currentQ + 1);
    } else {
      setScores(newScores);
      setCompleted(true);
    }
  };

  if (completed) {
    const totalScore = scores.reduce((a, b) => a + b, 0);
    return (
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2>Assessment Complete</h2>
        <p>Your emotional wellness score: {totalScore}</p>
        {totalScore > 8 ? (
          <p style={{ color: 'var(--accent-secondary)', fontWeight: 500 }}>It looks like you might be experiencing some distress. We recommend speaking with one of our professional partners or using the chat support.</p>
        ) : (
          <p style={{ color: '#7b9c7b', fontWeight: 500 }}>You seem to be managing well, but remember it's always okay to ask for support if things get tough.</p>
        )}
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => window.location.reload()}>Return Home</button>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>Emotional Wellness Check-in</h3>
      <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Over the last 2 weeks, how often have you been bothered by:</p>
      <h4 style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>{questions[currentQ]}</h4>
      
      <div style={{ display: 'grid', gap: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => answer(0)}>Not at all</button>
        <button className="btn btn-secondary" onClick={() => answer(1)}>Several days</button>
        <button className="btn btn-secondary" onClick={() => answer(2)}>More than half the days</button>
        <button className="btn btn-secondary" onClick={() => answer(3)}>Nearly every day</button>
      </div>
      
      <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Question {currentQ + 1} of {questions.length}
      </div>
    </div>
  );
};

export default Assessment;
