"use client";
import { useState } from "react";
import { Eye, EyeOff, Copy, Plus, ExternalLink, Trash2, Shield, Key, Database } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      hosting: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      email: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      domain: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      development: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Database className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            App Information & Logins
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Manage application credentials and service information securely
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          Add Login
        </Button>
      </div>

      {/* Add New Entry Form */}
      {showAddForm && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/10 dark:to-yellow-900/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <Plus className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Add New Login Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Service Name
                </label>
                <input
                  type="text"
                  placeholder="Service name"
                  value={newEntry.service}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, service: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={newEntry.url}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username/Email
                </label>
                <input
                  type="text"
                  placeholder="Username or email"
                  value={newEntry.username}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  value={newEntry.password}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                value={newEntry.category}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-200 focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
              >
                <option value="hosting">Hosting</option>
                <option value="email">Email</option>
                <option value="domain">Domain</option>
                <option value="development">Development</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={addNewEntry}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              >
                Add Entry
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
                className="px-6 py-2"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Login Credentials List */}
      <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-800/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Login Credentials
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your application login information and credentials
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loginEntries.map((entry) => (
              <div
                key={entry.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {entry.service}
                    </h5>
                    <Badge className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(entry.category ?? "other")}`}>
                      {entry.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.url && (
                      <Button
                        onClick={() => window.open(entry.url, "_blank")}
                        variant="ghost"
                        size="sm"
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        title="Open URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => deleteEntry(entry.id)}
                      variant="ghost"
                      size="sm"
                      className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username:
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded text-sm font-mono dark:text-gray-200">
                        {entry.username}
                      </code>
                      <Button
                        onClick={() => copyToClipboard(entry.username, "username")}
                        variant="ghost"
                        size="sm"
                        className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        title="Copy username"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password:
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded text-sm font-mono dark:text-gray-200">
                        {visiblePasswords[entry.id] ? entry.password : "••••••••"}
                      </code>
                      <Button
                        onClick={() => togglePasswordVisibility(entry.id)}
                        variant="ghost"
                        size="sm"
                        className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
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
                      </Button>
                      <Button
                        onClick={() => copyToClipboard(entry.password, "password")}
                        variant="ghost"
                        size="sm"
                        className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        title="Copy password"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {entry.url && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                      <strong>URL:</strong>{" "}
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
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border-l-4 border-yellow-400 dark:border-yellow-500">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Security Notice
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                This section contains sensitive information. Passwords are hidden by default and only visible when explicitly shown. 
                Consider using environment variables for production applications and ensure proper access controls are in place.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
