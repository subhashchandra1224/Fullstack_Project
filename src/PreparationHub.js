import React, { useState } from "react";

const PREP_DATA = {
  "Google": {
    top_questions: [
      "Explain Big O notation and complexity classes. How does O(1) differ from O(log n)?", 
      "Design a scalable URL shortening service like bit.ly. Walk me through the database schema.", 
      "How would you find the k-th largest element in an infinite data stream?", 
      "What is the fundamental difference between a Process and a Thread? When would you use multithreading?"
    ],
    mock_interview: [
      { q: "What is the difference between a HashMap and a ConcurrentHashMap in Java?", ideal: "A HashMap is non-synchronized and not thread-safe. A ConcurrentHashMap is thread-safe and designed for concurrent environments. It achieves thread safety by dividing the map into segments and locking only the segment being updated, allowing multiple threads to read and write without blocking." },
      { q: "How would you design a distributed cache system like Memcached or Redis?", ideal: "A distributed cache uses consistent hashing to assign keys to servers uniformly, allowing servers to be added or removed with minimal rehashing. Data eviction policies like LRU or LFU are used to manage memory. For high availability, data can be replicated across geographic regions." },
      { q: "Implement a rate limiter for an API. What data structure would you use?", ideal: "I would use a Token Bucket or Sliding Window algorithm. In a distributed environment, Redis is commonly used to store rate limit counters centrally, executing 'check and decrement' operations atomically via Lua scripts to prevent race conditions." }
    ],
    links: ["https://leetcode.com/discuss/interview-question/125906/google-interview-questions", "https://www.geeksforgeeks.org/google-interview-preparation/"]
  },
  "Amazon": {
    top_questions: [
      "Tell me about a time you handled a difficult situation with a coworker. How did you resolve it?", 
      "Design a warehouse inventory management system that can handle Amazon-scale traffic.", 
      "Explain the concept of 'Two-Pizza Teams' and why Amazon prefers microservices architectures.", 
      "How would you implement an LRU Cache? Write down the core data structures you would use."
    ],
    mock_interview: [
      { q: "Tell me about a time you had to dive deep into a technical problem.", ideal: "Using the STAR method (Situation, Task, Action, Result). State the context clearly, exactly what your specific responsibilities were, the specific technical actions you took (like profiling memory usage or reading source code of dependencies), and the positive outcome of your deep dive." },
      { q: "How would you design Amazon's shopping cart system to ensure no data is lost?", ideal: "Shopping carts require high availability and partition tolerance (AP in CAP theorem). I would use a Dynamo-style NoSQL database using eventual consistency. Each cart item update is stored with vector clocks to handle conflicting updates and prevent dropping a user's items." },
      { q: "What happens when you type Amazon.com into your browser?", ideal: "Browser checks DNS cache, then makes a DNS query to route to an IP. A TCP handshake occurs (and SSL/TLS for HTTPS). The request hits AWS Route53, then a Load Balancer, which proxies to the frontend web fleet, aggregating data from hundreds of backing microservices before returning the HTML." }
    ],
    links: ["https://leetcode.com/discuss/interview-question/437082/Amazon-Interview-Questions", "https://www.geeksforgeeks.org/amazon-interview-preparation/"]
  },
  "Microsoft": {
    top_questions: [
      "Write an algorithm to reverse a linked list in groups of size k.", 
      "Walk me through the Operating System boot process from power-on to user login.", 
      "How does garbage collection work in C# / .NET under the hood?", 
      "Design a real-time collaborative editor like Microsoft Word Online. How do you handle concurrent edits?"
    ],
    mock_interview: [
      { q: "Implement a thread-safe Singleton pattern.", ideal: "A thread-safe Singleton can be implemented using double-checked locking with the 'volatile' keyword to prevent instruction reordering, or using a static inner helper class (Bill Pugh Singleton) which is loaded only when needed and implicitly thread-safe. Alternatively, enums can be used." },
      { q: "Explain how Dependency Injection works and why it is useful.", ideal: "Dependency Injection (DI) is a design pattern used to implement Inversion of Control, allowing the creation of dependent objects outside of a class and passing them in. It promotes loose coupling, making code vastly easier to unit test by using mock dependencies." },
      { q: "How would you traverse a binary tree in level-order?", ideal: "Level-order traversal implies Breadth-First Search (BFS). I would utilize a Queue data structure. Starting by pushing the root node, then in a while loop, pop a node, process it, and push its non-null left and right children into the queue until the queue is empty." }
    ],
    links: ["https://leetcode.com/discuss/interview-question/437082/Microsoft-Interview-Questions", "https://www.geeksforgeeks.org/microsoft-interview-preparation/"]
  }
};

