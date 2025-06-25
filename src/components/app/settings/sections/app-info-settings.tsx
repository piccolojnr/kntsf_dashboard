"use client";

export function AppInfoSettings() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">App Information & Logins</h3>
      <div className="space-y-2">
        <div>
          <strong>Hosting:</strong> Vercel (https://vercel.com/your-app)
        </div>
        <div>
          <strong>Email Provider:</strong> Google Workspace (admin@yourdomain.com)
        </div>
        <div>
          <strong>Namecheap Login:</strong> username: yournamecheapuser, password: (ask admin)
        </div>
        <div>
          <strong>Domain Registrar:</strong> Namecheap (https://namecheap.com)
        </div>
        <div>
          <strong>Other Important Info:</strong>
          <ul className="list-disc ml-6">
            <li>Slack: https://yourworkspace.slack.com</li>
            <li>GitHub: https://github.com/your-org/your-repo</li>
            <li>Contact: admin@yourdomain.com</li>
          </ul>
        </div>
        <div className="text-xs text-muted-foreground">
          <em>This section is for reference only. Update as needed.</em>
        </div>
      </div>
    </div>
  );
} 