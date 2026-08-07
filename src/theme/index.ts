import { createTheme, Card, Paper, Drawer, Modal } from '@mantine/core';
import { colors, shadows, transitions } from './tokens.ts';

export const theme = createTheme({
  primaryColor: 'cyanAccent',
  colors: {
    dark: colors.dark,
    deepSlate: colors.deepSlate,
    cyanAccent: colors.cyanAccent,
  },
  components: {
    Card: Card.extend({
      defaultProps: {
        bg: 'var(--container-charcoal, #1e293b)',
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: 'var(--border-contrast, #334155)',
          transition: `all ${transitions.fast}`,
        },
      },
    }),
    Paper: Paper.extend({
      defaultProps: {
        bg: 'var(--container-charcoal, #1e293b)',
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: 'var(--border-contrast, #334155)',
          transition: `all ${transitions.fast}`,
        },
      },
    }),
    Drawer: Drawer.extend({
      styles: {
        content: {
          backgroundColor: 'var(--container-charcoal, #1e293b)',
          borderColor: 'var(--border-contrast, #334155)',
        },
        header: {
          backgroundColor: 'var(--container-charcoal, #1e293b)',
        },
        overlay: {
          backgroundColor: 'var(--drawer-backdrop-bg, rgba(15, 23, 42, 0.4))',
          backdropFilter: 'var(--drawer-backdrop-blur, blur(8px))',
        },
      },
    }),
    Modal: Modal.extend({
      styles: {
        content: {
          backgroundColor: 'var(--container-charcoal, #1e293b)',
          borderColor: 'var(--border-contrast, #334155)',
        },
        header: {
          backgroundColor: 'var(--container-charcoal, #1e293b)',
        },
        overlay: {
          backgroundColor: 'var(--drawer-backdrop-bg, rgba(15, 23, 42, 0.4))',
          backdropFilter: 'var(--drawer-backdrop-blur, blur(8px))',
        },
      },
    }),
  },
  shadows,
});

export default theme;
