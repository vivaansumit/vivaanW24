"use client";

import React, { useState } from "react";
import { X, Send, Sparkles, DollarSign, Mail, User, MessageSquare } from "lucide-react";
import { useToast } from "./Toast";

interface ContactModalProps {
  creatorHandle: string;
  creatorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ creatorHandle, creatorName, isOpen, onClose }: ContactModalProps) {
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("$5,000 - $10,000");
  const [sending, setSending] = useState(false);

  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !subject || !message) {
      showToast("Please fill in all required contact fields.", "info");
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: creatorHandle,
          senderName,
          senderEmail,
          subject,
          message,
          budget,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Inquiry sent to ${creatorName}! They will review your proposal shortly.`, "success");
        setSenderName("");
        setSenderEmail("");
        setSubject("");
        setMessage("");
        onClose();
      } else {
        showToast(data.error || "Failed to send inquiry", "error");
      }
    } catch {
      showToast("Error sending message", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-[#C9A227]/30 text-[#f5f5f5] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#141414] bg-[#0a0a0a]/60">
          <div>
            <h3 className="font-bold text-lg text-[#f5f5f5] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C9A227]" /> Contact & Hire {creatorName}
            </h3>
            <p className="text-xs text-[#a3a3a3]">Send a direct project proposal or creative direction inquiry</p>
          </div>
          <button onClick={onClose} className="text-[#a3a3a3] hover:text-white p-2 rounded-full hover:bg-[#141414] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#C9A227]" /> Your Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Elena Rostova"
                className="w-full bg-[#0a0a0a] border border-[#141414] rounded-xl px-4 py-2.5 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#C9A227]/60"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#C9A227]" /> Your Email
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="elena@company.com"
                className="w-full bg-[#0a0a0a] border border-[#141414] rounded-xl px-4 py-2.5 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#C9A227]/60"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-[#C9A227]" /> Project Subject / Goal
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. 3D Motion Reveal Video for Product Launch"
              className="w-full bg-[#0a0a0a] border border-[#141414] rounded-xl px-4 py-2.5 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#C9A227]/60"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#C9A227]" /> Estimated Budget Range
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#141414] rounded-xl px-4 py-2.5 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#C9A227]/60"
            >
              <option value="Under $2,500">Under $2,500</option>
              <option value="$2,500 - $5,000">$2,500 - $5,000</option>
              <option value="$5,000 - $10,000">$5,000 - $10,000</option>
              <option value="$10,000 - $25,000">$10,000 - $25,000</option>
              <option value="$25,000+">$25,000+</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C9A227]/80 uppercase tracking-wider mb-1.5">Project Deliverables & Timeline</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe creative vision, timeline, target audience, or requirements..."
              className="w-full bg-[#0a0a0a] border border-[#141414] rounded-xl p-3.5 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#C9A227]/60 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-[#C9A227] hover:bg-[#D4AF37] text-[#0a0a0a] font-bold text-xs py-3.5 rounded-xl transition shadow-lg shadow-[#C9A227]/20 flex items-center justify-center gap-2"
          >
            {sending ? "Sending Proposal..." : <><Send className="w-4 h-4 text-[#0a0a0a]" /> Send Project Proposal</>}
          </button>
        </form>
      </div>
    </div>
  );
}
