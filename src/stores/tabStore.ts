import { create } from 'zustand';

export type TabKind = 'static' | 'detail';

export interface AppTab {
  /** Unique key, e.g. "/" | "/csm-media" | "/videos/123" */
  key: string;
  label: string;
  kind: TabKind;
  /** For detail tabs: the video ID */
  videoId?: number;
}

/** Static navigation tabs — always present, cannot be closed. */
export const STATIC_TABS: AppTab[] = [
  { key: '/',           label: 'Giám sát Transcode',  kind: 'static' },
  { key: '/csm-media',  label: 'Kho video CSM',        kind: 'static' },
  { key: '/kpi-chart',  label: 'KPI Chart',             kind: 'static' },
  { key: '/visual-vmaf',label: 'Visual VMAF: KQI',      kind: 'static' },
  { key: '/config-csm', label: 'Config CSM',            kind: 'static' },
];

const MAX_DETAIL_TABS = 5;

interface TabState {
  /** All currently open tabs (static + detail). Static tabs are always first. */
  tabs: AppTab[];
  /** The key of the currently active tab. */
  activeKey: string;
  /** Chronological history of visited tab keys for back-navigation on close */
  history: string[];

  setActiveKey: (key: string) => void;
  openDetailTab: (videoId: number) => void;
  closeDetailTab: (videoId: number) => void;
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [...STATIC_TABS],
  activeKey: '/',
  history: ['/'],

  setActiveKey: (key) => {
    const { activeKey, history } = get();
    if (key === activeKey) return;
    const newHistory = [...history.filter((k) => k !== key), key];
    set({ activeKey: key, history: newHistory });
  },

  openDetailTab: (videoId) => {
    const key = `/videos/${videoId}`;
    const { tabs, history } = get();
    const newHistory = [...history.filter((k) => k !== key), key];

    const existing = tabs.find((t) => t.key === key);
    if (existing) {
      set({ activeKey: key, history: newHistory });
      return;
    }

    // Enforce max detail tabs
    const detailTabs = tabs.filter((t) => t.kind === 'detail');
    let nextTabs = tabs;
    if (detailTabs.length >= MAX_DETAIL_TABS) {
      const oldest = detailTabs[0];
      nextTabs = tabs.filter((t) => t.key !== oldest.key);
    }
    const newTab: AppTab = { key, label: `Video #${videoId}`, kind: 'detail', videoId };
    set({ tabs: [...nextTabs, newTab], activeKey: key, history: newHistory });
  },

  closeDetailTab: (videoId) => {
    const key = `/videos/${videoId}`;
    const { tabs, activeKey, history } = get();
    const idx = tabs.findIndex((t) => t.key === key);
    if (idx === -1) return;

    const newTabs = tabs.filter((t) => t.key !== key);
    const newHistory = history.filter((k) => k !== key);

    let newActive = activeKey;
    if (activeKey === key) {
      // Find the most recently visited tab in history that is still open
      const prevKey = [...newHistory].reverse().find((k) => newTabs.some((t) => t.key === k));
      newActive = prevKey ?? newTabs[Math.max(0, idx - 1)]?.key ?? '/';
    }

    set({ tabs: newTabs, activeKey: newActive, history: newHistory });
  },
}));
