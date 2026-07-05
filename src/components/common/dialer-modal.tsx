"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Phone,
  PhoneOff,
  Volume2,
  Mic,
  Calendar,
  X,
  Play,
  RotateCcw,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DialerModalProps {
  lead: {
    id: string;
    contactName: string;
    contactTitle: string | null;
    companyName: string;
    contactEmail: string | null;
  };
  onClose: () => void;
  onSuccess?: () => void;
}

export function DialerModal({ lead, onClose, onSuccess }: DialerModalProps) {
  const queryClient = useQueryClient();
  const [callStatus, setCallStatus] = useState<"dialing" | "ringing" | "connected" | "disconnected">("dialing");
  const [duration, setDuration] = useState(0);
  const [outcome, setOutcome] = useState("connected");
  const [notes, setNotes] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Generate random phone number for realism
  useEffect(() => {
    const area = Math.floor(Math.random() * 900 + 100);
    const mid = Math.floor(Math.random() * 900 + 100);
    const end = Math.floor(Math.random() * 9000 + 1000);
    setPhoneNumber(`+1 (${area}) ${mid}-${end}`);
  }, []);

  // Dialer Simulation Sequence
  useEffect(() => {
    let timer: any;
    if (callStatus === "dialing") {
      timer = setTimeout(() => setCallStatus("ringing"), 1500);
    } else if (callStatus === "ringing") {
      timer = setTimeout(() => setCallStatus("connected"), 3000);
    }
    return () => clearTimeout(timer);
  }, [callStatus]);

  // Call duration counter
  useEffect(() => {
    let interval: any;
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Log call mutation
  const logCallMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          outcome,
          notes,
          duration: duration
        })
      });
      if (!res.ok) throw new Error("Log call failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["sequence-detail"] });
      queryClient.invalidateQueries({ queryKey: ["sequence-lead-states"] });
      
      alert("Call logged successfully!");
      if (onSuccess) onSuccess();
      onClose();
    }
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleHangup = () => {
    setCallStatus("disconnected");
  };

  const handleDialerClick = (num: string) => {
    // Simulated dial click
  };

  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface border border-border w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between h-[520px]">
        {/* Header banner */}
        <div className="bg-sidebar-bg text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full animate-pulse",
              callStatus === "dialing" || callStatus === "ringing" ? "bg-yellow-500" :
              callStatus === "connected" ? "bg-success-500" : "bg-neutral-500"
            )} />
            <span className="text-xs font-semibold capitalize tracking-wider">
              {callStatus === "dialing" && "Dialing..."}
              {callStatus === "ringing" && "Ringing..."}
              {callStatus === "connected" && "Active Call"}
              {callStatus === "disconnected" && "Call Ended"}
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-800 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lead profile area */}
        <div className="p-4 text-center border-b border-border space-y-1">
          <h3 className="text-sm font-bold text-text-primary">{lead.contactName}</h3>
          <p className="text-[10px] text-text-secondary truncate">{lead.contactTitle || "Lead Profile"}</p>
          <p className="text-[10px] text-accent-500 font-semibold">{lead.companyName}</p>
          <p className="text-xs font-mono text-text-tertiary pt-1">{phoneNumber}</p>
        </div>

        {/* Center Panel (Call timer / Dial outcome form) */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin">
          {callStatus === "disconnected" ? (
            // Log outcome form
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="font-bold text-text-secondary">Call Outcome</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="w-full bg-surface-secondary px-3 py-2 border border-border rounded-lg text-text-primary focus:outline-none"
                >
                  <option value="connected">Connected (Talked to Lead)</option>
                  <option value="meeting_scheduled">Meeting Scheduled</option>
                  <option value="left_voicemail">Left Voicemail</option>
                  <option value="busy">Line Busy / Gatekeeper Blocked</option>
                  <option value="no_answer">No Answer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-text-secondary">Call Duration</label>
                <div className="px-3 py-1.5 bg-surface-secondary border border-border rounded-lg font-mono text-text-primary">
                  {formatTime(duration)}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-text-secondary">Call Disposition Notes</label>
                <textarea
                  placeholder="Record summary of conversations, objections, next steps..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-surface-secondary px-3 py-2 border border-border rounded-lg text-text-primary focus:outline-none h-20 resize-none"
                />
              </div>
            </div>
          ) : (
            // Call in progress / Dial Pad
            <div className="flex flex-col items-center justify-center space-y-4 py-3">
              {/* Call Timer Display */}
              <div className="text-2xl font-mono font-bold text-text-primary tracking-wider">
                {formatTime(duration)}
              </div>

              {/* Simulated visual dialer grid */}
              <div className="grid grid-cols-3 gap-3 w-48 text-center">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(num => (
                  <button
                    key={num}
                    onClick={() => handleDialerClick(num)}
                    className="w-12 h-12 rounded-full border border-border bg-surface-secondary hover:bg-surface-tertiary hover:border-text-tertiary transition-all font-semibold flex items-center justify-center text-text-primary cursor-pointer active:scale-95"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions area */}
        <div className="p-4 border-t border-border bg-surface-secondary flex items-center justify-center gap-4 shrink-0">
          {callStatus === "disconnected" ? (
            <button
              onClick={() => logCallMutation.mutate()}
              disabled={logCallMutation.isPending}
              className="w-full py-2.5 bg-accent-500 hover:bg-accent-600 disabled:bg-neutral-300 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              {logCallMutation.isPending ? "Saving..." : "Log Call Details"}
            </button>
          ) : (
            <div className="flex items-center gap-4 w-full">
              <div className="flex-1 flex justify-center gap-3">
                <button className="p-2.5 bg-surface border border-border hover:bg-surface-tertiary text-text-secondary rounded-full cursor-pointer">
                  <Mic className="w-4 h-4" />
                </button>
                <button className="p-2.5 bg-surface border border-border hover:bg-surface-tertiary text-text-secondary rounded-full cursor-pointer">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleHangup}
                className="py-2.5 px-6 bg-danger-500 hover:bg-danger-600 text-white rounded-xl shadow-md transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <PhoneOff className="w-4 h-4 fill-white" />
                Hangup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
