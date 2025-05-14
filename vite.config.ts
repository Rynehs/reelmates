
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Configure to work with React 17
      jsxImportSource: undefined, // Use React 17's JSX transform
      // @ts-ignore - SWC options for React 17 compatibility
      swcOptions: {
        jsc: {
          transform: {
            react: {
              runtime: "classic"
            }
          }
        }
      }
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['avataaars'] // Exclude avataaars from optimization to avoid issues
  }
}));
