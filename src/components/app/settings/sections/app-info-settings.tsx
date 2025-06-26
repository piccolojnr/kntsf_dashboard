"use client";
import { useState } from "react";
import { Eye, EyeOff, Copy, Plus, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function AppInfoSettings() {
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<number, boolean>
  >({});
  const [loginEntries, setLoginEntries] = useState([
    {
      id: 0,
      service: "gmail.com",
      url: "https://mail.google.com",
      username: "knutsforduniversitysrc@gmail.com",
      password: "knutsford112233",
      category: "hosting",
    },
    {
      id: 1,
      service: "Vercel",
      url: "https://vercel.com/your-app",
      username: "use google login",
      password: "google",
      category: "hosting",
    },
    {
      id: 2,
      service: "Google Workspace",
      url: "https://admin.google.com",
      username: "admin@yourdomain.com",
      password: "your-google-password",
      category: "email",
    },
    {
      id: 3,
      service: "Namecheap",
      url: "https://namecheap.com",
      username: "kntsf",
      password: "knutsford112233",
      category: "domain",
    },
    {
      id: 4,
      service: "GitHub",
      url: "https://github.com/your-org/your-repo",
      username: "kntsf",
      password: "knutsford112233",
      category: "development",
    },
    {
      id: 5,
      service: "Paystack",
      url: "https://dashboard.paystack.com",
      username: "kntsf",
      password: "Knutsford112233@",
      category: "other",
    },
    {
      id: 6,
      service: "Zoho Mail",
      url: "https://mail.zoho.com",
      username: "kntsf",
      password: "Knutsford112233@",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    service: "",
    url: "",
    username: "",
    password: "",
    category: "other",
  });

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard!`
      );
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const addNewEntry = () => {
    if (newEntry.service && newEntry.username) {
      const id = Math.max(...loginEntries.map((e) => e.id)) + 1;
      setLoginEntries([...loginEntries, { ...newEntry, id }]);
      setNewEntry({
        service: "",
        url: "",
        username: "",
        password: "",
        category: "other",
      });
      setShowAddForm(false);
    }
  };

  const deleteEntry = (id: number) => {
    setLoginEntries(loginEntries.filter((entry) => entry.id !== id));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      hosting: "bg-blue-100 text-blue-800",
      email: "bg-green-100 text-green-800",
      domain: "bg-purple-100 text-purple-800",
      development: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">App Information & Logins</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Login
        </button>
      </div>

      {showAddForm && (
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <h4 className="font-medium mb-3 dark:text-gray-200">Add New Login</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Service name"
              value={newEntry.service}
              onChange={(e) =>
                setNewEntry({ ...newEntry, service: e.target.value })
              }
              className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
            />
            <input
              type="url"
              placeholder="URL (optional)"
              value={newEntry.url}
              onChange={(e) =>
                setNewEntry({ ...newEntry, url: e.target.value })
              }
              className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="Username/Email"
              value={newEntry.username}
              onChange={(e) =>
                setNewEntry({ ...newEntry, username: e.target.value })
              }
              className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={newEntry.password}
              onChange={(e) =>
                setNewEntry({ ...newEntry, password: e.target.value })
              }
              className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
            />
            <select
              value={newEntry.category}
              onChange={(e) =>
                setNewEntry({ ...newEntry, category: e.target.value })
              }
              className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="hosting">Hosting</option>
              <option value="email">Email</option>
              <option value="domain">Domain</option>
              <option value="development">Development</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={addNewEntry}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors dark:bg-green-500 dark:hover:bg-green-600"
            >
              Add Entry
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="font-medium text-gray-700 dark:text-gray-300">
          Login Credentials
        </h4>
        {loginEntries.map((entry) => (
          <div
            key={entry.id}
            className="border rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <h5 className="font-medium dark:text-gray-200">
                  {entry.service}
                </h5>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(entry.category ?? "other")}`}
                >
                  {entry.category}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {entry.url && (
                  <button
                    onClick={() => window.open(entry.url, "_blank")}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors dark:text-gray-400 dark:hover:text-blue-400"
                    title="Open URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors dark:text-gray-400 dark:hover:text-red-400"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Username:
                </span>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded dark:text-gray-200">
                    {entry.username}
                  </code>
                  <button
                    onClick={() => copyToClipboard(entry.username, "username")}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors dark:text-gray-400 dark:hover:text-blue-400"
                    title="Copy username"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Password:
                </span>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono dark:text-gray-200">
                    {visiblePasswords[entry.id] ? entry.password : "••••••••"}
                  </code>
                  <button
                    onClick={() => togglePasswordVisibility(entry.id)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors dark:text-gray-400 dark:hover:text-blue-400"
                    title={
                      visiblePasswords[entry.id]
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {visiblePasswords[entry.id] ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(entry.password, "password")}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors dark:text-gray-400 dark:hover:text-blue-400"
                    title="Copy password"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {entry.url && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  URL:{" "}
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {entry.url}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-md border border-yellow-200 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-200">
        <strong>Security Note:</strong> This section contains sensitive
        information. Passwords are hidden by default and only visible when
        explicitly shown. Consider using environment variables for production
        applications.
      </div>
    </div>
  );
}
