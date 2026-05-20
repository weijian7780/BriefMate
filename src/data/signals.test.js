import { describe, expect, it, vi } from 'vitest';
import { CATEGORIES, getTodaySignals, personalizeSignal } from './signals';

describe('personalizeSignal', () => {
  it('recalculates relevance and risk from the user profile', () => {
    const signal = {
      id: 'cloudflare-agents',
      title: 'Announcing Claude Managed Agents on Cloudflare',
      category: 'Pricing / Policy',
      relevance: 38,
      riskLevel: 'Low',
      priority: 'Save for Later',
      stackMatch: 'Cloudflare',
      summary: 'Cloudflare now supports managed agent workloads.',
      whyMatters: 'Base collector explanation.',
      publishedAt: '2026-05-20T08:00:00.000Z',
    };

    const matchedProfile = {
      stack: ['Cloudflare', 'Next.js'],
      currentProject: 'Deploy a Cloudflare Worker for an AI agent prototype',
      learningGoal: 'Backend',
      deadline: 'This Week',
    };
    const unrelatedProfile = {
      stack: ['Flutter'],
      currentProject: 'Mobile habit tracker',
      learningGoal: 'Mobile',
      deadline: 'No Deadline',
    };

    const matched = personalizeSignal(matchedProfile, signal);
    const unrelated = personalizeSignal(unrelatedProfile, signal);

    expect(matched.relevance).toBeGreaterThan(unrelated.relevance);
    expect(matched.riskLevel).toBe('High');
    expect(matched.stackMatch).toBe('Cloudflare');
    expect(matched.whyMatters).toContain('Cloudflare');
    expect(matched.baseRelevance).toBe(38);
    expect(matched.baseRiskLevel).toBe('Low');
    expect(unrelated.riskLevel).toBe('Medium');
  });

  it('boosts relevance and risk when the update matches primary stack and preferred signal types', () => {
    const signal = {
      id: 'firebase-pricing',
      title: 'Firebase updates pricing for Authentication and Firestore',
      summary:
        'Firebase changed pricing rules that can affect projects using Authentication and Firestore.',
      category: 'Pricing / Policy',
      stackMatch: 'Firebase',
      relevance: 45,
      riskLevel: 'Low',
      priority: 'Save for Later',
      sourceName: 'Firebase Blog',
      publishedAt: '2026-05-20T01:00:00.000Z',
    };

    const broadProfile = {
      stack: ['Firebase'],
      currentProject: 'BriefMate prototype',
      learningGoal: 'Backend',
      deadline: 'No Deadline',
    };

    const focusedProfile = {
      ...broadProfile,
      primaryStack: ['Firebase'],
      signalPreferences: ['Pricing / Policy'],
      projectStage: 'Prototype',
      actionStyle: 'Tell me what to do',
      deadline: 'This Week',
    };

    const broad = personalizeSignal(broadProfile, signal);
    const focused = personalizeSignal(focusedProfile, signal);

    expect(focused.relevance).toBeGreaterThan(broad.relevance);
    expect(focused.riskLevel).toBe('High');
    expect(focused.personalization.primaryStackMatch).toBe('Firebase');
    expect(focused.personalization.signalPreferenceMatch).toBe('Pricing / Policy');
    expect(focused.recommendedAction).toMatch(/test|usage|limit|fallback/i);
  });

  it('reduces relevance for muted topics even when the category is generally preferred', () => {
    const signal = {
      id: 'crypto-sdk',
      title: 'Crypto wallet SDK releases new developer tooling',
      summary: 'A crypto wallet SDK released new tools for app developers.',
      category: 'Developer Tools',
      stackMatch: 'Node.js',
      relevance: 70,
      riskLevel: 'Low',
      priority: 'Review This Week',
      sourceName: 'Developer Blog',
      publishedAt: '2026-05-20T02:00:00.000Z',
    };

    const interestedProfile = {
      stack: ['Node.js'],
      primaryStack: ['Node.js'],
      signalPreferences: ['Developer Tools'],
      mutedTopics: [],
      currentProject: 'Node.js student project',
      learningGoal: 'Backend',
      deadline: 'This Week',
    };
    const mutedProfile = {
      ...interestedProfile,
      mutedTopics: ['Crypto'],
    };

    const interested = personalizeSignal(interestedProfile, signal);
    const muted = personalizeSignal(mutedProfile, signal);

    expect(muted.relevance).toBeLessThan(interested.relevance);
    expect(muted.personalization.mutedTopicMatch).toBe('Crypto');
  });

  it('turns mobile SDK event signals into specific beginner impact and action text', () => {
    const signal = {
      id: 'google-tensor-ml-sdk-beta',
      title: 'Google Tensor ML SDK graduates to Beta at Google I/O',
      category: 'Events',
      relevance: 64,
      riskLevel: 'Medium',
      priority: 'Review This Week',
      stackMatch: 'No stack match',
      summary:
        'The Google Tensor ML SDK is graduating to its Beta phase, allowing developers to build and deploy high-performance machine learning models directly onto the TPU of Google Pixel 10 devices.',
      whatHappened:
        'The Google Tensor ML SDK is graduating to its Beta phase, allowing developers to build and deploy high-performance machine learning models directly onto the TPU of Google Pixel 10 devices.',
      beginnerExplanation:
        'Google I/O official updates published an update in Events. BriefMate converts it into a student-friendly signal so you can decide whether it matters to your project.',
      whyMatters:
        'This source tracks Events updates. If it matches your stack, it can affect what you learn, build, deploy, or secure.',
      recommendedAction:
        'Open the official source, verify the details, then decide whether to save, ignore, or apply it to your project.',
      publishedAt: '2026-05-20T08:00:00.000Z',
    };

    const result = personalizeSignal({
      stack: ['Flutter'],
      currentProject: 'Android mobile app with on-device AI features',
      learningGoal: 'Mobile',
      deadline: 'This Week',
    }, signal);

    expect(result.beginnerExplanation).toMatch(/on-device|Pixel|mobile/i);
    expect(result.beginnerExplanation).not.toMatch(/official updates published/i);
    expect(result.whyMatters).toMatch(/mobile|Android|on-device|latency|privacy/i);
    expect(result.recommendedAction).toMatch(/prototype|compare|mobile|Android/i);
    expect(result.recommendedAction).not.toMatch(/Open the official source/i);
  });

  it('strips feed HTML from What Happened and keeps one clear event', () => {
    const signal = {
      id: 'aws-sagemaker-hyperpod-capture',
      title: 'Amazon SageMaker HyperPod now supports data capture for inference workloads',
      category: 'Backend / Cloud',
      relevance: 49,
      riskLevel: 'Low',
      priority: 'Review This Week',
      stackMatch: 'AWS',
      summary:
        '<p>Amazon SageMaker HyperPod now supports data capture for inference workloads, enabling customers to record inference request and response payloads for model monitoring, compliance, debugging, and offline analysis.</p><p>Organizations can use this for later analysis.</p>',
      whatHappened:
        '<p>Amazon SageMaker HyperPod now supports data capture for inference workloads, enabling customers to record inference request and response payloads for model monitoring, compliance, debugging, and offline analysis.</p><p>Organizations can use this for later analysis.</p>',
      beginnerExplanation: '',
      whyMatters: '',
      recommendedAction: '',
      publishedAt: '2026-05-20T08:00:00.000Z',
    };

    const result = personalizeSignal({
      stack: ['AWS'],
      currentProject: 'Cloud backend API for AI inference',
      learningGoal: 'Backend',
      deadline: '2 Weeks',
    }, signal);

    expect(result.whatHappened).toContain('Amazon SageMaker HyperPod now supports data capture');
    expect(result.whatHappened).not.toMatch(/<\/?p>/i);
    expect(result.whatHappened).not.toContain('Organizations can use this');
    expect(result.whatHappened.length).toBeLessThanOrEqual(240);
  });

  it('applies the four-section method to pricing and policy signals', () => {
    const signal = {
      id: 'firebase-pricing-policy',
      title: 'Firebase updates free tier limits for authentication projects',
      category: 'Pricing / Policy',
      relevance: 78,
      riskLevel: 'High',
      priority: 'Check Today',
      stackMatch: 'Firebase',
      summary:
        'Firebase changed free tier limits for authentication and database usage, which can affect prototypes that grow beyond small demo traffic.',
      whatHappened:
        'Firebase changed free tier limits for authentication and database usage, which can affect prototypes that grow beyond small demo traffic.',
      beginnerExplanation:
        'Firebase Blog published an update in Pricing / Policy. BriefMate converts it into a student-friendly signal so you can decide whether it matters to your project.',
      whyMatters:
        'This source tracks Pricing / Policy updates. If it matches your stack, it can affect what you learn, build, deploy, or secure.',
      recommendedAction:
        'Open the official source, verify the details, then decide whether to save, ignore, or apply it to your project.',
      publishedAt: '2026-05-20T08:00:00.000Z',
    };

    const result = personalizeSignal({
      stack: ['Firebase'],
      currentProject: 'FYP prototype using Firebase Authentication and Firestore',
      learningGoal: 'Backend',
      deadline: 'This Week',
    }, signal);

    expect(result.whatHappened).toMatch(/Firebase changed free tier limits/i);
    expect(result.beginnerExplanation).toMatch(/cost|limits|free prototype/i);
    expect(result.whyMatters).toMatch(/Firebase|affordable|cost/i);
    expect(result.recommendedAction).toMatch(/usage limits|fallback service/i);
    expect(result.recommendedAction).not.toMatch(/Open the official source/i);
  });
});

