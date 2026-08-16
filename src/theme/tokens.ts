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
  stoneAccent: MantineColorTuple;
  dark: MantineColorTuple;
} = {
  deepSlate: [
    '#f8fafc', // 0: text primary / slate 50
    '#f1f5f9', // 1: slate 100
    '#e2e8f0', // 2: slate 200
    '#cbd5e1', // 3: slate 300
    '#94a3b8', // 4: text secondary / slate 400
    '#44403c', // 5: border popover / stone 700
    '#292524', // 6: border contrast / stone 800
    '#22222a', // 7: popover charcoal (Layer 3)
    '#1a1a20', // 8: card charcoal (Layer 2)
    '#0e0e11', // 9: bg deep slate / canvas base (Layer 0)
  ],
  stoneAccent: [
    '#f5f5f4', // 0
    '#e7e5e4', // 1
    '#d6d3d1', // 2
    '#a8a29e', // 3
    '#78716c', // 4
    '#57534e', // 5
    '#44403c', // 6
    '#292524', // 7
    '#1c1917', // 8
    '#0c0a09', // 9
  ],
  dark: [
    '#f8fafc', // 0: text primary
    '#f1f5f9', // 1
    '#e2e8f0', // 2
    '#cbd5e1', // 3
    '#94a3b8', // 4: text secondary
    '#44403c', // 5: border popover (Layer 3 border)
    '#292524', // 6: border contrast (Layer 2 border)
    '#22222a', // 7: popover charcoal (Layer 3)
    '#1a1a20', // 8: card charcoal (Layer 2)
    '#0e0e11', // 9: bg deep slate (Layer 0)
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
