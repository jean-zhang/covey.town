import { createMuiTheme } from '@material-ui/core';

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    sidebarWidth: number;
    sidebarMobileHeight: number;
    brand: string;
    footerHeight: number;
    mobileTopBarHeight: number;
    mobileFooterHeight: number;
  }

  // allow configuration using `createMuiTheme`
  interface ThemeOptions {
    sidebarWidth?: number;
    sidebarMobileHeight?: number;
    brand: string;
    footerHeight: number;
    mobileTopBarHeight: number;
    mobileFooterHeight: number;
  }
}

const defaultTheme = createMuiTheme();

export default (highlightColour: string) =>
  createMuiTheme({
    overrides: {
      MuiButton: {
        root: {
          borderRadius: '4px',
          textTransform: 'none',
          color: 'rgb(40, 42, 43)',
          fontSize: '0.9rem',
          transition: defaultTheme.transitions.create(
            ['background-color', 'box-shadow', 'border', 'color'],
            {
              duration: defaultTheme.transitions.duration.short,
            },
          ),
        },
        text: {
          padding: '6px 14px',
        },
        contained: {
          'boxShadow': 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlinedPrimary: {
          'border': '2px solid #027AC5',
          '&:hover': {
            border: '2px solid rgb(1, 85, 137)',
          },
        },
        startIcon: {
          marginRight: '6px',
        },
      },
      MuiTypography: {
        body1: {
          color: 'rgb(40, 42, 43)',
          fontSize: '0.9rem',
        },
      },
      MuiInputBase: {
        root: {
          fontSize: '0.9rem',
        },
      },
      MuiSelect: {
        root: {
          padding: '0.85em',
        },
      },
      MuiDialogActions: {
        root: {
          padding: '16px',
        },
      },
      MuiTextField: {
        root: {
          color: 'rgb(40, 42, 43)',
        },
      },
      MuiInputLabel: {
        root: {
          color: 'rgb(40, 42, 43)',
          fontSize: '1.1rem',
          marginBottom: '0.2em',
          fontWeight: 500,
        },
      },
      MuiOutlinedInput: {
        notchedOutline: {
          borderColor: 'rgb(136, 140, 142)',
        },
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
      },
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
    palette: {
      primary: {
        main: highlightColour,
      },
    },
    brand: highlightColour,
    footerHeight: 72,
    mobileFooterHeight: 56,
    sidebarWidth: 355,
    sidebarMobileHeight: 90,
    mobileTopBarHeight: 52,
  });
