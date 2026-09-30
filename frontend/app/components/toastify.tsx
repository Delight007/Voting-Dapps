"use client";

import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

export function ToastViewport() {
  return (
    <ToastContainer
      className="toast-viewport"
      position="top-right"
      autoClose={4500}
      closeOnClick
      draggable
      limit={4}
      newestOnTop
      pauseOnFocusLoss
      pauseOnHover
      theme="dark"
    />
  );
}

export function ErrorToast({ message }: { message: string | null }) {
  useEffect(() => {
    if (message) {
      toast.error(message, { toastId: `error-${message}` });
    }
  }, [message]);

  return null;
}
