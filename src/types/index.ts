export type SiteStatus = "ok" | "changed" | "error" | "pending" | "checking";

export interface WatchedSite {
  id: string;
  url: string;
  label: string;
  createdAt: string;
  lastChecked: string | null;
  status: SiteStatus;
  lastChange?: string | null;
}

export interface Snapshot {
  id: string;
  siteId: string;
  content: string;
  capturedAt: string;
}

export interface Change {
  id: string;
  siteId: string;
  detectedAt: string;
  summary: string;
  hasChanges: boolean;
  snapshotBefore?: string;
  snapshotAfter?: string;
}

export interface SiteWithHistory extends WatchedSite {
  changes: Change[];
  snapshots: Snapshot[];
}

export interface AddUrlPayload {
  url: string;
  label?: string;
}

export interface ScrapeResult {
  siteId: string;
  hasChanges: boolean;
  summary: string;
  checkedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
