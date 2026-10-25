'use client';

import { Component, createRef } from 'react';
import type { Locale } from '@/i18n/config';
import type { WeatherCityItem } from '../types';
import { weatherCards, type WeatherCardDefinition } from './WeatherCard';

type WeatherLayoutProps = { city: WeatherCityItem; locale: Locale };
type WeatherGridProps = WeatherLayoutProps & { cards: WeatherCardDefinition[] };
type CardPosition = { element: HTMLElement; x: number; y: number };
type LayoutSnapshot = Map<string, CardPosition>;

class WeatherGrid extends Component<WeatherGridProps, Record<string, never>, LayoutSnapshot | null> {
  private grid = createRef<HTMLDivElement>();
  private animations: Animation[] = [];

  private measure(cards: WeatherCardDefinition[]): LayoutSnapshot {
    const positions: LayoutSnapshot = new Map();
    const grid = this.grid.current;

    if (!grid) {
      return positions;
    }

    const origin = grid.getBoundingClientRect();

    cards.forEach((card, index) => {
      const element = grid.children[index];

      if (element instanceof HTMLElement) {
        const rect = element.getBoundingClientRect();

        positions.set(card.type, { element, x: rect.left - origin.left, y: rect.top - origin.top });
      }
    });

    return positions;
  }

  getSnapshotBeforeUpdate(previous: WeatherGridProps): LayoutSnapshot | null {
    if (
      previous.city.id !== this.props.city.id ||
      (previous.cards.length === this.props.cards.length &&
        previous.cards.every((card, index) => card.type === this.props.cards[index]?.type))
    ) {
      return null;
    }

    return this.measure(previous.cards);
  }

  componentDidUpdate(
    _previousProps: WeatherGridProps,
    _previousState: Readonly<Record<string, never>>,
    snapshot: LayoutSnapshot | null,
  ) {
    if (!snapshot) {
      return;
    }

    this.cancelAnimations();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const positions = this.measure(this.props.cards);

    for (const [type, { element, x, y }] of positions) {
      const previous = snapshot.get(type);

      if (!previous || typeof element.animate !== 'function') {
        continue;
      }

      const deltaX = previous.x - x;
      const deltaY = previous.y - y;

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
        continue;
      }

      this.animations.push(
        element.animate([{ transform: `translate(${deltaX}px, ${deltaY}px)` }, { transform: 'translate(0, 0)' }], {
          duration: 360,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }),
      );
    }
  }

  componentWillUnmount() {
    this.cancelAnimations();
  }

  private cancelAnimations() {
    for (const animation of this.animations) {
      animation.cancel();
    }

    this.animations = [];
  }

  render() {
    const { cards, city, locale } = this.props;

    return (
      <div ref={this.grid} className="grid w-full min-w-0 grid-flow-row-dense auto-rows-[25cqw] grid-cols-4">
        {cards.map(({ type, component: Card }) => (
          <Card key={type} city={city} locale={locale} />
        ))}
      </div>
    );
  }
}

export function WeatherLayout({ city, locale }: WeatherLayoutProps) {
  const cards = city.cards
    .filter((card) => card.status)
    .flatMap((card) => {
      const definition = weatherCards.find((definition) => definition.type === card.type);

      return definition ? [definition] : [];
    });

  return (
    <div className="@container w-full min-w-0">
      <WeatherGrid cards={cards} city={city} locale={locale} />
    </div>
  );
}
