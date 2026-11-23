import { describe, expect, it } from 'vitest';
import stories from '../../public/data/fires/stories.json';
import { glossary, GLOSSARY_GROUPS } from './glossary';
import { hints, hintsByDate, inTopic, whenText } from './hints';
import { variableById } from './variables';

const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

describe('events', () => {
  it('every event says when, where, why and what followed, in both languages', () => {
    for (const h of hints) {
      expect(h.when.from, h.id).toMatch(DATE);
      if (h.when.to) {
        expect(h.when.to, h.id).toMatch(DATE);
        expect(h.when.to >= h.when.from, h.id).toBe(true);
      }
      for (const t of [h.title, h.place, h.text, ...h.causes, ...h.effects]) {
        expect(t.uk.length, h.id).toBeGreaterThan(3);
        expect(t.en.length, h.id).toBeGreaterThan(3);
      }
      expect(h.causes.length, h.id).toBeGreaterThan(0);
      expect(h.effects.length, h.id).toBeGreaterThan(0);
      expect(h.sources.length, h.id).toBeGreaterThan(0);
    }
  });

  it('ids are unique', () => {
    expect(new Set(hints.map((h) => h.id)).size).toBe(hints.length);
  });

  it('an event shown on the globe asks for a day its layer has', () => {
    for (const h of hints.filter((x) => x.show)) {
      const img = variableById[h.show!.layer].imagery;
      expect(img, h.id).toBeDefined();
      expect(h.show!.date >= img!.first.slice(0, h.show!.date.length), h.id).toBe(true);
      expect(h.show!.date <= img!.last, h.id).toBe(true);
    }
  });

  it('every fire story an event plays exists', () => {
    const ids = new Set(stories.stories.map((s) => s.id));
    for (const h of hints.filter((x) => x.storyId)) expect(ids.has(h.storyId!), h.id).toBe(true);
  });

  it('the Los Angeles fires and the blackout comparison are there', () => {
    const la = hints.find((h) => h.id === 'la-2025')!;
    expect(whenText(la.when, 'uk')).toBe('7–31 січня 2025');
    expect(la.storyId).toBe('la-2025');
    expect(hints.find((h) => h.id === 'kyiv-blackout')!.blackout).toBe(true);
  });

  it('the news list is newest first, and Ukraine has its own topic', () => {
    for (let i = 1; i < hintsByDate.length; i++) expect(hintsByDate[i - 1].when.from >= hintsByDate[i].when.from).toBe(true);
    expect(hints.filter((h) => inTopic(h, 'ukraine')).length).toBeGreaterThanOrEqual(5);
  });
});

describe('dates in words', () => {
  it('one day, a span within a month, across months and across years', () => {
    expect(whenText({ from: '2023-06-06' }, 'uk')).toBe('6 червня 2023');
    expect(whenText({ from: '2025-01-07', to: '2025-01-31' }, 'en')).toBe('7–31 January 2025');
    expect(whenText({ from: '2021-07-29', to: '2021-08-20' }, 'uk')).toBe('29 липня – 20 серпня 2021');
    expect(whenText({ from: '2022-02-24', to: '2023-06-06' }, 'en')).toBe('24 February 2022 – 6 June 2023');
  });

  it('months and years when the day is not known', () => {
    expect(whenText({ from: '2020-03' }, 'uk')).toBe('березень 2020');
    expect(whenText({ from: '2022-06', to: '2022-08' }, 'uk')).toBe('червень–серпень 2022');
    expect(whenText({ from: '1960', to: '2014' }, 'en')).toBe('1960–2014');
  });
});

describe('glossary', () => {
  it('every term has a group, both languages and something beyond the definition', () => {
    const groups = new Set(GLOSSARY_GROUPS.map((g) => g.id));
    for (const g of glossary) {
      expect(groups.has(g.group), g.id).toBe(true);
      expect(g.text.uk && g.text.en, g.id).toBeTruthy();
      expect(!!(g.formula || g.values || g.example), g.id).toBe(true);
    }
    expect(new Set(glossary.map((g) => g.id)).size).toBe(glossary.length);
  });
});
