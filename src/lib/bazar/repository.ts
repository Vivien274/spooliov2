import {
  BazarDataset,
  BazarItem,
  BazarScene,
  BazarZone,
} from "@/types/bazar";
import {
  INITIAL_BAZAR_ITEMS,
  INITIAL_BAZAR_SCENES,
  INITIAL_BAZAR_ZONES,
} from "./mockData";

const STORAGE_KEY_SCENES = "spoolio_bazar_scenes_v1";
const STORAGE_KEY_ITEMS = "spoolio_bazar_items_v1";
const STORAGE_KEY_ZONES = "spoolio_bazar_zones_v1";

export interface BazarRepository {
  getScenes(): Promise<BazarScene[]>;
  getPublishedScenes(): Promise<BazarScene[]>;
  getSceneById(id: string): Promise<BazarScene | null>;
  getItems(): Promise<BazarItem[]>;
  getItemById(id: string): Promise<BazarItem | null>;
  getItemsByScene(sceneId: string): Promise<BazarItem[]>;
  getZones(): Promise<BazarZone[]>;
  getZonesByScene(sceneId: string): Promise<BazarZone[]>;

  createScene(
    input: Omit<BazarScene, "id" | "createdAt" | "updatedAt">
  ): Promise<BazarScene>;
  updateScene(id: string, input: Partial<BazarScene>): Promise<BazarScene>;
  deleteScene(id: string): Promise<void>;
  duplicateScene(id: string): Promise<BazarScene>;

  createItem(
    input: Omit<BazarItem, "id" | "createdAt" | "updatedAt">
  ): Promise<BazarItem>;
  updateItem(id: string, input: Partial<BazarItem>): Promise<BazarItem>;
  deleteItem(id: string): Promise<void>;

  createZone(input: Omit<BazarZone, "id">): Promise<BazarZone>;
  updateZone(id: string, input: Partial<BazarZone>): Promise<BazarZone>;
  deleteZone(id: string): Promise<void>;

  quickStockAdjustment(itemId: string, delta: number): Promise<BazarItem>;
  toggleItemSold(itemId: string): Promise<BazarItem>;
  simulateOrder(
    purchases: { itemId: string; quantity: number }[]
  ): Promise<{ success: boolean; orderId: string }>;

  exportDataset(): Promise<BazarDataset>;
  importDataset(dataset: BazarDataset): Promise<boolean>;
  resetToDemoData(): Promise<void>;

  subscribe(listener: () => void): () => void;
}

class LocalMockBazarRepository implements BazarRepository {
  private scenes: BazarScene[] = [];
  private items: BazarItem[] = [];
  private zones: BazarZone[] = [];
  private listeners: Set<() => void> = new Set();
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;

    if (typeof window !== "undefined") {
      try {
        const storedScenes = localStorage.getItem(STORAGE_KEY_SCENES);
        const storedItems = localStorage.getItem(STORAGE_KEY_ITEMS);
        const storedZones = localStorage.getItem(STORAGE_KEY_ZONES);

        if (storedScenes && storedItems && storedZones) {
          this.scenes = JSON.parse(storedScenes);
          this.items = JSON.parse(storedItems);
          this.zones = JSON.parse(storedZones);
          this.initialized = true;
          return;
        }
      } catch (err) {
        console.warn("Could not load from localStorage, falling back to mock initial seed", err);
      }
    }

