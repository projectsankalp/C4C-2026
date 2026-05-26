import React, { useState } from 'react';
import type { CircleType } from './CommunityHub';

interface Post {
  id: number;
  text: string;
  time: string;
}

const circleDetails = {
  student: { title: '🎓 Student Circle', prompt: 'What is one thing you learned today outside of textbooks?' },
  professional: { title: '💼 Working Professionals', prompt: 'What small win did you have at work this week?' },
  homemaker: { title: '🏠 Homemakers & Parents', prompt: 'What is a moment that brought you joy today?' },
  wellness: { title: '🌍 Open Wellness', prompt: 'What is one thing you are grateful for today?' }
};

const CircleFeed: React.FC<{ circleType: CircleType, goBack: () => void }> = ({ circleType, goBack }) => {
  const details = circleType ? circleDetails[circleType] : circleDetails.wellness;
  
  const [posts, setPosts] = useState<Post[]>([
    { id: 1, text: "Taking things one step at a time today. Remembering to breathe.", time: "2h ago" },
    { id: 2, text: "Just wanted to share some positive energy with everyone here!", time: "5h ago" }
  ]);
  const [newPost, setNewPost] = useState('');
  
  // Mood pulse state
  const [moods, setMoods] = useState({ Calm: 42, Motivated: 28, Tired: 15, Happy: 35 });
  const [voted, setVoted] = useState(false);

  const handlePost = () => {
    if (!newPost.trim()) return;
    setPosts([{ id: Date.now(), text: newPost, time: "Just now" }, ...posts]);
    setNewPost('');
  };

  const handleMoodVote = (mood: keyof typeof moods) => {
    if (voted) return;
    setMoods(prev => ({ ...prev, [mood]: prev[mood] + 1 }));
    setVoted(true);
  };

  const totalMoods = Object.values(moods).reduce((a, b) => a + b, 0);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button className="btn btn-secondary" style={{ marginBottom: '2rem' }} onClick={goBack}>← Back to Circles</button>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>{details.title}</h2>
        <span style={{ background: 'rgba(74, 60, 49, 0.05)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>
          👁️ Anonymous & Safe
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Left Column: Feed */}
        <div>
          {/* Daily Prompt */}
          <div className="glass-panel" style={{ marginBottom: '2rem', background: 'linear-gradient(to right, rgba(192, 130, 75, 0.15), transparent)' }}>
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>✨ Daily Positivity Prompt</h4>
            <p style={{ margin: 0, fontStyle: 'italic' }}>"{details.prompt}"</p>
          </div>

          {/* New Post */}
          <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <textarea 
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts safely and anonymously..."
              style={{ width: '100%', height: '100px', background: 'rgba(74, 60, 49, 0.03)', border: '1px solid rgba(74, 60, 49, 0.1)', color: 'var(--text-primary)', borderRadius: '8px', padding: '1rem', resize: 'none', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handlePost}>Post Anonymously</button>
            </div>
          </div>

          {/* Posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {posts.map(post => (
              <div key={post.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    👤
                  </div>
                  <div>
                    <strong style={{ display: 'block' }}>Anonymous</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{post.time}</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '1rem' }}>{post.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div>
          {/* Mood Pulse */}
          <div className="glass-panel" style={{ position: 'sticky', top: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>🌈 Mood Pulse</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>How is the community feeling today?</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(moods).map(([mood, count]) => {
                const percentage = Math.round((count / totalMoods) * 100) || 0;
                return (
                  <div key={mood} onClick={() => handleMoodVote(mood as any)} style={{ cursor: voted ? 'default' : 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      <span>{mood}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(74, 60, 49, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {!voted && <p style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>Click a mood to check in!</p>}
            {voted && <p style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '1.5rem', color: 'var(--accent-secondary)' }}>Thanks for checking in!</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleFeed;
