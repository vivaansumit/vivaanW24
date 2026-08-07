"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Mail, DollarSign, Trash2, Archive, Inbox } from "lucide-react";
import { useToast } from "../Toast";

interface Inquiry {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  budget?: string;
  status: string;
  createdAt: string;
}

export function InquiriesSection() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries");
      if (res.ok) {
        const data = await res.json();
        const list = data.inquiries || [];
        setInquiries(list);
        if (list.length > 0) setSelectedInquiry(list[0]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status } : null));
      }

      await fetch(`/api/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      showToast(`Inquiry status set to ${status}`, "info");
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry message?")) return;

    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
      if (res.ok) {
        const nextList = inquiries.filter((i) => i.id !== id);
        setInquiries(nextList);
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(nextList[0] || null);
        }
        showToast("Inquiry deleted", "success");
      }
    } catch {
      showToast("Failed to delete inquiry", "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-[#f5f5f5]">Inquiries Inbox</h2>
        <p className="text-xs text-[#a3a3a3]">Direct project proposals, client requests & hire messages submitted from Vivaan's public portfolio</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#C9A227]/80">Loading inquiries...</div>
      ) : inquiries.length === 0 ? (
        <div className="bg-[#111111]/60 border border-[#222222] rounded-3xl p-12 text-center space-y-3">
          <Inbox className="w-10 h-10 text-[#C9A227] mx-auto" />
          <h3 className="font-bold text-base text-[#f5f5f5]">Inbox is clear</h3>
          <p className="text-xs text-[#a3a3a3] max-w-sm mx-auto">
            When potential clients click "Hire Me" or send a proposal on Vivaan's website, messages appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Messages List Sidebar */}
          <div className="bg-[#111111] border border-[#C9A227]/20 rounded-2xl overflow-hidden divide-y divide-[#141414] shadow-xl max-h-[600px] overflow-y-auto">
            {inquiries.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedInquiry(item)}
                className={`p-4 cursor-pointer transition flex flex-col gap-1 ${
                  selectedInquiry?.id === item.id ? "bg-[#C9A227]/10/60 border-l-4 border-[#C9A227]" : "hover:bg-[#141414]/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#f5f5f5] truncate">{item.senderName}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      item.status === "new"
                        ? "bg-rose-500/20 text-rose-400"
                        : item.status === "replied"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-[#141414] text-[#a3a3a3]"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#f5f5f5]/90 truncate">{item.subject}</p>
                <p className="text-[11px] text-[#a3a3a3] line-clamp-1">{item.message}</p>
              </div>
            ))}
          </div>

          {/* Detailed Message Inspector */}
          {selectedInquiry ? (
            <div className="md:col-span-2 bg-[#111111] border border-[#C9A227]/20 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#222222]">
                  <div>
                    <h3 className="text-lg font-bold text-[#f5f5f5]">{selectedInquiry.subject}</h3>
                    <p className="text-xs text-[#C9A227] font-medium">
                      From: {selectedInquiry.senderName} &lt;{selectedInquiry.senderEmail}&gt;
                    </p>
                  </div>

                  {selectedInquiry.budget && (
                    <div className="bg-[#C9A227]/10/80 text-[#C9A227] border border-[#C9A227]/40 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 font-bold">
                      <DollarSign className="w-3.5 h-3.5 text-[#C9A227]" /> Budget: {selectedInquiry.budget}
                    </div>
                  )}
                </div>

                <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-[#222222] text-[#f5f5f5] text-sm leading-relaxed whitespace-pre-line">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#222222]">
                <a
                  href={`mailto:${selectedInquiry.senderEmail}?subject=Re: ${encodeURIComponent(selectedInquiry.subject)}`}
                  onClick={() => handleUpdateStatus(selectedInquiry.id, "replied")}
                  className="bg-[#C9A227] hover:bg-[#D4AF37] text-[#0a0a0a] font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-[#C9A227]/20"
                >
                  <Mail className="w-4 h-4" /> Reply via Email
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedInquiry.id, "archived")}
                    className="p-2 bg-[#141414] hover:bg-[#141414] text-[#a3a3a3] rounded-xl transition text-xs flex items-center gap-1"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" /> Archive
                  </button>
                  <button
                    onClick={() => handleDelete(selectedInquiry.id)}
                    className="p-2 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-xl transition text-xs flex items-center gap-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
