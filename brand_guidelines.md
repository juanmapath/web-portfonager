# Brand Guidelines - DGen Systems

## 1. Core Identity & Philosophy
* **Name:** Portfonager 5000.
* **Concept:** **Cyber-Corporate Fusion.** The "Perfect Balance".
    * **Visuals:** High-end Cyberpunk (Terminal, Neon, Glassmorphism).
    * **Language:** Professional, Value-Driven, Corporate. 
* **Vibe:** Reliable, High-Tech, Efficient, "The Enterprise Tools of 2077".
* **Tone:** We manage your portfolio as High-Tech hacker quants.

## 2. Color Palette (Dark Mode Only)

### Backgrounds (The Void)
* `bg-void`: `#050505` (Primary background, almost pure black).
* `bg-panel`: `#0A0A0A` (Cards and secondary surfaces).
* `bg-surface`: `#121212` (Inputs, tertiary elements).

### Accents (The Neon)
* **Terminal Green (Primary):** `#00FF94`
    * *Usage:* CTAs, Success states, Active terminals, Data spikes.
* **Cyber Purple (Secondary):** `#7B61FF`
    * *Usage:* Gradients, "Magic" AI features, borders.
* **System Error (Alert):** `#FF3333`
    * *Usage:* Errors, Stop loss indicators, Critical alerts.
* **Holo Blue (Info):** `#00D4FF`
    * *Usage:* Data visualization lines, links.

### Borders & Dividers
* `border-subtle`: `#333333`
* `border-glow`: `rgba(0, 255, 148, 0.5)` (Used for active states or hover effects).

## 3. Typography
* **Headings / Display:** **Syne** or **Space Grotesk**.
    * *Feel:* Wide, industrial, futuristic.
* **Body / UI:** **Inter** or **Geist Sans**.
    * *Feel:* Clean, readable, neutral.
* **Code / Data / Numbers:** **JetBrains Mono** or **Fira Code**.
    * *Feel:* The hacker aesthetic. Use this for ALL numbers, stats, and "terminal-like" text.

## 4. UI Patterns & Components

### The "Glass-Terminal" Effect
* Cards should have a subtle backdrop blur (`backdrop-blur-md`), a thin border (`border-white/10`), and a noisy texture overlay (grain) to simulate old monitors.

### Interactive Elements
* **Buttons:** Sharp corners or slightly rounded (`rounded-sm`). No fully rounded "pill" buttons.
* **Hovers:** Elements should "light up" or "glitch" slightly on hover.
* **Gradients:** Use subtle "mesh gradients" in the background (Purple to Green) but heavily faded (opacity 10-20%) so they look like ambient light in a dark room.

### Data Visualization
* Thin lines (`stroke-width: 1px`).
* Grid lines visible (like technical blueprints).
* Glowing points on charts.

## 5. Tone of Voice
* **Professional:** Focus on ROI, Efficiency, and Scalability.
* **Technical but Accessible:** Use terms like "Latency" and "Throughput" to build authority, but explain them through "Operational Cost" and "Growth".
* **Direct:** "Agenda una Consulta", "Acceso Clientes". Avoid overly aggressive "Hacker" lingo in CTAs.