describe('getTodaySignals', () => {
  it('only returns fresh live signals for the Today page', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-19T12:00:00.000Z'));

    const signals = [
      {
        id: 'old-gemini',
        title: 'Gemini 2.5 Flash release',
        relevance: 91,
        priority: 'Check Today',
        stackMatch: 'Gemini API',
        publishedAt: '2026-05-16T00:00:00.000Z',
      },
      {
        id: 'fresh-ai',
        title: 'AI-driven development - It is a spectrum',
        relevance: 62,
        priority: 'Save for Later',
        stackMatch: 'No stack match',
        publishedAt: '2026-05-19T09:14:33.000Z',
      },
    ];

    expect(getTodaySignals({ stack: ['Gemini API'] }, signals)).toEqual([
      expect.objectContaining({ id: 'fresh-ai' }),
    ]);
    vi.useRealTimers();
  });

  it('prioritizes signals by personalized relevance for the Today page', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-20T12:00:00.000Z'));

    const signals = [
      {
        id: 'unrelated-security',
        title: 'Critical Kubernetes vulnerability',
        category: 'Security',
        relevance: 90,
        priority: 'Check Today',
        stackMatch: 'Kubernetes',
        publishedAt: '2026-05-20T09:00:00.000Z',
      },
      {
        id: 'matched-next',
        title: 'Next.js routing update',
        category: 'Web Dev',
        relevance: 40,
        priority: 'Save for Later',
        stackMatch: 'Next.js',
        publishedAt: '2026-05-20T08:00:00.000Z',
      },
    ];

    const today = getTodaySignals(
      {
        stack: ['Next.js'],
        currentProject: 'Student dashboard built with Next.js',
        learningGoal: 'Frontend',
        deadline: 'This Week',
      },
      signals,
    );

    expect(today[0]).toEqual(expect.objectContaining({ id: 'matched-next' }));
    vi.useRealTimers();
  });

  it('can sort already personalized signals without recalculating them', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-20T12:00:00.000Z'));

    const today = getTodaySignals(
      { stack: ['Unrelated'] },
      [
        {
          id: 'pre-ranked',
          title: 'Already ranked signal',
          category: 'Developer Tools',
          relevance: 99,
          priority: 'Check Today',
          stackMatch: 'Precomputed Stack',
          personalization: { stackMatch: 'Precomputed Stack' },
          publishedAt: '2026-05-20T08:00:00.000Z',
        },
        {
          id: 'lower-ranked',
          title: 'Lower ranked signal',
          category: 'Security',
          relevance: 50,
          priority: 'Review This Week',
          stackMatch: 'No stack match',
          personalization: {},
          publishedAt: '2026-05-20T09:00:00.000Z',
        },
      ],
      { personalized: true },
    );

    expect(today[0]).toEqual(
      expect.objectContaining({
        id: 'pre-ranked',
        relevance: 99,
        stackMatch: 'Precomputed Stack',
      }),
    );
    vi.useRealTimers();
  });
});

describe('signal categories', () => {
  it('supports broad technology signal filters', () => {
    expect(CATEGORIES).toEqual([
      'All',
      'AI / Models',
      'Web Dev',
      'Backend / Cloud',
      'Mobile',
      'Database',
      'Security',
      'Events',
      'Pricing / Policy',
      'Developer Tools',
    ]);
  });
});