    // Default seed
    this.scenes = [...INITIAL_BAZAR_SCENES];
    this.items = [...INITIAL_BAZAR_ITEMS];
    this.zones = [...INITIAL_BAZAR_ZONES];
    this.initialized = true;
    this.persist();
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_SCENES, JSON.stringify(this.scenes));
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(this.items));
      localStorage.setItem(STORAGE_KEY_ZONES, JSON.stringify(this.zones));
    } catch (err) {
      console.warn("Storage save error", err);
    }
  }

  private notify() {
    this.persist();
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error("Listener error", e);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async getScenes(): Promise<BazarScene[]> {
    this.init();
    return [...this.scenes].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getPublishedScenes(): Promise<BazarScene[]> {
    this.init();
    return this.scenes
      .filter((s) => s.status === "published")
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getSceneById(id: string): Promise<BazarScene | null> {
    this.init();
    return this.scenes.find((s) => s.id === id) || null;
  }

  async getItems(): Promise<BazarItem[]> {
    this.init();
    return [...this.items];
  }

  async getItemById(id: string): Promise<BazarItem | null> {
    this.init();
    return this.items.find((item) => item.id === id) || null;
  }

  async getItemsByScene(sceneId: string): Promise<BazarItem[]> {
    this.init();
    const zoneItemIds = new Set(
      this.zones.filter((z) => z.sceneId === sceneId).map((z) => z.itemId)
    );
    return this.items.filter((item) => zoneItemIds.has(item.id));
  }

  async getZones(): Promise<BazarZone[]> {
    this.init();
    return [...this.zones];
  }

  async getZonesByScene(sceneId: string): Promise<BazarZone[]> {
    this.init();
    return this.zones.filter((z) => z.sceneId === sceneId);
  }

  async createScene(
    input: Omit<BazarScene, "id" | "createdAt" | "updatedAt">
  ): Promise<BazarScene> {
    this.init();
    const now = new Date().toISOString();
    const newScene: BazarScene = {
      ...input,
      id: `scene-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sortOrder: input.sortOrder ?? this.scenes.length + 1,
      createdAt: now,
      updatedAt: now,
    };
    this.scenes.push(newScene);
    this.notify();
    return newScene;
  }

  async updateScene(id: string, input: Partial<BazarScene>): Promise<BazarScene> {
    this.init();
    const idx = this.scenes.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Scene not found: ${id}`);
    const updated: BazarScene = {
      ...this.scenes[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.scenes[idx] = updated;
    this.notify();
    return updated;
  }

  async deleteScene(id: string): Promise<void> {
    this.init();
    this.scenes = this.scenes.filter((s) => s.id !== id);
    // Also remove associated zones
    this.zones = this.zones.filter((z) => z.sceneId !== id);
    this.notify();
  }

  async duplicateScene(id: string): Promise<BazarScene> {
    this.init();
    const original = this.scenes.find((s) => s.id === id);
    if (!original) throw new Error("Scene not found");

    const now = new Date().toISOString();
    const newSceneId = `scene-${Date.now()}`;
    const duplicated: BazarScene = {
      ...original,
      id: newSceneId,
      title: `${original.title} (Copie)`,
      status: "draft",
      sortOrder: this.scenes.length + 1,
      createdAt: now,
      updatedAt: now,
    };
    this.scenes.push(duplicated);

    // Duplicate zones for this scene
    const originalZones = this.zones.filter((z) => z.sceneId === id);
    const duplicatedZones = originalZones.map((z) => ({
      ...z,
      id: `zone-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sceneId: newSceneId,
    }));
    this.zones.push(...duplicatedZones);

    this.notify();
    return duplicated;
  }

  async createItem(
    input: Omit<BazarItem, "id" | "createdAt" | "updatedAt">
  ): Promise<BazarItem> {
    this.init();
    const now = new Date().toISOString();
    const derivedStatus = input.quantity <= 0 ? "sold" : input.status;
    const newItem: BazarItem = {
      ...input,
      status: derivedStatus,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.items.push(newItem);
    this.notify();
    return newItem;
  }

  async updateItem(id: string, input: Partial<BazarItem>): Promise<BazarItem> {
    this.init();
    const idx = this.items.findIndex((item) => item.id === id);
    if (idx === -1) throw new Error(`Item not found: ${id}`);

    const existing = this.items[idx];
    const newQty = input.quantity !== undefined ? input.quantity : existing.quantity;
    let newStatus = input.status !== undefined ? input.status : existing.status;

    if (newQty <= 0) {
      newStatus = "sold";
    } else if (newStatus === "sold" && newQty > 0) {
      newStatus = "available";
    }

    const updated: BazarItem = {
      ...existing,
      ...input,
      quantity: Math.max(0, newQty),
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    this.items[idx] = updated;
    this.notify();
    return updated;
  }

  async deleteItem(id: string): Promise<void> {
    this.init();
    this.items = this.items.filter((item) => item.id !== id);
    // Remove references to this item in zones
    this.zones = this.zones.filter((z) => z.itemId !== id);
    this.notify();
  }

  async createZone(input: Omit<BazarZone, "id">): Promise<BazarZone> {
    this.init();
    const newZone: BazarZone = {
      ...input,
      id: `zone-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    this.zones.push(newZone);
    this.notify();
    return newZone;
  }

  async updateZone(id: string, input: Partial<BazarZone>): Promise<BazarZone> {
    this.init();
    const idx = this.zones.findIndex((z) => z.id === id);
    if (idx === -1) throw new Error(`Zone not found: ${id}`);
    const updated: BazarZone = {
      ...this.zones[idx],
      ...input,
    };
    this.zones[idx] = updated;
    this.notify();
    return updated;
  }

  async deleteZone(id: string): Promise<void> {
    this.init();
    this.zones = this.zones.filter((z) => z.id !== id);
    this.notify();
  }

  /**
   * Quick inventory adjustment for markets/braderies
   */
  async quickStockAdjustment(itemId: string, delta: number): Promise<BazarItem> {
    this.init();
    const item = this.items.find((i) => i.id === itemId);
    if (!item) throw new Error("Item not found");
    const newQty = Math.max(0, item.quantity + delta);
    return this.updateItem(itemId, { quantity: newQty });
  }

  /**
   * Toggles sold status on an item
   */
  async toggleItemSold(itemId: string): Promise<BazarItem> {
    this.init();
    const item = this.items.find((i) => i.id === itemId);
    if (!item) throw new Error("Item not found");

    if (item.status === "sold" || item.quantity <= 0) {
      return this.updateItem(itemId, { quantity: 1, status: "available" });
    } else {
      return this.updateItem(itemId, { quantity: 0, status: "sold" });
    }
  }

  /**
   * Simulates order checkout: decrements stock and sets sold status if stock reaches 0
   */
  async simulateOrder(
    purchases: { itemId: string; quantity: number }[]
  ): Promise<{ success: boolean; orderId: string }> {
    this.init();
    const orderId = `BAZAR-${Math.floor(100000 + Math.random() * 900000)}`;

    for (const p of purchases) {
      const idx = this.items.findIndex((item) => item.id === p.itemId);
      if (idx !== -1) {
        const item = this.items[idx];
        const newQty = Math.max(0, item.quantity - p.quantity);
        this.items[idx] = {
          ...item,
          quantity: newQty,
          status: newQty === 0 ? "sold" : item.status,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    this.notify();
    return { success: true, orderId };
  }

  async exportDataset(): Promise<BazarDataset> {
    this.init();
    return {
      scenes: this.scenes,
      items: this.items,
      zones: this.zones,
      version: "2.1",
      exportedAt: new Date().toISOString(),
    };
  }

  async importDataset(dataset: BazarDataset): Promise<boolean> {
    if (
      !dataset ||
      !Array.isArray(dataset.scenes) ||
      !Array.isArray(dataset.items) ||
      !Array.isArray(dataset.zones)
    ) {
      throw new Error("Format JSON Bazar non valide.");
    }

    this.scenes = dataset.scenes;
    this.items = dataset.items;
    this.zones = dataset.zones;
    this.notify();
    return true;
  }

  async resetToDemoData(): Promise<void> {
    this.scenes = JSON.parse(JSON.stringify(INITIAL_BAZAR_SCENES));
    this.items = JSON.parse(JSON.stringify(INITIAL_BAZAR_ITEMS));
    this.zones = JSON.parse(JSON.stringify(INITIAL_BAZAR_ZONES));
    this.notify();
  }
}

// Global singleton instance for local browser runtime
export const bazarRepository: BazarRepository = new LocalMockBazarRepository();

