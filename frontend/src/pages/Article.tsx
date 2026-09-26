import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Terminal, CheckCircle2 } from "lucide-react";

const articles = {
  "python-lists": {
    title: "Python Lists",
    category: "Python",
    content: `
Lists are used to store multiple items in a single variable.

Lists are one of 4 built-in data types in Python used to store collections of data, the other 3 are Tuple, Set, and Dictionary, all with different qualities and usage.

### Creating a List
Lists are created using square brackets:

\`\`\`python
thislist = ["apple", "banana", "cherry"]
print(thislist)
\`\`\`

### List Items
List items are ordered, changeable, and allow duplicate values.
List items are indexed, the first item has index [0], the second item has index [1] etc.
    `
  }
};

export default function Article() {
  const { articleId } = useParams();
  const article = articles[articleId as keyof typeof articles] || {
    title: "Article Not Found",
    category: "Unknown",
    content: "This article is a mock and has not been fully implemented yet. Try 'Python Lists'."
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
      <Link to="/search" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
      </Link>
      
      <div className="bg-[#16181d] border border-[#272b35] rounded-2xl overflow-hidden shadow-lg">
        <div className="border-b border-[#272b35] bg-[#1e2128] p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0ea5e9] bg-[#0ea5e9]/10 px-2 py-1 rounded">
              {article.category}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> 5 min read
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-4">{article.title}</h1>
        </div>
        
        <div className="p-8 text-gray-300 leading-relaxed space-y-6">
          {article.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('###')) {
              return <h3 key={i} className="text-xl font-bold text-white mt-8 mb-4">{paragraph.replace('###', '').trim()}</h3>;
            }
            if (paragraph.startsWith('```')) {
              const code = paragraph.split('\n').slice(1, -1).join('\n');
              return (
                <div key={i} className="my-6 rounded-xl overflow-hidden border border-[#272b35]">
                  <div className="bg-[#1e2128] px-4 py-2 border-b border-[#272b35] flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-400">Example Code</span>
                  </div>
                  <pre className="bg-[#0f1115] p-4 text-sm font-mono overflow-x-auto">
                    <code className="text-blue-300">{code}</code>
                  </pre>
                  <div className="bg-[#16181d] px-4 py-3 border-t border-[#272b35] flex justify-end">
                    <Link to="/sandbox" className="text-xs font-medium text-[#0ea5e9] hover:text-white flex items-center gap-1 bg-[#0ea5e9]/10 px-3 py-1.5 rounded-md transition-colors">
                      Try it yourself
                    </Link>
                  </div>
                </div>
              );
            }
            return <p key={i}>{paragraph}</p>;
          })}
        </div>
        
        <div className="p-8 border-t border-[#272b35] bg-[#1e2128] flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium mb-1">Did you find this helpful?</h4>
            <p className="text-xs text-gray-400">Your feedback improves our adaptive engine.</p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-[#272b35] flex items-center justify-center text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20 transition-all">
              👍
            </button>
            <button className="w-10 h-10 rounded-full border border-[#272b35] flex items-center justify-center text-gray-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all">
              👎
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
