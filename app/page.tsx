"use client"

import { useState } from "react"
import { Copy, Plus, Trash2, CheckCircle } from "lucide-react"

interface Batch {
  id: string
  apiKey: string
  apiSecret: string
  emails: string
}

export default function BatchCredentialsProcessor() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [currentBatch, setCurrentBatch] = useState({ apiKey: "", apiSecret: "", emails: "" })
  const [sy, setSy] = useState("")
  const [apiOutput, setApiOutput] = useState("")
  const [emailOutput, setEmailOutput] = useState("")
  const [copied, setCopied] = useState<"api" | "email" | null>(null)
  const [batchCount, setBatchCount] = useState(0)

  const addBatch = () => {
    if (currentBatch.apiKey || currentBatch.apiSecret || currentBatch.emails) {
      const newId = Math.random().toString(36).substr(2, 9)
      setBatches([...batches, { ...currentBatch, id: newId }])
      setBatchCount(batchCount + 1)
      setCurrentBatch({ apiKey: "", apiSecret: "", emails: "" })
    }
  }

  const removeBatch = (id: string) => {
    if (batches.length > 1) {
      setBatches(batches.filter((batch) => batch.id !== id))
      setBatchCount(batchCount - 1)
    }
  }

  const updateCurrentBatch = (field: "apiKey" | "apiSecret" | "emails", value: string) => {
    setCurrentBatch((prev) => ({ ...prev, [field]: value }))
  }

  const processBatches = () => {
  let apiOutputText = ""
  let allEmails: string[] = []

  batches.forEach((batch) => {
    if (batch.apiKey || batch.apiSecret) {
      if (sy) {
        apiOutputText += `#${sy}\n`
      }

      if (batch.apiKey) {
        apiOutputText += `COINBASE_API_KEY_="${batch.apiKey}"\n`
      }

      if (batch.apiSecret) {
        apiOutputText += `COINBASE_API_SECRET_="${batch.apiSecret}"\n`
      }

      apiOutputText += `\n`
    }

    if (batch.emails) {
      const emailLines = batch.emails
        .split("\n")
        .map((e) => e.trim())
        .filter((e) => e && e.includes("@"))

      allEmails.push(...emailLines)
    }
  })

  const uniqueEmails = [...new Set(allEmails)]
  setApiOutput(apiOutputText.trim())
  setEmailOutput(uniqueEmails.map((e) => `"${e}"`).join(",\n"))
}


  const copyToClipboard = (text: string, type: "api" | "email") => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const resetAll = () => {
    setBatches([])
    setCurrentBatch({ apiKey: "", apiSecret: "", emails: "" })
    setSy("")
    setApiOutput("")
    setEmailOutput("")
    setBatchCount(0)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Batch Credentials Processor</h1>
        <p className="text-muted-foreground mb-8">
          Manage multiple batches of Coinbase credentials and process them together
        </p>

        {/* Symbol/Variable Input */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <label htmlFor="sy-variable" className="block text-sm font-medium text-foreground mb-3">
            Symbol/Variable (sy)
          </label>
          <input
            id="sy-variable"
            type="text"
            value={sy}
            onChange={(e) => setSy(e.target.value)}
            placeholder="e.g., #, export, etc."
            className="w-full p-3 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Batch Counter */}
        {batchCount > 0 && (
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4 mb-6 text-center">
            <p className="text-sm font-medium text-foreground">
              {batchCount} batch{batchCount !== 1 ? "es" : ""} added
            </p>
          </div>
        )}

        {/* Current Input Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Input Credentials</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-foreground mb-2">
                COINBASE_API_KEY_
              </label>
              <input
                id="api-key"
                type="text"
                value={currentBatch.apiKey}
                onChange={(e) => updateCurrentBatch("apiKey", e.target.value)}
                placeholder="organizations/.../apiKeys/..."
                className="w-full p-3 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
              />
            </div>

            <div>
              <label htmlFor="api-secret" className="block text-sm font-medium text-foreground mb-2">
                COINBASE_API_SECRET_
              </label>
              <textarea
                id="api-secret"
                value={currentBatch.apiSecret}
                onChange={(e) => updateCurrentBatch("apiSecret", e.target.value)}
                placeholder="-----BEGIN EC PRIVATE KEY-----..."
                className="w-full p-3 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm h-24"
              />
            </div>

            <div>
              <label htmlFor="emails" className="block text-sm font-medium text-foreground mb-2">
                Emails (one per line)
              </label>
              <textarea
                id="emails"
                value={currentBatch.emails}
                onChange={(e) => updateCurrentBatch("emails", e.target.value)}
                placeholder="email1@example.com&#10;email2@example.com"
                className="w-full p-3 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring h-24"
              />
            </div>
          </div>
        </div>

       {/* Simple Batch List */}
{batches.length > 0 && (
  <div className="bg-card border border-border rounded-lg p-6 mb-6">
    <h2 className="text-lg font-semibold mb-4">Batches</h2>

    <ul className="space-y-2">
      {batches.map((batch, index) => (
        <li
          key={batch.id}
          className="flex items-center justify-between p-3 border border-border rounded-md"
        >
          <span className="text-sm font-medium">
            Batch #{index + 1}
          </span>

          <button
            onClick={() => removeBatch(batch.id)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md
                       bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </button>
        </li>
      ))}
    </ul>
  </div>
)}


        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={addBatch}
            className="flex items-center gap-2 px-6 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:opacity-80 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Batch
          </button>
          <button
            onClick={processBatches}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            disabled={batches.length === 0}
          >
            <CheckCircle className="w-4 h-4" />
            Process
          </button>
          <button
            onClick={resetAll}
            className="px-6 py-2 bg-muted text-muted-foreground rounded-md font-medium hover:opacity-80 transition-opacity"
          >
            Reset
          </button>
        </div>

        {/* Output Sections */}
        {(apiOutput || emailOutput) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Keys Output */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">API Keys Output</h2>
                <button
                  onClick={() => copyToClipboard(apiOutput, "api")}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    copied === "api"
                      ? "bg-green-100 text-green-700"
                      : "bg-secondary text-secondary-foreground hover:opacity-80"
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {copied === "api" ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="bg-background border border-input rounded p-3 text-xs overflow-auto max-h-80 text-foreground font-mono whitespace-pre-wrap break-words">
                {apiOutput}
              </pre>
            </div>

            {/* Email List Output */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Email List Output</h2>
                <button
                  onClick={() => copyToClipboard(emailOutput, "email")}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    copied === "email"
                      ? "bg-green-100 text-green-700"
                      : "bg-secondary text-secondary-foreground hover:opacity-80"
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {copied === "email" ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="bg-background border border-input rounded p-3 text-xs overflow-auto max-h-80 text-foreground font-mono whitespace-pre-wrap break-words">
                {emailOutput}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
