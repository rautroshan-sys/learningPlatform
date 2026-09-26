import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();

  const handleDeleteAccount = () => {
    // In a real app, you would make an API call here.
    toast.error("Account deleted successfully.");
    navigate("/login");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Settings</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-4">Profile</p>
          <h3 className="text-white font-medium mb-4">Your details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Name</label>
              <input 
                type="text" 
                defaultValue="Roshan Raut" 
                className="w-full bg-[#0f1115] border border-[#272b35] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#0ea5e9] transition-colors" 
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Email</label>
              <input 
                type="email" 
                defaultValue="roshan@example.dev" 
                className="w-full bg-[#0f1115] border border-[#272b35] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#0ea5e9] transition-colors" 
              />
            </div>
          </div>
        </div>

        <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-4">Learning</p>
          <h3 className="text-white font-medium mb-4">Preferences & notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-200">Show hints before full answers</span>
              <div className="w-10 h-6 bg-[#0ea5e9] rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-200">Daily practice reminder</span>
              <div className="w-10 h-6 bg-[#0ea5e9] rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-200">Email me when my path changes</span>
              <div className="w-10 h-6 bg-[#272b35] rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-gray-400 rounded-full absolute left-1 top-1"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#16181d] rounded-xl border border-[#272b35] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-4">Account</p>
          <h3 className="text-white font-medium mb-4">Account</h3>
          
          <div className="flex items-center gap-4">
            <button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Save changes
            </button>
            <button 
              onClick={handleDeleteAccount}
              className="bg-transparent hover:bg-red-500/10 text-red-500 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
