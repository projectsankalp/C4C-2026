"use client";

import { useState, useEffect, useRef } from "react";
import { Send, CheckCircle2, Bot, Sparkles } from "lucide-react";

export default function MagicLinkDashboard() {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [agentState, setAgentState] = useState<any>({ step: "idle", message: "Waiting for user input..." });
  
  // NEW: Dedicated state to hold the AI extracted data permanently
  const [formData, setFormData] = useState<any>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3001/api/stream");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Live Agent Update:", data);
      setAgentState(data);
      
      // If the backend sent the full user data, save it so it doesn't disappear!
      if (data.userData) {
        setFormData(data.userData);
      }
    };

    return () => eventSource.close();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setMessages(prev => [...prev, { role: "user", text: chatInput }]);
    const currentInput = chatInput;
    setChatInput("");
    setFormData(null); // Reset form for a new chat

    try {
      await fetch("http://localhost:3001/api/chat-to-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* LEFT SIDE: Chat Interface */}
      <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col shadow-lg z-10">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">LaunchHer Assistant</h1>
          <p className="text-sm text-gray-500 mt-1">Let's get your business registered.</p>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`p-4 rounded-xl max-w-[85%] ${msg.role === "user" ? "bg-black text-white ml-auto" : "bg-gray-100 text-gray-800"}`}>
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Tell me about your business..." 
            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button type="submit" className="bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition">
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* RIGHT SIDE: Live Agent Visualizer */}
      <div className="w-2/3 p-12 flex flex-col justify-center items-center bg-gray-50 relative overflow-hidden">
        
        <div className="absolute top-8 right-8 bg-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border border-gray-200">
          {agentState.step === "idle" || agentState.step === "complete" ? 
            <span className="w-2 h-2 rounded-full bg-green-500"></span> : 
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          }
          <span className="text-sm font-medium text-gray-700 capitalize">Agent Status: {agentState.step.replace('_', ' ')}</span>
        </div>

        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transition-all duration-500">
          
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <Bot size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Live Registration Portal</h2>
              <p className="text-sm text-gray-500 mt-1">{agentState.message}</p>
            </div>
          </div>

          {/* NEW: AI Scheme Recommendation Card */}
          {formData?.recommendedScheme && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                <Sparkles size={18} />
                Scheme Match Found
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{formData.recommendedScheme}</h3>
              <p className="text-sm text-emerald-700 mt-1">{formData.eligibilityReason}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className={`p-4 rounded-lg border ${agentState.field === 'Business Name' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100'} transition-colors`}>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Business Name</label>
              <div className="text-lg font-medium mt-1 min-h-[28px]">
                {formData?.businessName ? <span className="text-gray-800 font-bold">{formData.businessName}</span> : <span className="text-gray-300">Awaiting input...</span>}
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${agentState.field === 'NIC Code' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100'} transition-colors`}>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Udyam NIC Classification Code</label>
              <div className="text-lg font-medium mt-1 min-h-[28px]">
                {formData?.nicCode ? <span className="text-gray-800 font-bold">{formData.nicCode}</span> : <span className="text-gray-300">Awaiting input...</span>}
              </div>
            </div>
          </div>

          {agentState.step === 'complete' && (
            <div className="mt-8 p-4 bg-green-50 rounded-xl flex items-center gap-3 text-green-700 border border-green-100">
              <CheckCircle2 className="text-green-500" />
              <span className="font-medium">Form filled successfully! Awaiting your final confirmation.</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}