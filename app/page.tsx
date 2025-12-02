"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Menu,
  MenuItem,
  IconButton,
  Snackbar
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  KeyboardArrowDown as ArrowDownIcon,
  ArrowForward
} from "@mui/icons-material";
import { JSX } from "@emotion/react/jsx-runtime";

interface GeneratedComponent {
  id: number;
  description: string;
  framework: string;
  styling: string;
  code: string;
  timestamp: string;
}

interface SnackbarState {
  open: boolean;
  msg: string;
}

export default function ComponentBuilderNew(): JSX.Element {
  const [input, setInput] = useState<string>("");
  const [framework, setFramework] = useState<string>("React");
  const [styling, setStyling] = useState<string>("Tailwind");
  const [latest, setLatest] = useState<GeneratedComponent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, msg: "" });
  const [charCount, setCharCount] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const prompts: string[] = [
    "Create a responsive search bar with keyboard navigation",
    "Design a compact profile card with avatar and actions",
    "Build an accessible modal with focus trap and close on Esc",
  ];

  const frameworks: string[] = ["React", "Vue", "Svelte"];
  const styles: string[] = ["Tailwind", "CSS", "Styled-components"];

  useEffect(() => {
    if (latest) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [latest]);

  const showSnackbar = (msg: string): void => {
    setSnackbar({ open: true, msg });
  };

  const handleDropdownOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = (): void => {
    setAnchorEl(null);
  };

  // Use local API route to call HF (or whichever provider you configured)
  const onGenerate = async (): Promise<void> => {
    if (!input.trim() || loading) return;
    setLoading(true);
    const description = input.trim();
    setInput("");
    setCharCount(0);

    const message = `You are an expert frontend developer. Generate a complete, production-ready ${framework} component based on this description: "${description}"

Requirements:
- Framework: ${framework}
- Styling: ${styling}
- Fully functional, accessible, responsive, with comments and error handling.

Return ONLY the component code.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("API error:", txt);
        throw new Error("Generation failed");
      }

      const json = await res.json();
      // api/chat returns { response: "..." } (see api route)
      let code = json.response || "";

      // Some models wrap code in triple backticks — strip them safely
      code = code
        .replace(/^\s*```[a-zA-Z0-9\-]*\n?/, "")
        .replace(/```$/g, "")
        .trim();

      setLatest({
        id: Date.now(),
        description,
        framework,
        styling,
        code,
        timestamp: new Date().toLocaleString(),
      });
      showSnackbar("Component generated successfully!");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to generate component");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (value.length <= 1000) {
      setInput(value);
      setCharCount(value.length);
    }
  };

  const copyCode = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      showSnackbar("Copied to clipboard!");
    } catch (err) {
      showSnackbar("Failed to copy");
    }
  };

  const downloadCode = (item: GeneratedComponent): void => {
    const ext = item.framework === "React" ? "tsx" : item.framework === "Vue" ? "vue" : "svelte";
    const blob = new Blob([item.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Component.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showSnackbar("Download started");
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onGenerate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [input, framework, styling, loading]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f1f1f1", py: 6 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: "left", mb: 4 }}>
          <Typography variant="h2" sx={{ fontWeight: 600, color: "#000", fontFamily: "var(--font-poppins)" }}>
            Hi there, <span style={{ color: "#7c3aed" }}>User !</span>
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 500, mb: 2, color: "#000", fontFamily: "var(--font-poppins)" }}>
            What would <span style={{ color: "#b43aedff" }}>like to build?</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
            Use one of the most common prompts
            <br />
            below or use your own to begin
          </Typography>
        </Box>

        {/* Prompt Cards */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {prompts.map((prompt, idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                p: 3,
                cursor: "pointer",
                border: "1px solid #e0e0e0",
                borderRadius: 3,
                transition: "all 0.2s",
                fontFamily: "var(--font-jetbrains-mono)",
                minHeight: 100,
                flex: "1 1 calc(25% - 6px)",
                minWidth: 180,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                "&:hover": {
                  borderColor: "#7c3aed",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.1)",
                },
              }}
              onClick={() => setInput(prompt)}
              role="button"
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") setInput(prompt);
              }}
            >
              <Typography variant="body2" sx={{ fontSize: "0.875rem", lineHeight: 1.5, color: "#333" }}>
                {prompt}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: "#f3e8ff",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#7c3aed",
                  }}
                >
                  <ArrowForward sx={{ fontSize: 16 }} />
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Main Input */}
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 3 }}>
          <TextField
            value={input}
            onChange={handleInputChange}
            placeholder="Build whatever you want...."
            fullWidth
            multiline
            minRows={4}
            disabled={loading}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
          fontSize: "1rem",
          "& textarea::placeholder": {
            color: "#bdbdbd",
            opacity: 1,
          },
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              mt: 2,
              pt: 2,
              borderTop: "1px solid #f0f0f0",
              gap: 2,
            }}
          >
            {/* Dropdown Button */}
            <Button
              variant="outlined"
              onClick={handleDropdownOpen}
              endIcon={<ArrowDownIcon />}
              startIcon={<SettingsIcon />}
              sx={{
          textTransform: "none",
          color: "#666",
          borderColor: "#e0e0e0",
          bgcolor: "#fff",
          "&:hover": {
            borderColor: "#d0d0d0",
            bgcolor: "#fafafa",
          },
              }}
              aria-controls={Boolean(anchorEl) ? "component-options" : undefined}
              aria-haspopup="true"
            >
              {framework} / {styling}
            </Button>

            <Menu
              id="component-options"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleDropdownClose}
              PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            border: "1px solid #e0e0e0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #f0f0f0" }}>
          <Typography variant="caption" sx={{ color: "#999", textTransform: "uppercase", fontWeight: 600 }}>
            Framework
          </Typography>
          {frameworks.map((fw) => (
            <MenuItem
              key={fw}
              onClick={() => {
                setFramework(fw);
                handleDropdownClose();
              }}
              selected={framework === fw}
              sx={{
                fontSize: "0.875rem",
                px: 0,
                py: 0.5,
                minHeight: "auto",
                "&.Mui-selected": {
            bgcolor: "transparent",
            color: "#7c3aed",
            fontWeight: 600,
                },
              }}
            >
              {fw}
            </MenuItem>
          ))}
              </Box>

              <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="caption" sx={{ color: "#999", textTransform: "uppercase", fontWeight: 600 }}>
            Style
          </Typography>
          {styles.map((st) => (
            <MenuItem
              key={st}
              onClick={() => {
                setStyling(st);
                handleDropdownClose();
              }}
              selected={styling === st}
              sx={{
                fontSize: "0.875rem",
                px: 0,
                py: 0.5,
                minHeight: "auto",
                "&.Mui-selected": {
            bgcolor: "transparent",
            color: "#7c3aed",
            fontWeight: 600,
                },
              }}
            >
              {st}
            </MenuItem>
          ))}
              </Box>
            </Menu>

            <Typography variant="caption" color="text.secondary">
              {charCount}/1000
            </Typography>

            <IconButton
              onClick={onGenerate}
              disabled={!input.trim() || loading}
              sx={{
          bgcolor: "#7c3aed",
          color: "#fff",
          width: 36,
          height: 36,
          "&:hover": {
            bgcolor: "#6d28d9",
          },
          "&.Mui-disabled": {
            bgcolor: "#e0e0e0",
            color: "#9e9e9e",
          },
              }}
              aria-label="generate component"
            >
              {loading ? (
          <Box
            sx={{
              width: 16,
              height: 16,
              border: "2px solid #fff",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />
              ) : (
          <Typography sx={{ fontSize: "1.2rem" }}>→</Typography>
              )}
            </IconButton>
          </Box>
        </Paper>

        {/* Result */}
        <div ref={resultsRef}>
          {latest && (
            <Paper elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 3, overflow: "hidden", mt: 4 }}>
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {latest.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {latest.framework} • {latest.styling} • {latest.timestamp}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton size="small" onClick={() => copyCode(latest.code)} aria-label="copy code">
                      <CopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => downloadCode(latest)} aria-label="download code">
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: "#1e293b",
                    color: "#e2e8f0",
                    borderRadius: 2,
                    overflow: "auto",
                  }}
                >
                  <pre style={{ margin: 0, fontFamily: "monospace", fontSize: "0.875rem", whiteSpace: "pre-wrap" }}>
                    <code>{latest.code}</code>
                  </pre>
                </Paper>
              </Box>

              <Box sx={{ px: 3, py: 2, bgcolor: "#fafafa", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "flex-end" }}>
                <Button size="small" onClick={() => setLatest(null)} sx={{ textTransform: "none", color: "#666" }}>
                  Clear
                </Button>
              </Box>
            </Paper>
          )}
        </div>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={2500}
          onClose={() => setSnackbar({ open: false, msg: "" })}
          message={snackbar.msg}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        />
      </Container>
    </Box>
  );
}