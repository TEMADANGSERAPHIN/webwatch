import redis from "./redis";
import { WatchedSite, Snapshot, Change, SiteStatus } from "@/types";
import { v4 as uuidv4 } from "uuid";

const KEYS = {
  urls: "webwatch:urls",
  meta: (id: string) => `webwatch:meta:${id}`,
  snaps: (id: string) => `webwatch:snap:${id}`,
  changes: (id: string) => `webwatch:changes:${id}`,
};

const MAX_SNAPSHOTS = 20;
const MAX_CHANGES = 50;

// ── Sites ──────────────────────────────────────────────────────────────────

export async function getAllSites(): Promise<WatchedSite[]> {
  const ids = await redis.smembers(KEYS.urls);
  if (!ids.length) return [];

  const pipeline = redis.pipeline();
  ids.forEach((id) => pipeline.hgetall(KEYS.meta(id)));
  const results = await pipeline.exec();

  return (results as Record<string, string>[])
    .filter(Boolean)
    .map((raw) => ({
      id: raw.id,
      url: raw.url,
      label: raw.label,
      createdAt: raw.createdAt,
      lastChecked: raw.lastChecked || null,
      status: (raw.status as SiteStatus) || "pending",
      lastChange: raw.lastChange || null,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getSiteById(id: string): Promise<WatchedSite | null> {
  const raw = await redis.hgetall(KEYS.meta(id));
  if (!raw || !raw.id) return null;
  return {
    id: raw.id as string,
    url: raw.url as string,
    label: raw.label as string,
    createdAt: raw.createdAt as string,
    lastChecked: (raw.lastChecked as string) || null,
    status: (raw.status as SiteStatus) || "pending",
    lastChange: (raw.lastChange as string) || null,
  };
}

export async function addSite(url: string, label?: string): Promise<WatchedSite> {
  const id = uuidv4();
  const now = new Date().toISOString();
  const site: WatchedSite = {
    id,
    url,
    label: label || new URL(url).hostname,
    createdAt: now,
    lastChecked: null,
    status: "pending",
    lastChange: null,
  };

  await Promise.all([
    redis.sadd(KEYS.urls, id),
    redis.hset(KEYS.meta(id), site as unknown as Record<string, unknown>),
  ]);

  return site;
}

export async function deleteSite(id: string): Promise<void> {
  await Promise.all([
    redis.srem(KEYS.urls, id),
    redis.del(KEYS.meta(id)),
    redis.del(KEYS.snaps(id)),
    redis.del(KEYS.changes(id)),
  ]);
}

export async function updateSiteStatus(
  id: string,
  status: SiteStatus,
  lastChecked: string,
  lastChange?: string
): Promise<void> {
  const update: Record<string, string> = { status, lastChecked };
  if (lastChange) update.lastChange = lastChange;
  await redis.hset(KEYS.meta(id), update);
}

// ── Snapshots ──────────────────────────────────────────────────────────────

export async function pushSnapshot(siteId: string, content: string): Promise<Snapshot> {
  const snapshot: Snapshot = {
    id: uuidv4(),
    siteId,
    content,
    capturedAt: new Date().toISOString(),
  };
  await redis.lpush(KEYS.snaps(siteId), JSON.stringify(snapshot));
  await redis.ltrim(KEYS.snaps(siteId), 0, MAX_SNAPSHOTS - 1);
  return snapshot;
}

export async function getLatestSnapshots(siteId: string, count = 2): Promise<Snapshot[]> {
  const raw = await redis.lrange(KEYS.snaps(siteId), 0, count - 1);
  return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r));
}

// ── Changes ────────────────────────────────────────────────────────────────

export async function pushChange(
  siteId: string,
  summary: string,
  hasChanges: boolean,
  snapshotBefore?: string,
  snapshotAfter?: string
): Promise<Change> {
  const change: Change = {
    id: uuidv4(),
    siteId,
    detectedAt: new Date().toISOString(),
    summary,
    hasChanges,
    snapshotBefore,
    snapshotAfter,
  };
  await redis.lpush(KEYS.changes(siteId), JSON.stringify(change));
  await redis.ltrim(KEYS.changes(siteId), 0, MAX_CHANGES - 1);
  return change;
}

export async function getChanges(siteId: string, count = 50): Promise<Change[]> {
  const raw = await redis.lrange(KEYS.changes(siteId), 0, count - 1);
  return raw.map((r) => (typeof r === "string" ? JSON.parse(r) : r));
}
