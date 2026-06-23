export type BackendStatus = "checking" | "online" | "sleeping";

let currentStatus: BackendStatus = "checking";
let listeners: Array<(status: BackendStatus) => void> = [];

export const getBackendStatus = (): BackendStatus => {
  if (typeof window === "undefined") return "online";
  return currentStatus;
};

export const setBackendStatus = (status: BackendStatus) => {
  if (currentStatus === status) return;
  currentStatus = status;
  listeners.forEach((l) => l(status));
};

export const subscribeBackendStatus = (listener: (status: BackendStatus) => void) => {
  listeners.push(listener);
  // Send current status immediately on subscription
  listener(currentStatus);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

// Track active API requests
let activeRequestsCount = 0;
let requestListeners: Array<(count: number) => void> = [];

export const getActiveRequestsCount = () => activeRequestsCount;

export const incrementActiveRequests = () => {
  activeRequestsCount++;
  requestListeners.forEach((l) => l(activeRequestsCount));
};

export const decrementActiveRequests = () => {
  activeRequestsCount = Math.max(0, activeRequestsCount - 1);
  requestListeners.forEach((l) => l(activeRequestsCount));
};

export const subscribeActiveRequests = (listener: (count: number) => void) => {
  requestListeners.push(listener);
  listener(activeRequestsCount);
  return () => {
    requestListeners = requestListeners.filter((l) => l !== listener);
  };
};
