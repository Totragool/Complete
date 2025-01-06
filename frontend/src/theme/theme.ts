export const theme = {
  token: {
    colorPrimary: '#4A5568',     // Primary color
    colorSuccess: '#48BB78',     // Success state (in stock)
    colorWarning: '#ED8936',     // Warning state (low stock)
    colorError: '#F56565',       // Error state (out of stock)
    colorBgContainer: '#ffffff', // Background color
    colorText: '#1A202C',       // Text color
    colorTextSecondary: '#4A5568', // Secondary text color
    
    // Border styles
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
    
    // Font settings
    fontSize: 16,
    fontSizeHeading1: 40,
    fontSizeHeading2: 32,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    
    // Component specific
    headerHeight: 64,
    footerHeight: 200,
  },
  components: {
    Button: {
      borderRadius: 8,
      paddingInline: 16,
    },
    Card: {
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    Layout: {
      bodyBg: '#f0f2f5',
      headerBg: '#001529',
      footerBg: '#001529',
    },
    Typography: {
      titleMarginBottom: 16,
    },
  },
};