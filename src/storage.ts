import { openDB } from "idb";
import type { Progress } from "./types";
const database = () =>
  openDB("kkokkok", 1, {
    upgrade(db) {
      db.createObjectStore("progress", { keyPath: "id" });
      db.createObjectStore("settings");
    },
  });
export async function getAllProgress(): Promise<Progress[]> {
  const db = await database();
  try {
    return await db.getAll("progress");
  } finally {
    db.close();
  }
}
export async function saveProgress(p: Progress) {
  const db = await database();
  try {
    await db.put("progress", p);
  } finally {
    db.close();
  }
}
export async function clearProgress() {
  const db = await database();
  try {
    await db.clear("progress");
  } finally {
    db.close();
  }
}
export async function soundSetting(): Promise<boolean> {
  const db = await database();
  try {
    return (await db.get("settings", "sound")) !== false;
  } finally {
    db.close();
  }
}
export async function setSoundSetting(value: boolean) {
  const db = await database();
  try {
    await db.put("settings", value, "sound");
  } finally {
    db.close();
  }
}
