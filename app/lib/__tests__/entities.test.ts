import { describe, it, expect } from 'vitest';
import { extractEntities } from '../entities';

describe('extractEntities', () => {
  // --- Known entity matching ---

  it('extracts known world leaders', () => {
    const entities = extractEntities('Trump meets Putin at summit');
    const names = entities.map((e) => e.normalized);
    expect(names).toContain('trump');
    expect(names).toContain('putin');
  });

  it('extracts known countries', () => {
    const entities = extractEntities('Russia launches strikes on Ukraine');
    const names = entities.map((e) => e.normalized);
    expect(names).toContain('russia');
    expect(names).toContain('ukraine');
  });

  it('extracts known organizations', () => {
    const entities = extractEntities('NATO condemns attack, Pentagon responds');
    const names = entities.map((e) => e.normalized);
    expect(names).toContain('nato');
    expect(names).toContain('pentagon');
  });

  it('extracts multi-word known entities', () => {
    const entities = extractEntities('United Nations votes on Saudi Arabia sanctions');
    const names = entities.map((e) => e.normalized);
    expect(names).toContain('united nations');
    expect(names).toContain('saudi arabia');
  });

  // --- Entity type classification ---

  it('classifies leaders as person type', () => {
    const entities = extractEntities('Biden speaks at rally');
    const biden = entities.find((e) => e.normalized === 'biden');
    expect(biden?.type).toBe('person');
  });

  it('classifies countries as place type', () => {
    const entities = extractEntities('China imposes tariffs');
    const china = entities.find((e) => e.normalized === 'china');
    expect(china?.type).toBe('place');
  });

  it('classifies organizations as org type', () => {
    const entities = extractEntities('FBI investigates breach');
    const fbi = entities.find((e) => e.normalized === 'fbi');
    expect(fbi?.type).toBe('org');
  });

  // --- Number extraction ---

  it('extracts dollar amounts', () => {
    const entities = extractEntities('Fed raises rates, $2.5 billion package approved');
    const nums = entities.filter((e) => e.type === 'number');
    expect(nums.length).toBeGreaterThanOrEqual(1);
    expect(nums.some((n) => n.text.includes('$2.5'))).toBe(true);
  });

  it('extracts percentages', () => {
    const entities = extractEntities('Inflation falls to 3.2% in March');
    const nums = entities.filter((e) => e.type === 'number');
    expect(nums.some((n) => n.text.includes('3.2%'))).toBe(true);
  });

  // --- Quoted phrases ---

  it('extracts quoted phrases', () => {
    const entities = extractEntities('President says "peace is near" in address');
    const quotes = entities.filter((e) => e.type === 'quote');
    expect(quotes.length).toBe(1);
    expect(quotes[0].normalized).toContain('peace is near');
  });

  // --- Deduplication ---

  it('does not duplicate entities', () => {
    const entities = extractEntities('Trump Trump Trump Trump');
    const trumps = entities.filter((e) => e.normalized === 'trump');
    expect(trumps.length).toBe(1);
  });

  // --- Edge cases ---

  it('handles empty title', () => {
    const entities = extractEntities('');
    expect(entities).toEqual([]);
  });

  it('handles title with no entities', () => {
    const entities = extractEntities('The quick brown fox jumps over the lazy dog');
    // Might extract "Quick Brown Fox" as proper nouns, that's fine
    // Just verify it doesn't crash
    expect(Array.isArray(entities)).toBe(true);
  });

  // --- Conflict terms ---

  it('extracts conflict-related terms', () => {
    const entities = extractEntities('Ceasefire holds as airstrikes pause');
    const names = entities.map((e) => e.normalized);
    expect(names).toContain('ceasefire');
    expect(names).toContain('airstrikes');
  });

  // --- Economic terms ---

  it('extracts economic terms', () => {
    const entities = extractEntities('Fed signals rate cut amid inflation concerns');
    const names = entities.map((e) => e.normalized);
    expect(names).toContain('rate cut');
    expect(names).toContain('inflation');
  });
});
