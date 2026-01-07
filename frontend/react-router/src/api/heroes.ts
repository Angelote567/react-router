import type { Hero, HeroCreate } from "../models/hero";

const API_BASE_URL = "http://localhost:8000";

export async function getHeroes(): Promise<Hero[]> {
  const response = await fetch(`${API_BASE_URL}/heroes/`);
  if (!response.ok) {
    throw new Error("Failed to fetch heroes");
  }
  return response.json();
}

export async function getHero(heroId: string): Promise<Hero> {
  const response = await fetch(`${API_BASE_URL}/heroes/${heroId}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Hero not found");
    }
    throw new Error("Failed to fetch hero");
  }
  return response.json();
}

export async function createHero(hero: HeroCreate): Promise<Hero> {
  const response = await fetch(`${API_BASE_URL}/heroes/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(hero),
  });
  if (!response.ok) {
    throw new Error("Failed to create hero");
  }
  return response.json();
}

export async function deleteHero(heroId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/heroes/${heroId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete hero");
  }
}

export async function updateHero(heroId: number, hero: HeroCreate): Promise<Hero> {
  const response = await fetch(`${API_BASE_URL}/heroes/${heroId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(hero),
  });
  if (!response.ok) {
    throw new Error("Failed to update hero");
  }
  return response.json();
}
