import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon, BookOpen, Code, ChevronRight } from "lucide-react";

const mockContentDB = [
  { id: "python-lists", title: "Python Lists", category: "Python", excerpt: "Lists are used to store multiple items in a single variable.", difficulty: "Beginner" },
  { id: "python-loops", title: "Python For Loops", category: "Python", excerpt: "A for loop is used for iterating over a sequence (that is either a list, a tuple, a dictionary, a set, or a string).", difficulty: "Beginner" },
  { id: "js-async", title: "JavaScript Async / Await", category: "JavaScript", excerpt: "Async and Await make promises easier to write.", difficulty: "Intermediate" },
  { id: "cpp-pointers", title: "C++ Pointers", category: "C++", excerpt: "A pointer however, is a variable that stores the memory address as its value.", difficulty: "Advanced" },
  { id: "react-hooks", title: "React Hooks", category: "React", excerpt: "Hooks allow us to 'hook' into React features such as state and lifecycle methods.", difficulty: "Intermediate" },
  { id: "sql-joins", title: "SQL Joins", category: "SQL", excerpt: "A JOIN clause is used to combine rows from two or more tables, based on a related column between them.", difficulty: "Intermediate" },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  
  const results = mockContentDB.filter(c => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
  };

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Knowledge Library</h1>
        <p className="text-gray-400 text-sm">Search thousands of programming topics, tutorials, and examples.</p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-2xl mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for Python, React, SQL..." 
          className="w-full bg-[#16181d] border border-[#272b35] rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#0ea5e9] transition-colors shadow-sm"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#0ea5e9] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#0284c7] transition-colors">
          Search
        </button>
      </form>

      {query && (
        <p className="text-sm text-gray-400 mb-4">
          Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.length > 0 ? (
          results.map((item) => (
            <Link 
              to={`/article/${item.id}`} 
              key={item.id}
              className="bg-[#16181d] border border-[#272b35] hover:border-[#0ea5e9] p-5 rounded-xl transition-all group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-[#272b35] p-1.5 rounded-md">
                    <BookOpen className="w-4 h-4 text-[#0ea5e9]" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0ea5e9]">{item.category}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-400 bg-[#272b35] px-2 py-0.5 rounded">
                  {item.difficulty}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#0ea5e9] transition-colors">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed flex-1">{item.excerpt}</p>
              
              <div className="mt-4 pt-4 border-t border-[#272b35] flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5"><Code className="w-4 h-4" /> Contains code examples</span>
                <span className="text-[#0ea5e9] flex items-center font-medium group-hover:translate-x-1 transition-transform">
                  Read article <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border border-dashed border-[#272b35] rounded-xl">
            <SearchIcon className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-1">No results found</h3>
            <p className="text-sm text-gray-400">Try adjusting your search terms or browse categories.</p>
          </div>
        )}
      </div>
    </div>
  );
}
