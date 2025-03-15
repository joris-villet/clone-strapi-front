'use client'

interface IToast {
  title: string;
  description: string;
  status: 'success' | 'error' | 'info';
}

import { useState } from "react";

const Toast = (title: string, description: string, status: 'success' | 'error' | 'info', duration = 3000) => {

  const [toast, setToast] = useState<IToast | null>(null);
    const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null);


  if (toastTimeout) clearTimeout(toastTimeout);

  setToast({ title, description, status });

  const timeout = setTimeout(() => {
    setToast(null);
  }, duration);

  setToastTimeout(timeout);
};



export default Toast;