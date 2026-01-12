export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },
  privacy: {
    path: '/privacy',
    getHref: () => '/privacy',
  },

  auth: {
    register: {
      path: '/auth/register',
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    login: {
      path: '/auth/login',
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },

  app: {
    root: {
      path: '/app',
      getHref: () => '/app',
    },
    dashboard: {
      path: 'dashboard',
      getHref: () => '/app/dashboard',
    },
    cases: {
      path: 'cases',
      getHref: () => '/app/cases',
    },
    'case-random': {
      path: 'cases/random/attempt',
      getHref: () => '/app/cases/random/attempt',
    },
    'case-attempt': {
      path: 'cases/:caseId/attempt',
      getHref: (id: string) => `/app/cases/${id}/attempt`,
    },
    'case-review': {
      path: 'cases/:caseId/review',
      getHref: (id: string) => `/app/cases/${id}/review`,
    },
    'case-drill': {
      path: 'cases/drill',
      getHref: () => `/app/cases/drill`,
    },
    profile: {
      path: 'profile',
      getHref: () => '/app/profile',
    },
  },
} as const;
