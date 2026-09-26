import { useState } from "react";
import { Play, Terminal, Bot, Send, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Sandbox() {
  const [code, setCode] = useState('def reverse_string(s):\n    # Write your code here\n    pass\n\nprint(reverse_string("hello"))');
  const [output, setOutput] = useState("");
  const [isError, setIsError] = useState(false);
  const [chat, setChat] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Hi! I'm your AI Tutor. It looks like you're practicing string manipulation. Let me know if you need any hints!" }
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleRunCode = () => {
    // Simulate compilation/execution
    setOutput("Running...\n");
    setTimeout(() => {
      if (code.includes('pass')) {
        setIsError(true);
        setOutput("Output:\nNone\n\nError Flag:\nFunction returned None instead of 'olleh'. Did you forget to return the reversed string?");
      } else if (code.includes('::-1')) {
        setIsError(false);
        setOutput("Output:\nolleh\n\nSuccess! All test cases passed.");
      } else {
        setIsError(true);
        setOutput("Output:\nSyntaxError: unexpected EOF while parsing");
      }
    }, 600);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    setChat(prev => [...prev, { role: 'user', text: chatInput }]);
    
    setTimeout(() => {
      setChat(prev => [...prev, { role: 'ai', text: "In Python, a quick way to reverse a string is using slicing `[::-1]`. Give that a try inside your function!" }]);
    }, 1000);
    
    setChatInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Code Sandbox</h1>
        <p className="text-gray-400 text-sm">Practice in multiple languages with AI assistance.</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Compiler / Terminal Column */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Editor */}
          <div className="flex-1 bg-[#16181d] rounded-xl border border-[#272b35] flex flex-col overflow-hidden shadow-sm">
            <div className="h-10 border-b border-[#272b35] bg-[#1e2128] flex items-center justify-between px-4">
              <select className="bg-transparent text-sm font-medium text-gray-300 focus:outline-none">
                <option>Python</option>
                <option>JavaScript</option>
                <option>C++</option>
              </select>
              <button 
                onClick={handleRunCode}
                className="flex items-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              >
                <Play className="w-3 h-3 fill-current" /> Run Code
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full bg-transparent p-4 text-sm font-mono text-gray-300 focus:outline-none resize-none leading-relaxed"
              spellCheck="false"
            />
          </div>

          {/* Terminal Output */}
          <div className="h-48 bg-[#0a0a0f] rounded-xl border border-[#272b35] flex flex-col overflow-hidden">
            <div className="h-8 border-b border-[#272b35] bg-[#16181d] flex items-center px-4 gap-2">
              <Terminal className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-400">Terminal</span>
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap">
              {output === "" ? (
                <span className="text-gray-600">Ready. Click Run Code to execute.</span>
              ) : (
                <div className={`${isError ? 'text-red-400' : 'text-emerald-400'}`}>
                  {output}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Tutor Sidebar */}
        <div className="w-[340px] bg-[#16181d] rounded-xl border border-[#272b35] flex flex-col shadow-sm">
          <div className="h-12 border-b border-[#272b35] bg-[#1e2128] rounded-t-xl flex items-center px-4 gap-3">
            <div className="bg-blue-500/10 p-1.5 rounded-md">
              <Bot className="w-4 h-4 text-[#0ea5e9]" />
            </div>
            <span className="font-semibold text-white text-sm">AI Tutor</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chat.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#1e293b] text-blue-400 text-[10px] font-bold border border-[#334155]' : 'bg-[#0ea5e9] text-white'}`}>
                  {msg.role === 'user' ? 'RR' : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-[#0ea5e9] text-white rounded-tr-sm' : 'bg-[#272b35] text-gray-200 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-[#272b35]">
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask for a hint or explain an error..."
                className="w-full bg-[#0f1115] border border-[#272b35] rounded-full pl-4 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-gray-500"
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#0ea5e9] hover:bg-[#0284c7] rounded-full flex items-center justify-center text-white transition-colors"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
