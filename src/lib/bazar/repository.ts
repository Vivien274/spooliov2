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

  syncFromServer(): Promise<void>;
  saveToServer(): Promise<{ success: boolean; message: string }>;

  subscribe(listener: () => void): () => void;
}

class LocalMockBazarRepository implements BazarRepository {
  private scenes: BazarScene[] = [];
  private items: BazarItem[] = [];
  private zones: BazarZone[] = [];
  private listeners: Set<() => void> = new Set();
  private initialized: boolean = false;
  private syncing: boolean = false;

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

          // Background sync from server to ensure fresh state
          this.syncFromServer();
          return;
        }
      } catch (err) {
        console.warn("Could not load from localStorage, falling back to server seed", err);
      }
    }

    // Default seed
    this.scenes = [...INITIAL_BAZAR_SCENES];
    this.items = [...INITIAL_BAZAR_ITEMS];
    this.zones = [...INITIAL_BAZAR_ZONES];
    this.initialized = true;
    this.persist();

    if (typeof window !== "undefined") {
      this.syncFromServer();
    }
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

  private notify(autoSaveToServer: boolean = false) {
    this.persist();
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error("Listener error", e);
      }
    });

    if (autoSaveToServer && typeof window !== "undefined") {
      this.saveToServer().catch((err) => {
        console.warn("Auto save to server failed:", err);
      });
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async syncFromServer(): Promise<void> {
    if (typeof window === "undefined" || this.syncing) return;
    this.syncing = true;
    try {
      const res = await fetch("/api/bazar", { cache: "no-store" });
      if (res.ok) {
        const data: BazarDataset = await res.json();
        if (data && Array.isArray(data.scenes) && data.scenes.length > 0) {
          this.scenes = data.scenes;
          this.items = data.items;
          this.zones = data.zones;
          this.persist();
          // Notify without triggering autoSaveToServer loop
          this.listeners.forEach((fn) => {
            try {
              fn();
            } catch (e) {}
          });
        }
      }
    } catch (err) {
      console.warn("Could not sync from server:", err);
    } finally {
      this.syncing = false;
    }
  }

  async saveToServer(): Promise<{ success: boolean; message: string }> {
    this.init();
    try {
      const dataset: BazarDataset = {
        version: "2.1",
        exportedAt: new Date().toISOString(),
        scenes: this.scenes,
        items: this.items,
        zones: this.zones,
      };

      const res = await fetch("/api/admin/bazar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataset),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur de sauvegarde serveur.");
      }

      return {
        success: true,
        message: "Données du Bazar synchronisées avec succès en base de données !",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur de connexion";
      console.error("Save to server error:", err);
      return { success: false, message };
    }
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
    const id = `scene-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newScene: BazarScene = {
      ...input,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.scenes.push(newScene);
    this.notify(true);
    return newScene;
  }

  async updateScene(id: string, input: Partial<BazarScene>): Promise<BazarScene> {
    this.init();
    const index = this.scenes.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`Scène non trouvée: ${id}`);

    const updated: BazarScene = {
      ...this.scenes[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.scenes[index] = updated;
    this.notify(true);
    return updated;
  }

  async deleteScene(id: string): Promise<void> {
    this.init();
    // Delete scene
    this.scenes = this.scenes.filter((s) => s.id !== id);
    // Delete corresponding zones
    const zonesToDelete = this.zones.filter((z) => z.sceneId === id);
    const itemIdsToCheck = new Set(zonesToDelete.map((z) => z.itemId));
    this.zones = this.zones.filter((z) => z.sceneId !== id);

    // If items are no longer linked to any zone, optionally clean them
    const remainingZoneItemIds = new Set(this.zones.map((z) => z.itemId));
    this.items = this.items.filter(
      (item) => !itemIdsToCheck.has(item.id) || remainingZoneItemIds.has(item.id)
    );

    this.notify(true);
  }

  async duplicateScene(id: string): Promise<BazarScene> {
    this.init();
    const source = this.scenes.find((s) => s.id === id);
    if (!source) throw new Error("Scène source introuvable");

    const now = new Date().toISOString();
    const newSceneId = `scene-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newScene: BazarScene = {
      ...source,
      id: newSceneId,
      title: `${source.title} (Copie)`,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };
    this.scenes.push(newScene);

    // Duplicate zones and items
    const sourceZones = this.zones.filter((z) => z.sceneId === id);
    for (const sz of sourceZones) {
      const srcItem = this.items.find((i) => i.id === sz.itemId);
      if (srcItem) {
        const newItemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        this.items.push({
          ...srcItem,
          id: newItemId,
          createdAt: now,
          updatedAt: now,
        });

        this.zones.push({
          ...sz,
          id: `zone-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sceneId: newSceneId,
          itemId: newItemId,
        });
      }
    }

    this.notify(true);
    return newScene;
  }

  async createItem(
    input: Omit<BazarItem, "id" | "createdAt" | "updatedAt">
  ): Promise<BazarItem> {
    this.init();
    const now = new Date().toISOString();
    const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: BazarItem = {
      ...input,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.items.push(newItem);
    this.notify(true);
    return newItem;
  }

  async updateItem(id: string, input: Partial<BazarItem>): Promise<BazarItem> {
    this.init();
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error(`Objet non trouvé: ${id}`);

    const updated: BazarItem = {
      ...this.items[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.items[index] = updated;
    this.notify(true);
    return updated;
  }

  async deleteItem(id: string): Promise<void> {
    this.init();
    this.items = this.items.filter((i) => i.id !== id);
    this.zones = this.zones.filter((z) => z.itemId !== id);
    this.notify(true);
  }

  async createZone(input: Omit<BazarZone, "id">): Promise<BazarZone> {
    this.init();
    const id = `zone-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newZone: BazarZone = {
      ...input,
      id,
    };
    this.zones.push(newZone);
    this.notify(true);
    return newZone;
  }

  async updateZone(id: string, input: Partial<BazarZone>): Promise<BazarZone> {
    this.init();
    const index = this.zones.findIndex((z) => z.id === id);
    if (index === -1) throw new Error(`Zone non trouvée: ${id}`);

    const updated: BazarZone = {
      ...this.zones[index],
      ...input,
    };
    this.zones[index] = updated;
    this.notify(true);
    return updated;
  }

  async deleteZone(id: string): Promise<void> {
    this.init();
    const zone = this.zones.find((z) => z.id === id);
    this.zones = this.zones.filter((z) => z.id !== id);

    // If the item is not referenced by any other zone, delete it
    if (zone && !this.zones.some((z) => z.itemId === zone.itemId)) {
      this.items = this.items.filter((i) => i.id !== zone.itemId);
    }
    this.notify(true);
  }

  async quickStockAdjustment(itemId: string, delta: number): Promise<BazarItem> {
    this.init();
    const index = this.items.findIndex((i) => i.id === itemId);
    if (index === -1) throw new Error("Objet introuvable");

    const item = this.items[index];
    const newQty = Math.max(0, item.quantity + delta);
    const updated: BazarItem = {
      ...item,
      quantity: newQty,
      status: newQty === 0 ? "sold" : item.status === "sold" ? "available" : item.status,
      updatedAt: new Date().toISOString(),
    };
    this.items[index] = updated;
    this.notify(true);
    return updated;
  }

  async toggleItemSold(itemId: string): Promise<BazarItem> {
    this.init();
    const index = this.items.findIndex((i) => i.id === itemId);
    if (index === -1) throw new Error("Objet introuvable");

    const item = this.items[index];
    const isSold = item.status === "sold";
    const updated: BazarItem = {
      ...item,
      status: isSold ? "available" : "sold",
      quantity: isSold ? Math.max(1, item.quantity) : 0,
      updatedAt: new Date().toISOString(),
    };
    this.items[index] = updated;
    this.notify(true);
    return updated;
  }

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

    this.notify(true);

    // Call server API for live stock decrement
    if (typeof window !== "undefined") {
      try {
        await fetch("/api/bazar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "order", purchases }),
        });
      } catch (e) {
        console.warn("Could not sync order stock decrement to server:", e);
      }
    }

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
    this.notify(true);
    return true;
  }

  async resetToDemoData(): Promise<void> {
    this.scenes = JSON.parse(JSON.stringify(INITIAL_BAZAR_SCENES));
    this.items = JSON.parse(JSON.stringify(INITIAL_BAZAR_ITEMS));
    this.zones = JSON.parse(JSON.stringify(INITIAL_BAZAR_ZONES));
    this.notify(true);
  }
}

// Global singleton instance for local browser runtime
export const bazarRepository: BazarRepository = new LocalMockBazarRepository();
