import 'react';

// React 18 passes lowercase `fetchpriority` straight through to the DOM (its camelCase prop only
// arrived in React 19); declare it so <img fetchpriority="high"> type-checks.
declare module 'react' {
  interface ImgHTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}
