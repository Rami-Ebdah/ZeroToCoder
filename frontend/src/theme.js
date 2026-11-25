const commonTheme = {
  font: {
    family: "'Cairo', sans-serif",
    size: "16px",
  },
  radius: "12px",
};

const lightTheme = {
  ...commonTheme,
  mode: "light",
  background: "#ffffff",
  text: "#1f2937",
  cardBg: "#f3f4f6",
  progressBg: "#e5e7eb",

  colors: {
    cardBackground: "#ffffff",
    cardShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    cardHoverShadow: "0 8px 15px rgba(0, 0, 0, 0.15)",
    primaryText: "#2c3e50",
    primary: "#3B82F6",
    secondary: "#8B5CF6",
    delete: "#EF4444",
    edit: "#10B981",
    card: "#FFFFFF",
    table: "#FFFFFF",
    border: "#E5E7EB",
    background: "#f9fafb",
    text: "#1f2937",
    itemBg: "#fff",
    "--bg-gradient": "linear-gradient(135deg, #d0bfff, #f3e8ff)",
    "--bgHeader": "#ffffff",
    "--title": "#1a1a1a",
    "--subtitle": "#555",
    "--secondary": "#f9f9f9",
    "--border": "#ddd",
    "--blue": "#007bff",
    "--red": "#dc3545",
    "--hoverBg": "#e6f0ff",
    "--dropdown-bg": "#ffffff",
  },
};

const darkTheme = {
  ...commonTheme,
  mode: "dark",
  background: "#1f2937",
  text: "#f9fafb",
  cardBg: "#374151",
  progressBg: "#4b5563",
  colors: {
    cardBackground: "#1e1e1e",
    cardShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
    cardHoverShadow: "0 8px 15px rgba(0, 0, 0, 0.4)",
    primaryText: "#f0f0f0",
    primary: "#60A5FA",
    secondary: "#A78BFA",
    delete: "#F87171",
    edit: "#34D399",
    card: "#374151",
    table: "#374151",
    border: "#4B5563",
    background: "#111827",
    text: "#f9fafb",
    itemBg: "#1f2937",
    "--bg-gradient": "linear-gradient(135deg, #1e1e2f, #3e3a5e)",
    "--text": "#fff",
    "--bgHeader": "#1e1e2f",
    "--title": "#f0f0f0",
    "--subtitle": "#aaa",
    "--secondary": "#2c2c3e",
    "--border": "#444",
    "--blue": "#66b2ff",
    "--red": "#f87171",
    "--hoverBg": "#333a52",
    "--dropdown-bg": "#2a2a3d",
  },
};

export { lightTheme, darkTheme };

// export { lightTheme, darkTheme };

