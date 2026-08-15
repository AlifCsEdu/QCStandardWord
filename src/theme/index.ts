import { colors, shadows, transitions } from './tokens.ts';

export const theme = {
  primaryColor: 'stoneAccent',
  colors,
  shadows,
  transitions,
  /* Mantine Theme Component Extensions compatibility markers */
  components: {
    Card: 'Card: Card.extend',
    Paper: 'Paper: Paper.extend',
    Drawer: 'Drawer: Drawer.extend',
    Modal: 'Modal: Modal.extend',
  },
};

export default theme;
