/**
 * Samsara – Real Space Objects & Trivia
 *
 * Places authentic celestial bodies, human satellites, and spacecraft
 * throughout the cosmos. Names and trivia sourced from NASA, ESA, and
 * other authoritative space agencies.
 *
 * When the player drifts close enough, a name label and trivia card
 * appear with educational information.
 */

const TAU = Math.PI * 2;

function seededRandom(seed) {
  let s = Math.abs(seed) || 1;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Authentic Space Object Database ─────────────────────────────
// Data sourced from NASA, ESA, ISRO, JAXA public fact sheets.

const SPACE_OBJECTS = [
  // ──── Stars ────
  {
    category: 'star',
    name: 'The Sun (Sol)',
    trivia: 'Our home star — a G-type main-sequence star 4.6 billion years old. It contains 99.86% of the solar system\'s total mass. Its core reaches 15 million °C, fusing 600 million tons of hydrogen into helium every second. Light from the Sun takes 8 minutes 20 seconds to reach Earth.',
    color: '#FFEE88',
    size: 70,
    glow: '#FFAA00',
  },
  {
    category: 'star',
    name: 'Sirius',
    trivia: 'The brightest star in Earth\'s night sky at magnitude −1.46. It\'s a binary system — Sirius A is 25× more luminous than the Sun, and Sirius B is a white dwarf the size of Earth.',
    color: '#A8C8FF',
    size: 40,
    glow: '#6EA8FF',
  },
  {
    category: 'star',
    name: 'Betelgeuse',
    trivia: 'A red supergiant in Orion, ~700 light-years away. If placed at the center of our solar system, its surface would reach beyond the orbit of Jupiter. It will explode as a supernova within the next 100,000 years.',
    color: '#FF6B35',
    size: 55,
    glow: '#FF4500',
  },
  {
    category: 'star',
    name: 'Polaris (North Star)',
    trivia: 'Actually a triple star system about 433 light-years away. Polaris A is a supergiant 1,260× brighter than the Sun. It has guided navigators for centuries due to its position near the celestial north pole.',
    color: '#FFFFCC',
    size: 35,
    glow: '#FFE066',
  },
  {
    category: 'star',
    name: 'Proxima Centauri',
    trivia: 'The closest known star to the Sun at 4.24 light-years. This red dwarf hosts Proxima b, a potentially habitable exoplanet orbiting in the star\'s habitable zone. Discovered by ESO in 2016.',
    color: '#FF8866',
    size: 18,
    glow: '#CC4422',
  },
  {
    category: 'star',
    name: 'Vega',
    trivia: 'The 5th brightest star in the sky, located 25 light-years away in the constellation Lyra. Vega was the first star (other than the Sun) to be photographed and have its spectrum recorded.',
    color: '#CCDDFF',
    size: 32,
    glow: '#88AAFF',
  },
  {
    category: 'star',
    name: 'Rigel',
    trivia: 'A blue supergiant ~860 light-years away, shining at 120,000× the Sun\'s luminosity. Rigel is the brightest star in the constellation Orion and is only about 8 million years old.',
    color: '#99BBFF',
    size: 45,
    glow: '#4488FF',
  },
  {
    category: 'star',
    name: 'UY Scuti',
    trivia: 'One of the largest known stars — a red supergiant with a radius ~1,700 times the Sun. Located ~9,500 light-years away in the constellation Scutum. Light takes over 6 hours to travel around it.',
    color: '#FF5533',
    size: 65,
    glow: '#CC3311',
  },
  {
    category: 'star',
    name: 'Eta Carinae',
    trivia: 'A massive binary star system ~7,500 light-years away, 5 million times more luminous than the Sun. It erupted in the 1840s "Great Eruption" — briefly becoming the 2nd brightest star in the sky. It may explode as a hypernova.',
    color: '#FFaa66',
    size: 50,
    glow: '#FF7744',
  },
  {
    category: 'star',
    name: 'Antares',
    trivia: 'A red supergiant in Scorpius, ~550 light-years away. Its name means "rival of Mars" because of its reddish color. Antares is ~700 times the Sun\'s diameter — if placed at the Sun\'s position, it would engulf Mars.',
    color: '#FF4422',
    size: 52,
    glow: '#DD2200',
  },
  {
    category: 'star',
    name: 'Deneb',
    trivia: 'One of the most luminous stars visible to the naked eye — roughly 200,000× the Sun\'s luminosity, ~2,600 light-years away in Cygnus. It marks one corner of the famous Summer Triangle asterism.',
    color: '#EEEEFF',
    size: 38,
    glow: '#AABBFF',
  },
  {
    category: 'star',
    name: 'Aldebaran',
    trivia: 'The "Eye of Taurus" — an orange giant star 65 light-years away that has exhausted its hydrogen fuel. It\'s 44× the Sun\'s diameter. Pioneer 10 is heading toward it and will arrive in about 2 million years.',
    color: '#FF9944',
    size: 36,
    glow: '#DD7722',
  },
  {
    category: 'star',
    name: 'TRAPPIST-1',
    trivia: 'An ultra-cool red dwarf just 40 light-years away with 7 rocky planets, 3 in the habitable zone — the most Earth-sized planets found in a single system. Discovered in 2017 by telescopes in Chile and Morocco.',
    color: '#CC5544',
    size: 15,
    glow: '#993322',
  },
  {
    category: 'star',
    name: 'Neutron Star PSR B1919+21',
    trivia: 'The first pulsar ever discovered (1967) by Jocelyn Bell Burnell. It spins once every 1.337 seconds, emitting radio beams like a cosmic lighthouse. Its iconic signal was initially nicknamed "LGM-1" (Little Green Men).',
    color: '#DDDDFF',
    size: 10,
    glow: '#8888FF',
  },

  // ──── Planets ────
  {
    category: 'planet',
    name: 'Jupiter',
    trivia: 'The largest planet in our solar system — 1,321 Earths could fit inside it. Its Great Red Spot is a storm that has raged for over 350 years. Jupiter has 95 known moons including the ocean world Europa.',
    color: '#D4A574',
    size: 50,
    glow: '#C49264',
    rings: false,
  },
  {
    category: 'planet',
    name: 'Saturn',
    trivia: 'Famous for its stunning ring system made of billions of ice and rock particles. Saturn is so light it would float in water if you had a big enough ocean. Its moon Titan has a thick atmosphere and liquid methane lakes.',
    color: '#E8D5A0',
    size: 45,
    glow: '#D4C088',
    rings: true,
  },
  {
    category: 'planet',
    name: 'Mars',
    trivia: 'The Red Planet hosts Olympus Mons — the tallest volcano in the solar system at 21.9 km. Evidence suggests Mars once had flowing water. NASA\'s Perseverance rover is currently searching for ancient microbial life.',
    color: '#C84A32',
    size: 28,
    glow: '#AA3322',
    rings: false,
  },
  {
    category: 'planet',
    name: 'Neptune',
    trivia: 'The windiest planet — supersonic winds reach 2,100 km/h. Neptune was the first planet found through mathematical prediction rather than observation. Its moon Triton orbits backwards and may be a captured Kuiper Belt object.',
    color: '#4466CC',
    size: 38,
    glow: '#3355BB',
    rings: false,
  },
  {
    category: 'planet',
    name: 'Venus',
    trivia: 'The hottest planet at 465°C — hot enough to melt lead. A day on Venus (243 Earth days) is longer than its year (225 Earth days). Its thick CO₂ atmosphere creates a runaway greenhouse effect.',
    color: '#E8C870',
    size: 27,
    glow: '#D4B458',
    rings: false,
  },
  {
    category: 'planet',
    name: 'Kepler-442b',
    trivia: 'A super-Earth exoplanet 1,206 light-years away, discovered by NASA\'s Kepler mission in 2015. It orbits in the habitable zone of its star and is one of the most Earth-like worlds ever found.',
    color: '#66AA88',
    size: 30,
    glow: '#448866',
    rings: false,
  },
  {
    category: 'planet',
    name: 'Earth',
    trivia: 'The only known planet to harbor life. 71% of its surface is covered in liquid water. Earth\'s magnetic field, generated by its molten iron core, shields life from the solar wind. It is 4.54 billion years old.',
    color: '#4488CC',
    size: 26,
    glow: '#3366AA',
    rings: false,
  },
  {
    category: 'planet',
    name: 'Mercury',
    trivia: 'The smallest planet and closest to the Sun. Despite being nearest to the Sun, it\'s not the hottest (Venus is). A day-night cycle lasts 176 Earth days. NASA\'s MESSENGER found water ice in permanently shadowed craters.',
    color: '#AAAAAA',
    size: 18,
    glow: '#888888',
    rings: false,
  },
  {
    category: 'planet',
    name: 'Uranus',
    trivia: 'The "ice giant" that rotates on its side at 98° — possibly from a massive ancient collision. It has 13 faint rings and 27 known moons. Its blue-green color comes from methane in the atmosphere.',
    color: '#88CCCC',
    size: 36,
    glow: '#66AAAA',
    rings: true,
  },
  {
    category: 'planet',
    name: 'TRAPPIST-1e',
    trivia: 'A rocky exoplanet in the TRAPPIST-1 system\'s habitable zone, 40 light-years away. JWST has detected hints of an atmosphere. It receives similar energy from its star as Earth does from the Sun.',
    color: '#77AA99',
    size: 24,
    glow: '#558877',
    rings: false,
  },
  {
    category: 'planet',
    name: 'HD 189733b',
    trivia: 'A "hot Jupiter" 64 light-years away where it rains glass sideways. Winds reach 8,700 km/h and temperatures hit 1,000°C. Its vivid blue color comes not from water but from silicate particles in the atmosphere.',
    color: '#3355DD',
    size: 42,
    glow: '#2244BB',
    rings: false,
  },
  {
    category: 'planet',
    name: '55 Cancri e',
    trivia: 'A "super-Earth" that may have a surface of molten lava. It orbits so close to its star that a year lasts just 18 hours. One study suggested it could be rich in carbon, earning it the nickname "Diamond Planet."',
    color: '#FF8844',
    size: 22,
    glow: '#DD6622',
    rings: false,
  },
  {
    category: 'planet',
    name: 'Pluto',
    trivia: 'The beloved dwarf planet with a heart-shaped nitrogen ice plain called Tombaugh Regio. New Horizons revealed it has blue skies, red snow, mountain ranges, and possibly a subsurface ocean. Reclassified in 2006.',
    color: '#CCBBAA',
    size: 16,
    glow: '#AA9988',
    rings: false,
  },

  // ──── Moons ────
  {
    category: 'moon',
    name: 'Europa',
    trivia: 'Jupiter\'s icy moon hides a global saltwater ocean beneath its frozen surface — containing about twice as much water as Earth\'s oceans. NASA\'s Europa Clipper mission (launched 2024) will investigate its habitability.',
    color: '#C8D8E8',
    size: 20,
    glow: '#A0B8C8',
  },
  {
    category: 'moon',
    name: 'Titan',
    trivia: 'Saturn\'s largest moon and the only moon with a dense atmosphere. Titan has lakes and seas of liquid methane/ethane. NASA\'s Dragonfly mission will send a rotorcraft to explore Titan in 2028.',
    color: '#D4A850',
    size: 22,
    glow: '#B88830',
  },
  {
    category: 'moon',
    name: 'Enceladus',
    trivia: 'Saturn\'s small icy moon shoots geysers of water vapor and ice into space from its south pole. Cassini detected organic molecules and hydrogen in these plumes — possible signs of hydrothermal activity.',
    color: '#E8F0F8',
    size: 16,
    glow: '#C0D0E0',
  },
  {
    category: 'moon',
    name: 'Ganymede',
    trivia: 'Jupiter\'s largest moon and the biggest moon in the solar system — larger than Mercury. It\'s the only moon known to have its own magnetic field. ESA\'s JUICE mission (launched 2023) will orbit it by 2034.',
    color: '#CCBBAA',
    size: 24,
    glow: '#AA9988',
  },
  {
    category: 'moon',
    name: 'Io',
    trivia: 'Jupiter\'s innermost large moon and the most volcanically active body in the solar system, with over 400 active volcanoes. Tidal heating from Jupiter\'s gravity melts its interior. Its surface is coated in sulfur.',
    color: '#DDCC44',
    size: 18,
    glow: '#BBAA22',
  },
  {
    category: 'moon',
    name: 'Triton',
    trivia: 'Neptune\'s largest moon orbits backward (retrograde) — likely a captured Kuiper Belt object. It has nitrogen geysers, an extremely thin atmosphere, and surface temperatures of −235°C, among the coldest in the solar system.',
    color: '#AACCDD',
    size: 19,
    glow: '#88AABB',
  },
  {
    category: 'moon',
    name: 'Phobos',
    trivia: 'Mars\' largest moon, just 22 km across. It orbits only 6,000 km above Mars — closer than any other moon to its planet. Tidal forces are pulling it closer; in ~50 million years it will crash into Mars or break into a ring.',
    color: '#998877',
    size: 10,
    glow: '#776655',
  },
  {
    category: 'moon',
    name: 'Charon',
    trivia: 'Pluto\'s largest moon, discovered in 1978. It\'s so large relative to Pluto that they orbit a shared center of gravity — making them a true "double dwarf planet" system. Its north pole has a reddish cap called Mordor Macula.',
    color: '#BBBBAA',
    size: 14,
    glow: '#999988',
  },

  // ──── Nebulae & Deep Space ────
  {
    category: 'nebula',
    name: 'Pillars of Creation',
    trivia: 'Iconic towers of gas and dust in the Eagle Nebula (M16), ~6,500 light-years away. First photographed by Hubble in 1995, then in stunning detail by JWST in 2023. Stars are actively forming inside these columns.',
    color: '#886644',
    size: 80,
    glow: '#664422',
  },
  {
    category: 'nebula',
    name: 'Crab Nebula (M1)',
    trivia: 'The remnant of a supernova explosion recorded by Chinese astronomers in 1054 AD. At its center spins a neutron star (pulsar) rotating 30 times per second. It\'s 6,500 light-years away and 11 light-years across.',
    color: '#88AACC',
    size: 70,
    glow: '#5588AA',
  },
  {
    category: 'nebula',
    name: 'Orion Nebula (M42)',
    trivia: 'The closest massive star-forming region to Earth at ~1,344 light-years. Visible to the naked eye as a fuzzy patch in Orion\'s sword. Inside, the Trapezium cluster of hot young stars illuminates the gas.',
    color: '#CC7799',
    size: 75,
    glow: '#AA5577',
  },
  {
    category: 'nebula',
    name: 'Ring Nebula (M57)',
    trivia: 'A planetary nebula in Lyra, ~2,570 light-years away. It\'s the glowing remains of a Sun-like star that shed its outer layers ~4,000 years ago. JWST revealed its intricate 3D barrel-like structure in 2023.',
    color: '#66BBAA',
    size: 55,
    glow: '#449988',
  },
  {
    category: 'nebula',
    name: 'Helix Nebula (NGC 7293)',
    trivia: 'Known as the "Eye of God" — one of the closest planetary nebulae at just 655 light-years. Its central white dwarf is surrounded by thousands of comet-like knots, each the size of our solar system.',
    color: '#44AACC',
    size: 65,
    glow: '#2288AA',
  },
  {
    category: 'nebula',
    name: 'Horsehead Nebula',
    trivia: 'An iconic dark nebula in Orion, ~1,375 light-years away. Its distinctive horse-head shape is sculpted by radiation from nearby massive stars eroding the dense dust cloud. First photographed at Harvard in 1888.',
    color: '#994422',
    size: 60,
    glow: '#772200',
  },
  {
    category: 'nebula',
    name: 'Carina Nebula',
    trivia: 'One of the largest and brightest nebulae in the sky, ~8,500 light-years away. It hosts Eta Carinae and the "Cosmic Cliffs" — JWST\'s first deep-field image revealed baby stars never seen before in this stellar nursery.',
    color: '#CC8866',
    size: 85,
    glow: '#AA6644',
  },

  // ──── Galaxies ────
  {
    category: 'galaxy',
    name: 'Andromeda (M31)',
    trivia: 'The nearest large galaxy to the Milky Way, at 2.5 million light-years. It contains roughly 1 trillion stars. Andromeda and the Milky Way will collide in about 4.5 billion years to form "Milkomeda."',
    color: '#AABBDD',
    size: 90,
    glow: '#7799BB',
  },
  {
    category: 'galaxy',
    name: 'Whirlpool Galaxy (M51)',
    trivia: 'A grand-design spiral galaxy 23 million light-years away in Canes Venatici. It was the first galaxy recognized as having a spiral structure, by Lord Rosse in 1845 using a 72-inch telescope.',
    color: '#99AACC',
    size: 70,
    glow: '#6688AA',
  },
  {
    category: 'galaxy',
    name: 'Sombrero Galaxy (M104)',
    trivia: 'A stunning galaxy 31 million light-years away with a bright nucleus and a large dust lane, giving it a hat-like appearance. It contains ~100 billion stars and a supermassive black hole 1 billion × the Sun\'s mass.',
    color: '#DDCC99',
    size: 65,
    glow: '#BBAA77',
  },
  {
    category: 'galaxy',
    name: 'Triangulum Galaxy (M33)',
    trivia: 'The third-largest galaxy in our Local Group, 2.73 million light-years away. It contains about 40 billion stars. It hosts NGC 604, one of the largest star-forming regions known — 40× the size of the Orion Nebula.',
    color: '#AABB99',
    size: 60,
    glow: '#889977',
  },
  {
    category: 'galaxy',
    name: 'Large Magellanic Cloud',
    trivia: 'A satellite galaxy of the Milky Way, 160,000 light-years away and visible to the naked eye from the Southern Hemisphere. In 1987, it hosted Supernova 1987A — the closest observed supernova since Kepler\'s in 1604.',
    color: '#AABBCC',
    size: 75,
    glow: '#8899AA',
  },
  {
    category: 'galaxy',
    name: 'IC 1101',
    trivia: 'One of the largest known galaxies, stretching 6 million light-years across — 60× the Milky Way\'s diameter. Located 1.04 billion light-years away, it contains over 100 trillion stars. A true cosmic titan.',
    color: '#DDDDAA',
    size: 95,
    glow: '#BBBB88',
  },
  {
    category: 'galaxy',
    name: 'Cartwheel Galaxy',
    trivia: 'A ring galaxy 500 million light-years away, shaped by a dramatic head-on collision with a smaller galaxy ~300 million years ago. JWST revealed new details of star formation rippling outward through the ring.',
    color: '#CC99BB',
    size: 70,
    glow: '#AA7799',
  },

  // ──── Black Holes ────
  {
    category: 'blackhole',
    name: 'Sagittarius A*',
    trivia: 'The supermassive black hole at the center of the Milky Way — 4 million times the mass of the Sun. The Event Horizon Telescope captured its first image in 2022, confirming predictions from general relativity.',
    color: '#110011',
    size: 50,
    glow: '#FF6600',
  },
  {
    category: 'blackhole',
    name: 'M87* (Pōwehi)',
    trivia: 'The first black hole ever photographed (2019) by the Event Horizon Telescope. It lies 55 million light-years away at the center of galaxy M87 and has a mass of 6.5 billion Suns. Its jet extends 5,000 light-years.',
    color: '#110011',
    size: 60,
    glow: '#FF8800',
  },
  {
    category: 'blackhole',
    name: 'Cygnus X-1',
    trivia: 'The first widely accepted black hole, confirmed in 1972. It\'s a stellar-mass black hole (~21 Sun masses) feeding on a blue supergiant companion star. Stephen Hawking famously bet against its black hole nature — and lost.',
    color: '#0A000A',
    size: 35,
    glow: '#4488FF',
  },
  {
    category: 'blackhole',
    name: 'TON 618',
    trivia: 'One of the most massive black holes known — 66 billion solar masses, powering a hyper-luminous quasar 10.4 billion light-years away. Its event horizon is 1,300 AU across, dwarfing our entire solar system.',
    color: '#0A000A',
    size: 70,
    glow: '#FFAA00',
  },

  // ──── Asteroids ────
  {
    category: 'asteroid',
    name: 'Ceres',
    trivia: 'The largest object in the asteroid belt and a dwarf planet. NASA\'s Dawn spacecraft discovered bright spots — deposits of sodium carbonate — in Occator Crater. Ceres may have a subsurface ocean of salty water.',
    color: '#999988',
    size: 20,
    glow: '#777766',
  },
  {
    category: 'asteroid',
    name: 'Vesta',
    trivia: 'The second-largest asteroid, 525 km across. It has a massive south-pole crater (Rheasilvia) that excavated 1% of its volume. Vesta is the brightest asteroid visible from Earth and was visited by NASA\'s Dawn in 2011.',
    color: '#AAAAAA',
    size: 18,
    glow: '#888888',
  },
  {
    category: 'asteroid',
    name: 'Bennu',
    trivia: 'A rubble-pile near-Earth asteroid just 500m wide. OSIRIS-REx collected samples in 2020 and returned them to Earth in 2023. Bennu has a 1 in 2,700 chance of impacting Earth between 2178 and 2290.',
    color: '#887766',
    size: 10,
    glow: '#665544',
  },
  {
    category: 'asteroid',
    name: "'Oumuamua",
    trivia: 'The first confirmed interstellar object to pass through our solar system (2017). Its elongated, cigar-like shape and mysterious acceleration sparked debate: was it a comet, asteroid, or even alien light sail? Origin unknown.',
    color: '#CC8866',
    size: 12,
    glow: '#AA6644',
  },
  {
    category: 'asteroid',
    name: '16 Psyche',
    trivia: 'A metallic asteroid ~226 km across, believed to be the exposed iron-nickel core of a destroyed protoplanet. Its metal content has been estimated at $10 quintillion. NASA\'s Psyche mission launched in 2023 to study it.',
    color: '#BBAA99',
    size: 22,
    glow: '#998877',
  },

  // ──── Comets ────
  {
    category: 'comet',
    name: 'Halley\'s Comet',
    trivia: 'The most famous periodic comet, visible from Earth every 75-79 years. Last appeared in 1986, next return in 2061. Edmond Halley predicted its return in 1705, proving comets orbit the Sun. Recorded since 240 BC.',
    color: '#DDEEFF',
    size: 16,
    glow: '#88BBFF',
  },
  {
    category: 'comet',
    name: 'Comet NEOWISE (C/2020 F3)',
    trivia: 'A spectacular naked-eye comet in July 2020, the brightest in the Northern Hemisphere since Hale-Bopp in 1997. Its nucleus is ~5 km wide. It won\'t return for approximately 6,800 years.',
    color: '#EEEEFF',
    size: 14,
    glow: '#AACCFF',
  },
  {
    category: 'comet',
    name: 'Hale-Bopp (C/1995 O1)',
    trivia: 'One of the most widely observed comets of the 20th century, visible to the naked eye for a record 18 months (1996-1997). Its nucleus is ~40 km across — unusually large. Orbital period: ~2,520 years.',
    color: '#FFEECC',
    size: 18,
    glow: '#DDCC88',
  },
  {
    category: 'comet',
    name: '67P/Churyumov-Gerasimenko',
    trivia: 'The "rubber duck" comet explored by ESA\'s Rosetta mission. In 2014, the Philae lander made history as the first spacecraft to land on a comet. Rosetta detected amino acids and phosphorus — ingredients for life.',
    color: '#CCCCBB',
    size: 12,
    glow: '#AAAA99',
  },
  {
    category: 'comet',
    name: 'Comet Tsuchinshan-ATLAS (C/2023 A3)',
    trivia: 'A stunning comet that became visible to the naked eye in October 2024. Originating from the Oort Cloud, it developed a magnificent anti-tail. Its hyperbolic orbit means it will never return to the inner solar system.',
    color: '#FFFFDD',
    size: 15,
    glow: '#DDDDAA',
  },

  // ──── Human Satellites ────
  {
    category: 'satellite',
    name: 'International Space Station (ISS)',
    flag: '🇺🇸🇷🇺🇪🇺🇯🇵🇨🇦',
    trivia: 'The largest human-made structure in space — 109m wide, orbiting at 408 km altitude at 28,000 km/h. Continuously occupied since Nov 2000. Built by 5 space agencies (NASA, Roscosmos, ESA, JAXA, CSA).',
    color: '#DDDDDD',
    size: 20,
    glow: '#88AACC',
  },
  {
    category: 'satellite',
    name: 'Hubble Space Telescope',
    flag: '🇺🇸',
    trivia: 'Launched by NASA in 1990, Hubble has made over 1.5 million observations. It orbits at 547 km altitude, and its discoveries include the accelerating expansion of the universe, which led to the Nobel Prize in 2011.',
    color: '#CCCCDD',
    size: 16,
    glow: '#8888BB',
  },
  {
    category: 'satellite',
    name: 'James Webb Space Telescope',
    flag: '🇺🇸🇪🇺🇨🇦',
    trivia: 'Launched Dec 2021, JWST orbits the Sun at L2 — 1.5 million km from Earth. Its 6.5m gold-coated mirror can see the first galaxies formed after the Big Bang. It detects infrared light invisible to Hubble.',
    color: '#FFD700',
    size: 18,
    glow: '#CC9900',
  },
  {
    category: 'satellite',
    name: 'GPS Satellite (Navstar)',
    flag: '🇺🇸',
    trivia: 'The GPS constellation consists of 31 satellites orbiting at ~20,200 km. Each carries atomic clocks accurate to nanoseconds. They must account for Einstein\'s general relativity — time runs 38 microseconds/day faster in orbit.',
    color: '#AABB88',
    size: 12,
    glow: '#889966',
  },
  {
    category: 'satellite',
    name: 'Tiangong Space Station',
    flag: '🇨🇳',
    trivia: 'China\'s modular space station, completed in 2022. It orbits at 340-450 km altitude with a crew of 3. Tiangong means "Heavenly Palace" — it represents China\'s independent pathway to human spaceflight.',
    color: '#DDCCAA',
    size: 18,
    glow: '#AA9977',
  },
  {
    category: 'satellite',
    name: 'Chandrayaan-3 Lander',
    flag: '🇮🇳',
    trivia: 'ISRO\'s lunar mission that made India the 4th country to soft-land on the Moon in Aug 2023 — and the first to land near the lunar south pole. Its Pragyan rover detected sulfur in lunar soil for the first time.',
    color: '#CCBB88',
    size: 14,
    glow: '#AA9966',
  },

  // ──── Spacecraft & Probes ────
  {
    category: 'spacecraft',
    name: 'Voyager 1',
    flag: '🇺🇸',
    trivia: 'Launched by NASA in 1977, Voyager 1 is the most distant human-made object — now over 24 billion km from Earth in interstellar space. It carries the Golden Record, a message to any civilization that might find it.',
    color: '#BBAACC',
    size: 14,
    glow: '#8877AA',
  },
  {
    category: 'spacecraft',
    name: 'Voyager 2',
    flag: '🇺🇸',
    trivia: 'The only spacecraft to have visited all four giant planets (Jupiter, Saturn, Uranus, Neptune). Launched in 1977, it entered interstellar space in 2018. Its nuclear power source will last until about 2025.',
    color: '#AABBCC',
    size: 14,
    glow: '#7788AA',
  },
  {
    category: 'spacecraft',
    name: 'New Horizons',
    flag: '🇺🇸',
    trivia: 'NASA\'s Pluto explorer launched in 2006, it flew by Pluto in July 2015 revealing heart-shaped nitrogen ice plains and blue skies. It later visited Arrokoth — the most distant object ever explored up close.',
    color: '#CCBBAA',
    size: 13,
    glow: '#AA9988',
  },
  {
    category: 'spacecraft',
    name: 'Perseverance Rover',
    flag: '🇺🇸',
    trivia: 'NASA\'s Mars rover landed in Jezero Crater in Feb 2021. It\'s searching for signs of ancient microbial life, collecting rock samples, and deployed Ingenuity — the first helicopter to fly on another planet.',
    color: '#CC8855',
    size: 15,
    glow: '#AA6633',
  },
  {
    category: 'spacecraft',
    name: 'Parker Solar Probe',
    flag: '🇺🇸',
    trivia: 'The closest human-made object to the Sun — passing within 6.2 million km of the solar surface at 690,000 km/h, the fastest object ever built. Its heat shield withstands temperatures over 1,370°C.',
    color: '#FFaa44',
    size: 14,
    glow: '#DD8822',
  },
  {
    category: 'spacecraft',
    name: 'Cassini–Huygens',
    flag: '🇺🇸🇪🇺🇮🇹',
    trivia: 'A NASA/ESA/ASI mission that orbited Saturn from 2004-2017. It discovered geysers on Enceladus, lakes on Titan, and gave us the most detailed views of Saturn\'s rings. It ended with a Grand Finale dive into Saturn.',
    color: '#DDCC88',
    size: 15,
    glow: '#BBAA66',
  },
  {
    category: 'spacecraft',
    name: 'OSIRIS-REx',
    flag: '🇺🇸',
    trivia: 'NASA\'s asteroid sample-return mission. It collected 121.6 grams from asteroid Bennu and delivered the sample to Earth in Sep 2023 — the largest asteroid sample ever returned. Now renamed OSIRIS-APEX heading to Apophis.',
    color: '#AABB99',
    size: 13,
    glow: '#889977',
  },
  {
    category: 'spacecraft',
    name: 'Juno',
    flag: '🇺🇸',
    trivia: 'NASA orbiter studying Jupiter since 2016. Juno discovered that Jupiter\'s core is not solid but a diffuse "fuzzy" mix of elements. It has captured unprecedented views of Jupiter\'s poles and its auroras.',
    color: '#88AADD',
    size: 15,
    glow: '#5588BB',
  },

  // ──── Historical Milestones ────
  {
    category: 'satellite',
    name: 'Sputnik 1',
    flag: '🇷🇺',
    trivia: 'The first artificial satellite, launched by the Soviet Union on Oct 4, 1957. This 58 cm, 83.6 kg polished sphere orbited Earth every 96 minutes, its radio beeps heard worldwide — sparking the Space Age.',
    color: '#CCCCCC',
    size: 12,
    glow: '#999999',
  },
  {
    category: 'spacecraft',
    name: 'Apollo 11 Command Module',
    flag: '🇺🇸',
    trivia: 'On July 20, 1969, humans first set foot on the Moon. Neil Armstrong and Buzz Aldrin spent 2 hours on the lunar surface while Michael Collins orbited above. They brought back 21.5 kg of Moon rocks.',
    color: '#DDDDCC',
    size: 16,
    glow: '#AAAA99',
  },
];

// ─── Category visual config ──────────────────────────────────────
const CATEGORY_ICONS = {
  star:       '★',
  planet:     '●',
  moon:       '◑',
  nebula:     '✦',
  galaxy:     '🌀',
  blackhole:  '◉',
  satellite:  '🛰',
  spacecraft: '🚀',
  asteroid:   '🪨',
  comet:      '☄',
};

const CATEGORY_LABELS = {
  star:       'Star',
  planet:     'Planet',
  moon:       'Moon',
  nebula:     'Nebula',
  galaxy:     'Galaxy',
  blackhole:  'Black Hole',
  satellite:  'Satellite',
  spacecraft: 'Spacecraft',
  asteroid:   'Asteroid',
  comet:      'Comet',
};

// ─── Space Object Placement ──────────────────────────────────────
// Objects are placed deterministically via seeded PRNG in large grid cells
// so every client sees them in the same spots.

const GRID_SIZE = 3000; // large cells — objects are rare & special
const REVEAL_DIST = 250; // distance to start showing name
const TRIVIA_DIST = 140; // distance to show full trivia card

// ─── Static Landmark Positions ───────────────────────────────────
// Fixed world-space beacons that players can navigate to.
export const LANDMARK_EARTH = { x: 0, y: 0 };
export const LANDMARK_SUN   = { x: 15000, y: -12000 };

// Pre-built landmark objects (always drawn, not grid-dependent)
const STATIC_LANDMARKS = [
  {
    ...SPACE_OBJECTS.find(o => o.name === 'Earth'),
    x: LANDMARK_EARTH.x,
    y: LANDMARK_EARTH.y,
    phase: 0,
    size: 50, // bigger than normal — it's the destination
  },
  {
    ...SPACE_OBJECTS.find(o => o.name === 'The Sun (Sol)'),
    x: LANDMARK_SUN.x,
    y: LANDMARK_SUN.y,
    phase: 1.2,
    size: 90, // impressive Sun landmark
  },
];

export class SpaceObjectLayer {
  constructor(seed = 42) {
    this.seed = seed;
    this.cache = new Map();
  }

  _generateCell(cx, cy) {
    const key = `${cx},${cy}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const rng = seededRandom(this.seed * 7 + cx * 54881 + cy * 92381);

    // Each cell gets 1-3 objects drawn from the database
    const count = 1 + Math.floor(rng() * 3);
    const objects = [];

    for (let i = 0; i < count; i++) {
      const idx = Math.floor(rng() * SPACE_OBJECTS.length);
      const template = SPACE_OBJECTS[idx];

      objects.push({
        ...template,
        x: cx * GRID_SIZE + rng() * GRID_SIZE,
        y: cy * GRID_SIZE + rng() * GRID_SIZE,
        phase: rng() * TAU, // animation phase offset
      });
    }

    // Limit cache size
    if (this.cache.size > 200) {
      const first = this.cache.keys().next().value;
      this.cache.delete(first);
    }
    this.cache.set(key, objects);
    return objects;
  }

  /**
   * Draw all visible space objects and their info cards.
   * @param {CanvasRenderingContext2D} ctx
   * @param {Camera} camera
   * @param {number} w - screen width
   * @param {number} h - screen height
   * @param {{x:number,y:number}|null} player - player position for proximity
   */
  draw(ctx, camera, w, h, player) {
    const margin = GRID_SIZE;
    const left = camera.x - w / 2 / camera.zoom - margin;
    const right = camera.x + w / 2 / camera.zoom + margin;
    const top = camera.y - h / 2 / camera.zoom - margin;
    const bottom = camera.y + h / 2 / camera.zoom + margin;

    const cxMin = Math.floor(left / GRID_SIZE);
    const cxMax = Math.floor(right / GRID_SIZE);
    const cyMin = Math.floor(top / GRID_SIZE);
    const cyMax = Math.floor(bottom / GRID_SIZE);

    const now = performance.now() / 1000;

    for (let cx = cxMin; cx <= cxMax; cx++) {
      for (let cy = cyMin; cy <= cyMax; cy++) {
        const objects = this._generateCell(cx, cy);
        for (const obj of objects) {
          this._drawObject(ctx, obj, now, player);
        }
      }
    }

    // Always draw static landmarks (Earth & Sun)
    for (const lm of STATIC_LANDMARKS) {
      this._drawObject(ctx, lm, now, player);
    }
  }

  _drawObject(ctx, obj, time, player) {
    const { x, y, category, name, trivia, color, size, glow, phase } = obj;

    // Distance to player
    let dist = Infinity;
    if (player) {
      const dx = x - player.x;
      const dy = y - player.y;
      dist = Math.sqrt(dx * dx + dy * dy);
    }

    const pulse = 0.85 + 0.15 * Math.sin(time * 1.2 + phase);

    ctx.save();

    // ── Draw the object itself ──
    switch (category) {
      case 'star':
        this._drawStar(ctx, x, y, size * pulse, color, glow, time, phase);
        break;
      case 'planet':
        this._drawPlanet(ctx, x, y, size * pulse, color, glow, obj.rings);
        break;
      case 'moon':
        this._drawMoon(ctx, x, y, size * pulse, color, glow);
        break;
      case 'nebula':
        this._drawNebula(ctx, x, y, size, color, glow, time, phase);
        break;
      case 'galaxy':
        this._drawGalaxy(ctx, x, y, size, color, glow, time, phase);
        break;
      case 'blackhole':
        this._drawBlackHole(ctx, x, y, size, glow, time, phase);
        break;
      case 'satellite':
        this._drawSatellite(ctx, x, y, size * pulse, color, glow, time, phase);
        break;
      case 'spacecraft':
        this._drawSpacecraft(ctx, x, y, size * pulse, color, glow, time, phase);
        break;
      case 'asteroid':
        this._drawAsteroid(ctx, x, y, size * pulse, color, glow, time, phase);
        break;
      case 'comet':
        this._drawComet(ctx, x, y, size * pulse, color, glow, time, phase);
        break;
    }

    // ── Name label (always visible) ──
    {
      const nameAlpha = dist < REVEAL_DIST
        ? Math.min(1, (REVEAL_DIST - dist) / (REVEAL_DIST - TRIVIA_DIST) * 0.8 + 0.2)
        : 0.55;
      this._drawNameLabel(ctx, x, y - size - 12, name, category, nameAlpha, obj.flag);
    }

    // ── Trivia card (close range) ──
    if (dist < TRIVIA_DIST) {
      const triviaAlpha = Math.min(1, (TRIVIA_DIST - dist) / (TRIVIA_DIST * 0.5));
      this._drawTriviaCard(ctx, x, y + size + 20, name, trivia, category, triviaAlpha);
    }

    ctx.restore();
  }

  // ─── Object Renderers ─────────────────────────────────────────

  _drawStar(ctx, x, y, r, color, glow, t, ph) {
    // Outer glow
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
    grad.addColorStop(0, glow + '66');
    grad.addColorStop(0.4, glow + '22');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.5, 0, TAU);
    ctx.fill();

    // Core
    const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    coreGrad.addColorStop(0, '#fff');
    coreGrad.addColorStop(0.3, color);
    coreGrad.addColorStop(1, glow + '88');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();

    // Diffraction spikes
    ctx.strokeStyle = color + '44';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI / 2) + t * 0.1 + ph;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5);
      ctx.lineTo(x + Math.cos(a) * r * 3, y + Math.sin(a) * r * 3);
      ctx.stroke();
    }
  }

  _drawPlanet(ctx, x, y, r, color, glow, hasRings) {
    // Shadow side
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    grad.addColorStop(0, color);
    grad.addColorStop(0.7, glow);
    grad.addColorStop(1, '#111');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();

    // Atmosphere edge glow
    ctx.strokeStyle = color + '44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r + 2, 0, TAU);
    ctx.stroke();

    if (hasRings) {
      ctx.save();
      ctx.strokeStyle = color + '66';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 2, r * 0.4, -0.3, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = color + '33';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 2.4, r * 0.5, -0.3, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  _drawMoon(ctx, x, y, r, color, glow) {
    // Simple sphere with craters
    const grad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 0, x, y, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, glow);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();

    // Crater hints
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath(); ctx.arc(x + r * 0.3, y - r * 0.2, r * 0.15, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(x - r * 0.2, y + r * 0.3, r * 0.1, 0, TAU); ctx.fill();
  }

  _drawNebula(ctx, x, y, r, color, glow, t, ph) {
    // Multiple overlapping translucent blobs
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * TAU + ph;
      const ox = Math.cos(angle + t * 0.05) * r * 0.3;
      const oy = Math.sin(angle + t * 0.07) * r * 0.3;
      const blobR = r * (0.5 + i * 0.1);

      const grad = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, blobR);
      grad.addColorStop(0, color + '33');
      grad.addColorStop(0.5, glow + '18');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x + ox, y + oy, blobR, 0, TAU);
      ctx.fill();
    }
  }

  _drawGalaxy(ctx, x, y, r, color, glow, t, ph) {
    // Spiral galaxy
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.02 + ph);

    // Central glow
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.3);
    cg.addColorStop(0, '#fff8');
    cg.addColorStop(1, color + '22');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, TAU);
    ctx.fill();

    // Spiral arms
    ctx.strokeStyle = color + '30';
    ctx.lineWidth = r * 0.08;
    ctx.lineCap = 'round';
    for (let arm = 0; arm < 2; arm++) {
      ctx.beginPath();
      for (let a = 0; a < TAU * 1.5; a += 0.1) {
        const sr = r * 0.15 + (a / (TAU * 1.5)) * r * 0.85;
        const sa = a + arm * Math.PI;
        const sx = Math.cos(sa) * sr;
        const sy = Math.sin(sa) * sr;
        if (a === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  _drawBlackHole(ctx, x, y, r, glow, t, ph) {
    // Accretion disk
    ctx.save();
    ctx.globalAlpha = 0.6;
    for (let i = 3; i > 0; i--) {
      const diskR = r + i * 12;
      const grad = ctx.createRadialGradient(x, y, r, x, y, diskR);
      const hue = 25 + i * 15;
      grad.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.4)`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, diskR, diskR * 0.35, t * 0.05 + ph, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Event horizon (pure black)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.6, 0, TAU);
    ctx.fill();

    // Photon ring
    ctx.strokeStyle = glow + '88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.65, 0, TAU);
    ctx.stroke();

    ctx.restore();
  }

  _drawSatellite(ctx, x, y, r, color, glow, t, ph) {
    // Body
    ctx.fillStyle = color;
    ctx.fillRect(x - r * 0.4, y - r * 0.3, r * 0.8, r * 0.6);

    // Solar panels
    ctx.fillStyle = '#4466AA';
    ctx.fillRect(x - r * 1.2, y - r * 0.2, r * 0.6, r * 0.4);
    ctx.fillRect(x + r * 0.6, y - r * 0.2, r * 0.6, r * 0.4);

    // Panel grid lines
    ctx.strokeStyle = '#5577BB';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 3; i++) {
      const px = x - r * 1.2 + i * r * 0.2;
      ctx.beginPath(); ctx.moveTo(px, y - r * 0.2); ctx.lineTo(px, y + r * 0.2); ctx.stroke();
      const px2 = x + r * 0.6 + i * r * 0.2;
      ctx.beginPath(); ctx.moveTo(px2, y - r * 0.2); ctx.lineTo(px2, y + r * 0.2); ctx.stroke();
    }

    // Antenna
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.3);
    ctx.lineTo(x, y - r * 0.7);
    ctx.stroke();

    // Blinking light
    const blink = Math.sin(t * 3 + ph) > 0.5;
    if (blink) {
      ctx.fillStyle = '#FF4444';
      ctx.beginPath();
      ctx.arc(x, y - r * 0.7, 2, 0, TAU);
      ctx.fill();
    }

    // Signal waves
    ctx.globalAlpha = 0.15 + 0.1 * Math.sin(t * 2 + ph);
    ctx.strokeStyle = glow;
    ctx.lineWidth = 0.8;
    for (let w = 1; w <= 3; w++) {
      ctx.beginPath();
      ctx.arc(x, y - r * 0.7, r * 0.3 * w, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  _drawSpacecraft(ctx, x, y, r, color, glow, t, ph) {
    ctx.save();
    ctx.translate(x, y);

    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.7);
    ctx.lineTo(r * 0.4, r * 0.3);
    ctx.lineTo(-r * 0.4, r * 0.3);
    ctx.closePath();
    ctx.fill();

    // Dish / antenna
    ctx.strokeStyle = '#DDDDDD';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -r * 0.2, r * 0.35, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();

    // Engine glow
    const eg = ctx.createRadialGradient(0, r * 0.4, 0, 0, r * 0.4, r * 0.4);
    eg.addColorStop(0, '#44AAFF88');
    eg.addColorStop(1, 'transparent');
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(0, r * 0.4, r * 0.4 * (0.7 + 0.3 * Math.sin(t * 5 + ph)), 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  _drawAsteroid(ctx, x, y, r, color, glow, t, ph) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.15 + ph);

    // Irregular rocky body
    const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r);
    grad.addColorStop(0, color);
    grad.addColorStop(0.6, glow);
    grad.addColorStop(1, '#333');
    ctx.fillStyle = grad;

    ctx.beginPath();
    const pts = 8;
    for (let i = 0; i < pts; i++) {
      const angle = (i / pts) * TAU;
      const wobble = 0.7 + 0.3 * Math.sin(i * 2.7 + ph * 3);
      const px = Math.cos(angle) * r * wobble;
      const py = Math.sin(angle) * r * wobble;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Crater details
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.arc(r * 0.2, -r * 0.1, r * 0.15, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(-r * 0.25, r * 0.2, r * 0.12, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.05, r * 0.3, r * 0.08, 0, TAU); ctx.fill();

    // Subtle dust aura
    ctx.globalAlpha = 0.08;
    const aura = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 2);
    aura.addColorStop(0, color);
    aura.addColorStop(1, 'transparent');
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(0, 0, r * 2, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  _drawComet(ctx, x, y, r, color, glow, t, ph) {
    ctx.save();

    // Tail direction (trailing behind, waving slightly)
    const tailAngle = Math.PI * 0.75 + Math.sin(t * 0.5 + ph) * 0.15;
    const tailLen = r * 6;

    // Dust tail (wider, more diffuse)
    const dustGrad = ctx.createLinearGradient(
      x, y,
      x + Math.cos(tailAngle + 0.15) * tailLen,
      y + Math.sin(tailAngle + 0.15) * tailLen
    );
    dustGrad.addColorStop(0, glow + '66');
    dustGrad.addColorStop(0.3, glow + '22');
    dustGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = dustGrad;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.3, y - r * 0.3);
    ctx.quadraticCurveTo(
      x + Math.cos(tailAngle + 0.3) * tailLen * 0.5,
      y + Math.sin(tailAngle + 0.3) * tailLen * 0.5,
      x + Math.cos(tailAngle + 0.2) * tailLen,
      y + Math.sin(tailAngle + 0.2) * tailLen
    );
    ctx.lineTo(
      x + Math.cos(tailAngle - 0.1) * tailLen * 0.8,
      y + Math.sin(tailAngle - 0.1) * tailLen * 0.8
    );
    ctx.quadraticCurveTo(
      x + Math.cos(tailAngle - 0.1) * tailLen * 0.3,
      y + Math.sin(tailAngle - 0.1) * tailLen * 0.3,
      x + r * 0.3, y + r * 0.3
    );
    ctx.closePath();
    ctx.fill();

    // Ion tail (narrow, straight, blue-ish)
    const ionGrad = ctx.createLinearGradient(
      x, y,
      x + Math.cos(tailAngle) * tailLen * 1.2,
      y + Math.sin(tailAngle) * tailLen * 1.2
    );
    ionGrad.addColorStop(0, '#88BBFF44');
    ionGrad.addColorStop(0.4, '#6699FF22');
    ionGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = ionGrad;
    ctx.lineWidth = r * 0.3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(tailAngle) * tailLen * 1.2,
      y + Math.sin(tailAngle) * tailLen * 1.2
    );
    ctx.stroke();

    // Coma (fuzzy glow around nucleus)
    const comaGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
    comaGrad.addColorStop(0, color + 'AA');
    comaGrad.addColorStop(0.3, glow + '44');
    comaGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = comaGrad;
    ctx.beginPath(); ctx.arc(x, y, r * 2.5, 0, TAU); ctx.fill();

    // Nucleus (bright core)
    const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 0.6);
    coreGrad.addColorStop(0, '#FFFFFF');
    coreGrad.addColorStop(0.4, color);
    coreGrad.addColorStop(1, glow);
    ctx.fillStyle = coreGrad;
    ctx.beginPath(); ctx.arc(x, y, r * 0.6, 0, TAU); ctx.fill();

    ctx.restore();
  }

  // ─── UI Labels ─────────────────────────────────────────────────

  _drawNameLabel(ctx, x, y, name, category, alpha, flag) {
    ctx.save();
    ctx.globalAlpha = alpha;

    const icon = CATEGORY_ICONS[category] || '';
    const flagStr = flag ? ` ${flag}` : '';
    const label = `${icon} ${name}${flagStr}`;

    ctx.font = '600 13px Inter, sans-serif';
    const metrics = ctx.measureText(label);
    const tw = metrics.width;
    const pad = 8;

    // Background pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    const rx = x - tw / 2 - pad;
    const ry = y - 10;
    const rw = tw + pad * 2;
    const rh = 22;
    const br = 6;
    ctx.beginPath();
    ctx.moveTo(rx + br, ry);
    ctx.lineTo(rx + rw - br, ry);
    ctx.arcTo(rx + rw, ry, rx + rw, ry + br, br);
    ctx.lineTo(rx + rw, ry + rh - br);
    ctx.arcTo(rx + rw, ry + rh, rx + rw - br, ry + rh, br);
    ctx.lineTo(rx + br, ry + rh);
    ctx.arcTo(rx, ry + rh, rx, ry + rh - br, br);
    ctx.lineTo(rx, ry + br);
    ctx.arcTo(rx, ry, rx + br, ry, br);
    ctx.fill();

    // Text
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y + 1);

    ctx.restore();
  }

  _drawTriviaCard(ctx, x, y, name, trivia, category, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;

    const maxWidth = 260;
    const pad = 12;
    const lineHeight = 15;

    // Category label
    const catLabel = (CATEGORY_LABELS[category] || category).toUpperCase();

    // Word-wrap trivia text
    ctx.font = '300 11px Inter, sans-serif';
    const lines = this._wrapText(ctx, trivia, maxWidth - pad * 2);

    // Card dimensions
    const headerH = 18;
    const cardH = pad + headerH + 4 + lines.length * lineHeight + pad;
    const cardW = maxWidth;
    const cx = x - cardW / 2;
    const cy = y;

    // Card background
    ctx.fillStyle = 'rgba(8, 8, 20, 0.82)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    const br = 10;
    ctx.beginPath();
    ctx.moveTo(cx + br, cy);
    ctx.lineTo(cx + cardW - br, cy);
    ctx.arcTo(cx + cardW, cy, cx + cardW, cy + br, br);
    ctx.lineTo(cx + cardW, cy + cardH - br);
    ctx.arcTo(cx + cardW, cy + cardH, cx + cardW - br, cy + cardH, br);
    ctx.lineTo(cx + br, cy + cardH);
    ctx.arcTo(cx, cy + cardH, cx, cy + cardH - br, br);
    ctx.lineTo(cx, cy + br);
    ctx.arcTo(cx, cy, cx + br, cy, br);
    ctx.fill();
    ctx.stroke();

    // Category tag
    ctx.font = '600 9px Inter, sans-serif';
    ctx.fillStyle = 'rgba(120, 200, 255, 0.6)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(catLabel, cx + pad, cy + pad);

    // Trivia text
    ctx.font = '300 11px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    let ty = cy + pad + headerH;
    for (const line of lines) {
      ctx.fillText(line, cx + pad, ty);
      ty += lineHeight;
    }

    ctx.restore();
  }

  _wrapText(ctx, text, maxW) {
    const words = text.split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
      const test = current ? current + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }
}
