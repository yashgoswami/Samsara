# स Samsara

**A multiplayer infinite cosmos where wandering souls explore the universe, collect karma, face destruction, and are reborn.**

In a world of information overload and hyper-optimized feeds, Samsara is the opposite — an endless, procedurally generated universe where you drift through space with no objective except to *exist*. You stumble upon the unknown. You encounter other souls. You gather karma — or lose it. And when the weight of your choices pulls you under, you explode in a blaze of light and are reborn somewhere new, with a fresh identity and a clean slate.

The name **Samsara** (संसार) comes from the Sanskrit concept of the cycle of death and rebirth. In Hindu and Buddhist philosophy, every soul wanders through an infinite cycle — shaped by karma — until it reaches liberation (moksha). This app is a playful, meditative, real-time expression of that idea.

<img width="956" height="391" alt="image" src="https://github.com/user-attachments/assets/11f475f5-4afa-409b-8504-73c2d2992315" />

<img width="1908" height="942" alt="Screenshot 2026-03-01 171330" src="https://github.com/user-attachments/assets/5145150e-eb5b-454e-beaa-d595e5ac7d84" />


https://github.com/user-attachments/assets/6a8d354a-d54a-40ba-b7e6-015c74563782


---

## The Idea

Most multiplayer experiences are competitive or goal-driven. Samsara has no levels, no leaderboards, no win condition. It's a shared space of cosmic wandering — part screensaver, part social experiment, part digital zen garden.

- **You are a spaceship** drifting through an infinite procedurally generated cosmos.
- **Other players are out there** — you can see a directional indicator pointing toward the nearest soul.
- **Celestial objects float in space.** Some are sacred (lotus flowers, dharma wheels, sacred crystals) and grant positive karma. Others are dark (void rifts, dark matter, cursed flames) and chip away at your karma.
- **You don't know what you'll get** until you fly through an object — the karma value is hidden.
- **If your karma falls to -50, your ship explodes.** After a dramatic explosion, a new avatar is born at a random location with a new color and zero karma. The cycle continues.

It's a space where randomness, exploration, and the consequences of your path are the entire experience.

---

## Features

### Infinite Procedural Universe
The cosmos is generated deterministically using a seeded PRNG — every player sees the same universe. Scroll in any direction forever. The background is rich with:
- Hundreds of stars per region with varying brightness and color temperature
- Bright stars with diffraction spikes
- Star clusters — dense groups of tinted stars
- Colorful elliptical nebulae with subtle pulsing animations
- Planets with rings, moons, and atmospheric glow
- Spiral galaxies with rotating arms
- Pulsars emitting sweeping beams
- Binary star systems
- Cosmic dust clouds
- Animated comets streaking across the void

### Sleek Spaceship Avatars
Each player is a dart-shaped spaceship rendered entirely on Canvas 2D:
- Gradient hull with specular highlights
- Glowing cockpit window
- Dual engine flames that intensify with speed
- Twin particle engine trails
- Subtle shield aura (brighter for your own ship)
- Smooth spawn animation when entering the cosmos

### Karma Collectibles
Celestial objects are scattered throughout space — visually distinct from the background:

| Positive Karma | Negative Karma |
|---|---|
| 🪷 **Lotus Flowers** — glowing pink rotating petals | 🕳️ **Void Rifts** — swirling black holes with purple aura |
| 💎 **Sacred Crystals** — cyan hexagonal prisms with sparkles | 🔴 **Dark Matter** — spiky red shapes with a glowing eye |
| ☸️ **Dharma Wheels** — golden 8-spoke wheels that spin | 🔥 **Cursed Flames** — flickering fire with a skull face |

- Karma values are **hidden** — you don't know what you'll gain or lose until you fly through an object.
- Positive objects grant +5 to +20 karma. Negative objects take -3 to -13.
- Collected objects disappear for all players in real-time.

### Death & Rebirth (The Samsara Cycle)
- When karma drops to **-50**, the ship explodes with a dramatic multi-layered effect:
  - Bright white flash
  - Expanding shockwave rings
  - Debris particles scattering outward
  - Fading ember glow
- After 2 seconds, a **new avatar is born** at a random location with a new color and karma reset to zero.
- Other players see the explosion and the respawn in real-time.

### Multiplayer & Social
- **Real-time WebSocket multiplayer** — see other players move in real-time with smooth interpolation.
- **Direction indicator** — a pulsing arrow on the screen edge points toward the nearest player, showing their name and distance.
- **Live chat** — press Enter to type a message. Chat bubbles appear above ships.
- **Minimap** — a compact radar showing nearby souls.
- **Player count** displayed in the HUD.

### Controls
| Input | Action |
|---|---|
| Mouse / Touch | Move toward cursor |
| Scroll wheel | Zoom in/out |
| Enter | Open chat |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Server | Node.js + Express + ws (WebSocket) |
| Client | Vanilla JavaScript (ES Modules), HTML5 Canvas 2D |
| Rendering | All visuals are procedurally drawn — no images, sprites, or external assets |
| Multiplayer | WebSocket with JSON messages, 50ms update throttle |
| State | In-memory (no database) — ephemeral by design |
| Font | Inter (Google Fonts) |

### Architecture

```
server.js              Express + WebSocket server (player state, broadcast)
public/
  index.html           Entry point — canvas, intro overlay, HUD, chat
  css/style.css        Dark cosmic theme
  js/
    app.js             Main game loop orchestrator
    avatar.js          Spaceship + explosion rendering
    starfield.js       Procedural infinite cosmos generation
    collectibles.js    Karma objects — generation, rendering, collision
    camera.js          Smooth-follow camera with zoom
    connection.js      WebSocket client with auto-reconnect
    input.js           Mouse, touch, keyboard input handling
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Open **http://localhost:3456** in your browser. Open multiple tabs to see multiplayer in action.

---

## Vibe-Coded with GitHub Copilot

This entire project was **vibe-coded** — built through a conversational, iterative collaboration between a human and [GitHub Copilot](https://github.com/features/copilot) (powered by Claude).

**How it worked:**
- I (the human) guided every feature and tech decision — what to build, how it should look, what the experience should feel like.
- GitHub Copilot wrote all the code, from the server to the procedural rendering to the WebSocket multiplayer sync.
- The process was conversational: I'd describe what I wanted ("change the avatar to a spaceship", "add karma collectibles that are hidden until collected", "if karma hits -50 the ship should explode and a new one is born"), and Copilot would implement it end-to-end across multiple files.
- No code was hand-written. Every line was generated by Copilot and refined through iterative feedback.

This is what **human-guided AI programming** looks like — the human is the architect, the AI is the builder. The vision, taste, and decisions are human. The implementation is AI. Together, something emerges that neither would have built alone.

---

*"The soul is neither born, and nor does it die." — Bhagavad Gita 2.20*
