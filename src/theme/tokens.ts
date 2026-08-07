export type MantineColorTuple = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];

export const colors: {
  deepSlate: MantineColorTuple;
  cyanAccent: MantineColorTuple;
  dark: MantineColorTuple;
} = {
  deepSlate: [
    '#f8fafc', // 0: text primary / slate 50
    '#f1f5f9', // 1: slate 100
    '#e2e8f0', // 2: slate 200
    '#cbd5e1', // 3: slate 300
    '#94a3b8', // 4: text secondary / slate 400
    '#64748b', // 5: slate 500
    '#475569', // 6: slate 600
    '#334155', // 7: border contrast / slate 700
    '#1e293b', // 8: container charcoal / slate 800
    '#0f172a', // 9: bg deep slate / slate 900
  ],
  cyanAccent: [
    '#ecfeff', // 0
    '#cffafe', // 1
    '#a5f3fc', // 2
    '#67e8f9', // 3
    '#22d3ee', // 4
    '#06b6d4', // 5: accent cyan (#06b6d4)
    '#0891b2', // 6
    '#0284c7', // 7: accent sky (#0284c7)
    '#0369a1', // 8
    '#075985', // 9
  ],
  dark: [
    '#f8fafc', // 0
    '#f1f5f9', // 1
    '#e2e8f0', // 2
    '#cbd5e1', // 3
    '#94a3b8', // 4
    '#64748b', // 5
    '#475569', // 6
    '#334155', // 7: border contrast
    '#1e293b', // 8: container charcoal
    '#0f172a', // 9: bg deep slate
  ],
};

export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
};

export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
};