export default function PreparationHub() {
  const [selectedCompany, setSelectedCompany] = useState("Google");
  
  // Interactive Interview State
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [interviewHistory, setInterviewHistory] = useState([]); // Array of { q, a, feedback }
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startMockSession = () => {
    setIsInterviewing(true);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setInterviewHistory([]);
  };

  const getSimulatedFeedback = (answer, question) => {
    const len = answer.trim().length;
    if (len < 50) return "⚠️ Feedback: Your answer is quite brief. In a real interview, you should aim to expand on your points, provide examples, and detail any edge cases.";
    if (len > 300) return "✅ Excellent! You provided a detailed and comprehensive answer. You properly addressed the core concepts of the question.";
    return "💡 Good start. Your answer touches on the main points, but you could secure a better score by providing a specific real-world example of how you'd implement this.";
  };

  const submitAnswer = () => {
    if (!userAnswer.trim()) return;
    setIsAnalyzing(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const currentQ = PREP_DATA[selectedCompany].mock_interview[currentQuestionIndex];
      const feedback = getSimulatedFeedback(userAnswer, currentQ.q);
      
      setInterviewHistory(prev => [...prev, { q: currentQ.q, a: userAnswer, feedback, ideal: currentQ.ideal }]);
      setUserAnswer("");
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnalyzing(false);
    }, 1200);
  };

  if (isInterviewing) {
    const questions = PREP_DATA[selectedCompany].mock_interview;
    const isFinished = currentQuestionIndex >= questions.length;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }} className="fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>AI Mock Interview Session</h2>
            <p style={{ color: "var(--accent-blue)", fontWeight: "600" }}>Simulating: {selectedCompany} Technical Screen</p>
          </div>
          <button onClick={() => setIsInterviewing(false)} className="glass-card hover-glow" style={{ padding: "8px 16px", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            End Session Early
          </button>
        </div>

        {isFinished ? (
          <div className="glass-card fade-in" style={{ padding: "40px", border: "1px solid var(--accent-emerald)" }}>
            <h3 style={{ fontSize: "1.5rem", color: "var(--accent-emerald)", marginBottom: "16px" }}>Session Complete! 🎉</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>Here is your performance summary for the {selectedCompany} mock interview.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {interviewHistory.map((item, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", borderLeft: "4px solid var(--accent-blue)" }}>
                  <p style={{ fontWeight: "600", marginBottom: "12px" }}>Q{i+1}: {item.q}</p>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "16px", padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>Your Answer: {item.a}</p>
                  <p style={{ fontSize: "0.85rem", color: item.feedback.includes("⚠️") ? "var(--accent-amber)" : "var(--accent-emerald)", fontWeight: "600" }}>
                    {item.feedback}
                  </p>
                  <div style={{ marginTop: "16px", padding: "16px", background: "rgba(16, 185, 129, 0.1)", borderLeft: "4px solid var(--accent-emerald)", borderRadius: "0 8px 8px 0" }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--accent-emerald)", marginBottom: "6px" }}>🎯 Ideal Solution Framework:</p>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>{item.ideal}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button onClick={() => setIsInterviewing(false)} className="neon-button" style={{ marginTop: "32px", padding: "12px 24px" }}>Return to Prep Hub</button>
          </div>
        ) : (
          <div className="glass-card fade-in" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <div style={{ display: "flex", gap: "4px" }}>
                {questions.map((_, i) => (
                  <div key={i} style={{ width: "24px", height: "4px", borderRadius: "2px", background: i < currentQuestionIndex ? "var(--accent-emerald)" : i === currentQuestionIndex ? "var(--accent-blue)" : "var(--border-color)" }} />
                ))}
              </div>
            </div>
            
            <h3 style={{ fontSize: "1.3rem", lineHeight: "1.5" }}>{questions[currentQuestionIndex].q}</h3>
            
            <textarea 
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="Type your answer here as if you were speaking to the interviewer..."
              rows="6"
              style={{ width: "100%", padding: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", borderRadius: "12px", color: "#fff", outline: "none", resize: "none", fontSize: "0.95rem", lineHeight: "1.5" }}
            />
            
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button 
                onClick={submitAnswer} 
                disabled={isAnalyzing || !userAnswer.trim()}
                className="neon-button" 
                style={{ padding: "12px 28px", opacity: (!userAnswer.trim() || isAnalyzing) ? 0.5 : 1 }}
              >
                {isAnalyzing ? "AI Analyzing..." : "Submit Answer"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Interview Preparation Hub</h2>
        <p style={{ color: "var(--text-muted)" }}>Role-specific technical and behavioral resources to help you ace your next interview.</p>
      </div>

      <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "10px" }}>
        {Object.keys(PREP_DATA).map(company => (
          <button 
            key={company}
            onClick={() => setSelectedCompany(company)}
            className="glass-card"
            style={{ 
              padding: "12px 24px", 
              whiteSpace: "nowrap", 
              border: selectedCompany === company ? "1px solid var(--accent-blue)" : "1px solid var(--border-color)",
              color: selectedCompany === company ? "var(--accent-blue)" : "#fff",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            {company}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Questions Section */}
        <div className="glass-card fade-in" style={{ padding: "32px" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "20px", color: "var(--accent-emerald)" }}>Top-Asked Questions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {PREP_DATA[selectedCompany].top_questions.map((q, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <span style={{ fontWeight: "700", opacity: "0.5" }}>{i + 1}</span>
                <p style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>{q}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Resources Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="glass-card fade-in" style={{ padding: "32px", borderLeft: "4px solid var(--accent-blue)" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Preparation Roadmaps</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {PREP_DATA[selectedCompany].links.map((link, i) => (
                <a key={i} href={link} target="_blank" rel="noreferrer" style={{ fontSize: "0.9rem", color: "var(--accent-blue)", textDecoration: "none", display: "flex", gap: "8px", alignItems: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  {link.includes('leetcode') ? 'LeetCode Discussion' : 'GeeksForGeeks Archive'}
                </a>
              ))}
            </div>
          </div>

          <div className="glass-card fade-in" style={{ padding: "32px", background: "linear-gradient(rgba(139, 92, 246, 0.1), rgba(0,0,0,0))" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>AI Mock Interview</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>Practice with our AI interviewer specializing in {selectedCompany}'s tech stack.</p>
            <button onClick={startMockSession} className="neon-button" style={{ width: "100%", padding: "12px" }}>Start Mock Session</button>
          </div>
        </div>
      </div>

    </div>
  );
}
