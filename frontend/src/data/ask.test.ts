import { describe, expect, it } from 'vitest';
import { parseQuestion, stems } from './ask';

describe('reading a question', () => {
  it('topic and place in Ukrainian', () => {
    expect(parseQuestion('Чи теплішає в Черкасах?')).toMatchObject({ topic: 'warming', places: ['Черкасах'] });
    expect(parseQuestion('Яке зараз повітря у Києві?')).toMatchObject({ topic: 'air', when: 'now', places: ['Києві'] });
    expect(parseQuestion('Де зараз горить в Україні?')).toMatchObject({ topic: 'fires', places: ['Україні'] });
    expect(parseQuestion('Чи стало більше дощів у Львові')).toMatchObject({ topic: 'rain', places: ['Львові'] });
    expect(parseQuestion('Яка погода завтра в Одесі?')).toMatchObject({ topic: 'weather', when: 'tomorrow', places: ['Одесі'] });
  });

  it('topic and place in English, two-word names', () => {
    expect(parseQuestion('Is it getting warmer in New York?')).toMatchObject({ topic: 'warming', places: ['New York', 'New', 'York'] });
    expect(parseQuestion('air quality in Warsaw now')).toMatchObject({ topic: 'air', when: 'now', places: ['Warsaw'] });
  });

  it('the war and the ice go to their own sections; "my city" is noticed', () => {
    expect(parseQuestion('Що сталося з Каховкою?').topic).toBe('war');
    expect(parseQuestion('Чи тане лід в Арктиці?').topic).toBe('ice');
    expect(parseQuestion('Яке повітря в моєму місті?')).toMatchObject({ topic: 'air', mine: true });
  });

  it('a question it cannot read has no topic', () => {
    expect(parseQuestion('Привіт!').topic).toBeNull();
  });
});

describe('case endings', () => {
  it('takes off the endings of a place name', () => {
    expect(stems('Черкасах')).toContain('Черкас');
    expect(stems('Одесі')).toContain('Одес');
    expect(stems('Україні')).toContain('Україн');
    expect(stems('Київ')).toEqual(['Київ']);
    // The name-form comes back first: Харкова -> Харків, Львові -> Львів, Києві -> Київ.
    expect(stems('Харкова')[0]).toBe('Харків');
    expect(stems('Львові')[0]).toBe('Львів');
    expect(stems('Києві')[0]).toBe('Київ');
  });
});
