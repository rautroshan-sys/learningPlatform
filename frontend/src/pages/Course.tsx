import { useState, useEffect } from "react";
import { ChevronRight, Code, Terminal, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const courseContent = {
  "python-intro": {
    title: "Python Introduction",
    category: "Python",
    content: `
Python is a popular programming language. It was created by Guido van Rossum, and released in 1991.

### What is Python?
It is used for:
- web development (server-side),
- software development,
- mathematics,
- system scripting.

### What can Python do?
- Python can be used on a server to create web applications.
- Python can be used alongside software to create workflows.
- Python can connect to database systems. It can also read and modify files.
    `
  },
  "python-syntax": {
    title: "Python Syntax",
    category: "Python",
    content: `
Python syntax can be executed by writing directly in the Command Line.

### Python Indentation
Indentation refers to the spaces at the beginning of a code line.
Where in other programming languages the indentation in code is for readability only, the indentation in Python is very important.
Python uses indentation to indicate a block of code.

\`\`\`python
if 5 > 2:
  print("Five is greater than two!")
\`\`\`
    `
  },
  "python-variables": {
    title: "Python Variables",
    category: "Python",
    content: `
Variables are containers for storing data values.

### Creating Variables
Python has no command for declaring a variable.
A variable is created the moment you first assign a value to it.

\`\`\`python
x = 5
y = "Hello, World!"
print(x)
print(y)
\`\`\`
    `
  },
  "js-intro": {
    title: "JavaScript Introduction",
    category: "JavaScript",
    content: `
JavaScript is the world's most popular programming language.
JavaScript is the programming language of the Web.
JavaScript is easy to learn.

### Why Study JavaScript?
JavaScript is one of the 3 languages all web developers must learn:
1. HTML to define the content of web pages
2. CSS to specify the layout of web pages
3. JavaScript to program the behavior of web pages
    `
  }
};

const syllabus = [
  {
    category: "Python Basics",
    topics: [
      { id: "python-intro", title: "Python Intro" },
      { id: "python-syntax", title: "Python Syntax" },
      { id: "python-variables", title: "Python Variables" },
    ]
  },
  {
    category: "JavaScript Basics",
    topics: [
      { id: "js-intro", title: "JS Intro" },
    ]
  }
];

export default function Course() {
  const [activeTopicId, setActiveTopicId] = useState("python-intro");
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  
  useEffect(() => {
    // Determine prioritized content based on survey
    const goal = localStorage.getItem("userGoal");
    const exp = localStorage.getItem("userExperience");
    
    if (goal === "Web Development") {
      setActiveTopicId("js-intro");
    } else {
      setActiveTopicId("python-intro"); // Default for algorithms/data science etc
    }
  }, []);

  const activeArticle = courseContent[activeTopicId as keyof typeof courseContent];

  const handleMarkComplete = () => {
    if (!completedTopics.includes(activeTopicId)) {
      setCompletedTopics([...completedTopics, activeTopicId]);
    }
  };

  return (
    <div className="flex -m-8 h-[calc(100vh-3.5rem)]">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-[#16181d] border-r border-[#272b35] overflow-y-auto">
        <div className="p-4 border-b border-[#272b35] sticky top-0 bg-[#16181d] z-10">
          <h2 className="font-bold text-white tracking-tight">Course Content</h2>
          <p className="text-xs text-[#0ea5e9] mt-1">Curated based on your survey</p>
        </div>
        
        <div className="py-4">
          {syllabus.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{section.category}</h3>
              <div className="flex flex-col">
                {section.topics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => setActiveTopicId(topic.id)}
                    className={`flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${activeTopicId === topic.id ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border-r-2 border-[#0ea5e9]' : 'text-gray-300 hover:bg-[#272b35]/50'}`}
                  >
                    <span>{topic.title}</span>
                    {completedTopics.includes(topic.id) && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative bg-[#0f1115]">
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-300">
          
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0ea5e9] bg-[#0ea5e9]/10 px-2 py-1 rounded">
              {activeArticle?.category || "Unknown"}
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white mt-4">{activeArticle?.title}</h1>
          </div>
          
          <div className="text-gray-300 leading-relaxed space-y-6">
            {activeArticle?.content.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('###')) {
                return <h3 key={i} className="text-2xl font-bold text-white mt-10 mb-4">{paragraph.replace('###', '').trim()}</h3>;
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <ul key={i} className="list-disc pl-6 space-y-2 marker:text-[#0ea5e9]">
                    {paragraph.split('\n').filter(Boolean).map((li, j) => (
                      <li key={j}>{li.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              if (paragraph.startsWith('1. ')) {
                return (
                  <ol key={i} className="list-decimal pl-6 space-y-2 marker:text-[#0ea5e9] font-medium">
                    {paragraph.split('\n').filter(Boolean).map((li, j) => (
                      <li key={j}>{li.replace(/^\d+\.\s/, '')}</li>
                    ))}
                  </ol>
                );
              }
              if (paragraph.startsWith('```')) {
                const code = paragraph.split('\n').slice(1, -1).join('\n');
                return (
                  <div key={i} className="my-8 rounded-xl overflow-hidden border border-[#272b35] shadow-lg">
                    <div className="bg-[#1e2128] px-4 py-2.5 border-b border-[#272b35] flex items-center gap-2">
                      <Code className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-300">Example</span>
                    </div>
                    <pre className="bg-[#0f1115] p-5 text-sm font-mono overflow-x-auto text-blue-300 leading-loose">
                      <code>{code}</code>
                    </pre>
                    <div className="bg-[#16181d] px-4 py-3 border-t border-[#272b35] flex justify-end">
                      <Link to="/sandbox" className="text-xs font-medium bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        Try it Yourself <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              }
              return <p key={i}>{paragraph}</p>;
            })}
          </div>
          
          <div className="mt-12 pt-8 border-t border-[#272b35] flex items-center justify-between">
            <button 
              onClick={handleMarkComplete}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${completedTopics.includes(activeTopicId) ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-[#1e2128] text-white hover:bg-[#272b35]'}`}
            >
              {completedTopics.includes(activeTopicId) ? <><CheckCircle2 className="w-5 h-5" /> Completed</> : "Mark as Completed"}
            </button>
            
            <button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2">
              Next Topic <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
