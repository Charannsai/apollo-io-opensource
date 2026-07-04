"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
}: ModalProps) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={cn(
              "relative z-10 w-full max-w-md overflow-hidden border p-6 shadow-2xl transition-all duration-200",
              "bg-white border-neutral-200 text-neutral-900",
              "dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-50"
            )}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    "px-3.5 py-1.5 rounded text-xs font-medium border transition-colors duration-150 cursor-pointer",
                    "bg-transparent border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900",
                    "dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-50"
                  )}
                >
                  {cancelText}
                </button>
                {onConfirm && (
                  <button
                    type="button"
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={cn(
                      "px-3.5 py-1.5 rounded text-xs font-medium transition-colors duration-150 cursor-pointer text-white dark:text-neutral-950",
                      isDanger
                        ? "bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-100 dark:hover:bg-white"
                        : "bg-neutral-900 hover:bg-neutral-950 dark:bg-neutral-50 dark:hover:bg-white"
                    )}
                  >
                    {confirmText}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
