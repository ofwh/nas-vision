'use client';

import { useRef, useState } from 'react';
import { usePluginStorage } from '@/hooks/usePluginStorage';
import type { JsonObject } from '@/lib/api';
import type { Locale } from '@/i18n/config';
import { weatherCards } from '../components/WeatherCard';
import type { PluginWeatherCard, WeatherCity, WeatherCityInput, WeatherCityItem, WeatherStorageCard } from '../types';

function parseCity(data: JsonObject): WeatherCity | null {
  const { latitude, longitude, name, index, cards } = data;

  if (
    typeof latitude !== 'number' ||
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    typeof longitude !== 'number' ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180 ||
    typeof name !== 'string' ||
    typeof index !== 'number' ||
    !Array.isArray(cards)
  ) {
    return null;
  }

  const parsedCards: PluginWeatherCard[] = [];

  for (const card of cards) {
    if (
      card &&
      typeof card === 'object' &&
      !Array.isArray(card) &&
      typeof card.type === 'string' &&
      typeof card.status === 'boolean'
    ) {
      parsedCards.push({ type: card.type, status: card.status });
    }
  }

  return { latitude, longitude, name, index, cards: parsedCards };
}

function mergeCards(saved: PluginWeatherCard[] = []): PluginWeatherCard[] {
  const cards: PluginWeatherCard[] = [];
  const types = new Set<string>();

  for (const card of [...saved, ...weatherCards]) {
    if (!types.has(card.type)) {
      cards.push({ type: card.type, status: card.status ?? true });
      types.add(card.type);
    }
  }

  return cards;
}

function serializeCity(city: WeatherCity): WeatherCity {
  return {
    name: city.name.trim(),
    longitude: city.longitude,
    latitude: city.latitude,
    index: city.index,
    cards: city.cards.map(({ type, status }) => ({ type, status })),
  };
}

export function useWeatherStorage(appId: string, locale: Locale) {
  const storage = usePluginStorage(appId);
  const query = storage.query(appId ? {} : null);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);

  function resolveCards(saved?: PluginWeatherCard[]): WeatherStorageCard[] {
    return mergeCards(saved).flatMap((card) => {
      const definition = weatherCards.find((definition) => definition.type === card.type);

      return definition ? [{ ...card, name: definition.name[locale] }] : [];
    });
  }

  const cards = resolveCards();
  const cities = query.data
    .flatMap((item): WeatherCityItem[] => {
      const data = parseCity(item.data);

      return data ? [{ ...data, id: item.id, key: item.key, cards: resolveCards(data.cards) }] : [];
    })
    .sort((a, b) => a.index - b.index);

  async function write(action: () => Promise<void>) {
    if (locked.current) {
      return false;
    }

    locked.current = true;
    setBusy(true);
    try {
      await action();

      return true;
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  function getCity(id: string) {
    const city = cities.find((item) => item.id === id);

    if (!city) {
      throw new Error('notFound');
    }

    return city;
  }

  async function persist(city: WeatherCity, id?: string) {
    await storage.update({
      ...(id ? { id } : {}),
      key: `${city.longitude},${city.latitude}`,
      data: serializeCity(city),
    });
  }

  function prepareCity(input: WeatherCityInput, existing?: WeatherCityItem): WeatherCity {
    if (!input.name.trim()) {
      throw new Error('nameRequired');
    }

    if (!String(input.longitude).trim() || !String(input.latitude).trim()) {
      throw new Error('coordinatesRequired');
    }

    const longitude = Number(input.longitude);
    const latitude = Number(input.latitude);

    if (
      !Number.isFinite(longitude) ||
      Math.abs(longitude) > 180 ||
      !Number.isFinite(latitude) ||
      Math.abs(latitude) > 90
    ) {
      throw new Error('locationInvalid');
    }

    if (cities.some((city) => city.id !== existing?.id && city.longitude === longitude && city.latitude === latitude)) {
      throw new Error('duplicate');
    }

    return {
      name: input.name.trim(),
      longitude,
      latitude,
      index: existing?.index ?? cities.length,
      cards: mergeCards(input.cards ?? existing?.cards),
    };
  }

  async function create(input: WeatherCityInput) {
    return write(async () => persist(prepareCity(input)));
  }

  async function updateCity(id: string, input: WeatherCityInput) {
    return write(async () => persist(prepareCity(input, getCity(id)), id));
  }

  async function reorder(ids: string[]) {
    return write(async () => {
      if (ids.length !== cities.length || new Set(ids).size !== cities.length) {
        throw new Error('orderInvalid');
      }

      const ordered = ids.map(getCity);

      for (const [index, city] of ordered.entries()) {
        await persist({ ...city, index }, city.id);
      }
    });
  }

  async function remove(id: string) {
    return write(async () => {
      getCity(id);
      await storage.delete({ id });
      for (const [index, city] of cities.filter((city) => city.id !== id).entries()) {
        await persist({ ...city, index }, city.id);
      }
    });
  }

  async function updateCard(id: string, cards: PluginWeatherCard[]) {
    return write(async () => {
      const city = getCity(id);

      await persist({ ...city, cards: mergeCards(cards) }, id);
    });
  }

  return {
    cities,
    cards,
    busy,
    isLoading: query.isLoading,
    error: query.error,
    create,
    updateCity,
    remove,
    reorder,
    updateCard,
  };
}
