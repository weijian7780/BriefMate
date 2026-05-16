import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DecodeScreen from './DecodeScreen';

const baseSignal = {
  id: 'gemini-2-5-flash',
  title: 'Gemini 2.5 Flash release',
  category: 'AI Tools',
  relevance: 91,
  priority: 'Check Today',
  stackMatch: 'Gemini API',
  whatHappened: 'Google released a faster Gemini model.',
  beginnerExplanation: 'Gemini is an AI model you can call from code.',
  whyMatters: 'You use Gemini API in your stack.',
  riskLevel: 'Low',
  recommendedAction: 'Check the model guide before changing code.',
  sourceUrl: 'https://github.com/google-gemini/cookbook/releases/tag/v1.0.0',
};

describe('DecodeScreen', () => {
  it('keeps only the bottom save action', () => {
    render(
      <DecodeScreen
        signal={{ ...baseSignal, resources: [] }}
        saved={false}
        useful={false}
        onBack={vi.fn()}
        onToggleSave={vi.fn()}
        onToggleUseful={vi.fn()}
        onMarkNotRelevant={vi.fn()}
      />
    );

    expect(screen.getAllByRole('button', { name: /^Save$/i })).toHaveLength(1);
  });

  it('renders related resources as working external links', () => {
    render(
      <DecodeScreen
        signal={{
          ...baseSignal,
          resources: ['Gemini API Docs', 'Model comparison guide', 'Gemini latest release'],
        }}
        saved={false}
        useful={false}
        onBack={vi.fn()}
        onToggleSave={vi.fn()}
        onToggleUseful={vi.fn()}
        onMarkNotRelevant={vi.fn()}
      />
    );

    expect(screen.getByRole('link', { name: /Gemini API Docs/i })).toHaveAttribute(
      'href',
      'https://ai.google.dev/gemini-api/docs'
    );
    expect(screen.getByRole('link', { name: /Model comparison guide/i })).toHaveAttribute(
      'href',
      'https://ai.google.dev/gemini-api/docs/models'
    );
    expect(screen.getByRole('link', { name: /Gemini latest release/i })).toHaveAttribute(
      'href',
      'https://github.com/google-gemini/cookbook/releases/tag/v1.0.0'
    );
    expect(screen.getByRole('link', { name: /Gemini API Docs/i })).toHaveAttribute('target', '_blank');
  });
});
