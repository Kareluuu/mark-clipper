import { ThemeSupa } from '@supabase/auth-ui-shared'

// Supabase Auth UI 主题配置
export const authTheme = {
  theme: ThemeSupa,
  variables: {
    default: {
      colors: {
        brand: '#18181b',
        brandAccent: '#27272a',
        brandButtonText: 'white',
        defaultButtonBackground: '#fafafa',
        defaultButtonBackgroundHover: '#f4f4f5',
        defaultButtonBorder: '#e4e4e7',
        defaultButtonText: '#18181b',
        dividerBackground: '#e4e4e7',
        inputBackground: '#fafafa',
        inputBorder: '#e4e4e7',
        inputBorderHover: '#d4d4d8',
        inputBorderFocus: '#18181b',
        inputText: '#18181b',
        inputLabelText: '#52525b',
        inputPlaceholder: '#a1a1aa',
        messageText: '#52525b',
        messageTextDanger: '#ef4444',
        anchorTextColor: '#18181b',
        anchorTextHoverColor: '#27272a',
      },
      space: {
        spaceSmall: '4px',
        spaceMedium: '8px',
        spaceLarge: '16px',
        labelBottomMargin: '8px',
        anchorBottomMargin: '4px',
        emailInputSpacing: '4px',
        buttonPadding: '10px 15px',
        inputPadding: '10px 15px',
      },
      fontSizes: {
        baseBodySize: '14px',
        baseInputSize: '14px',
        baseLabelSize: '14px',
        baseButtonSize: '14px',
      },
      fonts: {
        bodyFontFamily: `'Geist', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`,
        buttonFontFamily: `'Geist', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`,
        inputFontFamily: `'Geist', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`,
        labelFontFamily: `'Geist', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`,
      },
      borderWidths: {
        buttonBorderWidth: '1px',
        inputBorderWidth: '1px',
      },
      radii: {
        borderRadiusButton: '6px',
        buttonBorderRadius: '6px',
        inputBorderRadius: '6px',
      },
    },
  },
} 