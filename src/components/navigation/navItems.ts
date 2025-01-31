import { NavItem } from './types';

export const mainNavItems: NavItem[] = [
  {
    label: 'Home',
    path: '/'
  },
  {
    label: 'Memberships',
    children: [
      { label: 'View All', path: '/memberships' },
      { label: 'App Workouts', path: '/memberships/app-workouts' },
      { label: 'Nutrition Coaching', path: '/memberships/nutrition' },
      { label: 'Plus Membership', path: '/memberships/plus' },
      { label: 'SHRED Program', path: '/memberships/shred' }
    ]
  },
  {
    label: 'Resources',
    children: [
      { label: 'Workout Library', path: '/resources/workouts' },
      { label: 'Meal Plans', path: '/resources/meal-plans' },
      { label: 'Macro Guide', path: '/resources/macros' },
      { label: 'Training Tips', path: '/resources/tips' },
      { label: 'Transformations', path: '/resources/transformations' },
      { label: 'Blog', path: '/blog' }
    ]
  },
  {
    label: 'Shop',
    path: '/shop',
    children: [
      { label: 'Memberships', path: '/shop/memberships' },
      { label: 'Gear', path: '/shop/gear', children: [
        { label: 'Apparel', path: '/shop/gear?category=apparel' },
        { label: 'Supplements', path: '/shop/gear?category=supplements' }
      ]}
    ]
  },
  {
    label: 'About',
    children: [
      { label: 'Our Story', path: '/about' },
      { label: 'Services', path: '/services' },
      { label: 'FAQ', path: '/faq' },
      { label: 'Contact', path: '/contact' }
    ]
  }
];