/**
 * Beam Lab reference library — how the user beams of each system are built.
 * Figures are public filings / operator statements / measurement studies;
 * "≈" marks approximate or community-estimated values.
 */
export interface SystemRef {
  id: string;
  name: string;
  operator: string;
  orbit: 'LEO' | 'MEO' | 'GEO';
  constellationId: string;
  facts: [string, string][];
  beams: string;
  handover: string;
  sources: { label: string; url: string }[];
}

export const LIBRARY: SystemRef[] = [
  {
    id: 'starlink', name: 'Starlink', operator: 'SpaceX', orbit: 'LEO', constellationId: 'starlink',
    facts: [
      ['Orbit', 'Gen1: 540–570 km shells at 53°, 53.2°, 70°, 97.6° (4,408 sats); Gen2 shells 525–535 km'],
      ['User bands', 'Ku 10.7–12.7 GHz ↓ / 14.0–14.5 GHz ↑'],
      ['Gateway', 'Ka (≈17.8–19.3 ↓ / 27.5–29.1 ↑ GHz), E-band on V2 Mini; optical ISLs'],
      ['User beam', 'Phased-array spot, ≈2–3° HPBW → ≈20–30 km footprint at nadir, hopped over hexagonal service cells (≈24 km, community estimate)'],
      ['Min elevation', '25° historically; 2026 FCC approval reported at 20° (400–500 km) / 10° (<400 km) / 5° above 62°N'],
      ['Terminal', 'Phased array, Ku, EIRP ≈38 dBW (EU licence), G/T ≈9–12 dB/K'],
      ['Latency', '≈20–40 ms median RTT'],
    ],
    beams: 'Each satellite carries several Ku phased arrays that form many narrow, electronically steered beams. Beams are scheduled to fixed ground cells; the satellite steers each beam to a cell while it passes overhead, so the cell pattern is ground-stationary while the illuminating satellite changes. Steering broadens the beam (∝ 1/cos θ) and costs scan loss (≈cos^1.2 θ).',
    handover: 'Network-scheduled re-assignment on a ≈15 s grid (reported by measurement studies). Terminals have a single electronic beam – handovers are very fast re-points rather than true make-before-break.',
    sources: [
      { label: 'SpaceX filing to NZ RSM (Ku user beams steerable, elevation)', url: 'https://www.rsm.govt.nz/assets/Uploads/documents/consultations/2018-preparing-for-5g/c4c9f26604/300.3-spacex-submission-preparing-for-5g.pdf' },
      { label: 'Bundesnetzagentur Amtsblatt (terminal EIRP 38.2 dBW, el ≥25°)', url: 'https://www.bundesnetzagentur.de/DE/Allgemeines/Presse/Amtsblatt/Einzeldownloads/Amtsblatt_26_17.pdf' },
      { label: 'Beam management in LEO (cell sizing estimate)', url: 'https://arxiv.org/pdf/2404.08967' },
    ],
  },
  {
    id: 'oneweb', name: 'Eutelsat OneWeb', operator: 'Eutelsat OneWeb', orbit: 'LEO', constellationId: 'oneweb',
    facts: [
      ['Orbit', '1,200 km, 87.9°, 12 planes × 49 (588 operational + spares)'],
      ['User bands', 'Ku 10.7–12.75 GHz ↓ / 12.75–13.25 & 14.0–14.5 GHz ↑'],
      ['User beams', '16 identical, fixed, highly elliptical beams (≈48° × 3° at −3 dB, community estimate) forming a ≈1,080 km square footprint'],
      ['Downlink PSD', '≈ −13.4 dBW/4 kHz (2016 filing) → ≈34.6 dBW over 250 MHz'],
      ['GSO protection', '"Progressive pitch": satellites pitch near the equator to keep beams out of the GSO arc'],
      ['Latency', '≈50–100 ms RTT (incl. ground network)'],
    ],
    beams: 'Beams are not steered: they are fixed to the satellite body and sweep the ground like a push-broom as the satellite moves at ≈7.2 km/s. A terminal sees successive beams of the same satellite pass over it (intra-satellite beam handover every ≈10 s) before handing over to the next satellite in the plane.',
    handover: 'Satellite handover roughly every 3–4 minutes along-plane. Most OneWeb terminals use two antennas or two beams for make-before-break between the setting and rising satellite.',
    sources: [
      { label: 'satcom.guru – first look at the OneWeb filing', url: 'https://www.satcom.guru/2016/04/oneweb-first-look-at-their-filing.html' },
      { label: 'ITU presentation – OneWeb system', url: 'https://itu.int/dms_pub/itu-r/oth/0a/0E/R0A0E0000D70001PDFE.pdf' },
      { label: 'satsig forum – beam size estimate', url: 'https://www.satsig.net/topics/satsig-topic-num=1616699057.htm' },
    ],
  },
  {
    id: 'kuiper', name: 'Amazon Kuiper (Amazon Leo)', operator: 'Amazon', orbit: 'LEO', constellationId: 'kuiper',
    facts: [
      ['Orbit', '3,236 authorised: 630 km/51.9°, 610 km/42°, 590 km/33°'],
      ['User bands', 'Ka 17.7–20.2 GHz ↓ / 27.5–30.0 GHz ↑'],
      ['User beams', 'Electronically steered Ka spot beams (phased arrays)'],
      ['Terminals', 'Three tiers ≈100 Mbps / ≈400 Mbps / ≈1 Gbps class (Amazon figures); Pro terminal tested at 1.29 Gbps, 47–48 ms'],
    ],
    beams: 'Ka-band phased-array spots like Starlink but at ≈1.7× the frequency: narrower beams for the same aperture, more rain sensitivity (≈2–4× the Ku rain fade at the same availability).',
    handover: 'Network scheduled; dual-beam terminals can make-before-break.',
    sources: [
      { label: 'ISPreview – Kuiper terminals and speeds', url: 'https://www.ispreview.co.uk/index.php/2025/09/a-look-at-amazons-project-kuiper-satellite-broadband-terminals-and-speeds.html' },
      { label: 'TechSpot – Kuiper high-speed demo', url: 'https://www.techspot.com/news/109349-amazon-demos-project-kuiper-high-speed-satellite-internet.html' },
    ],
  },
  {
    id: 'lightspeed', name: 'Telesat Lightspeed', operator: 'Telesat', orbit: 'LEO', constellationId: 'lightspeed',
    facts: [
      ['Orbit', '198 satellites: polar ≈1,015 km + inclined ≈1,325 km'],
      ['User bands', 'Ka'],
      ['Payload', 'Regenerative, on-board digital processing, direct radiating arrays, optical ISLs'],
    ],
    beams: 'Regenerative payload: uplink and downlink are decoded/re-encoded on board, so up- and down-link noise do not add – each hop is budgeted independently (SIGINT models this with the "regenerative" architecture).',
    handover: 'Higher altitude → longer passes (≈10–15 min) and fewer handovers than 550 km systems.',
    sources: [],
  },
  {
    id: 'mpower', name: 'SES O3b mPOWER', operator: 'SES', orbit: 'MEO', constellationId: 'mpower',
    facts: [
      ['Orbit', 'Equatorial MEO, 8,062 km, period ≈4.8 h; 13-satellite build-out'],
      ['User bands', 'Ka 17.7–20.2 GHz ↓ / 27.5–30.0 GHz ↑'],
      ['User beams', 'Up to ≈5,000 fully digital, electronically steered beams per satellite (vs 10 steerable dishes on O3b classic)'],
      ['Service', '50 Mbps to 10 Gbps per beam; coverage ≈±50° latitude'],
      ['Latency', '≈150 ms RTT'],
    ],
    beams: 'Beams are formed digitally from large phased arrays: each beam can be pointed anywhere in the visible disk (±≈26° nadir) and given its own bandwidth and power. Spot sizes of tens to a few hundred km.',
    handover: 'Each satellite is visible for several hours; MEO handovers are infrequent and are typically done make-before-break with two tracking antennas or a dual-beam ESA.',
    sources: [
      { label: 'Wikipedia – O3b mPOWER', url: 'https://en.wikipedia.org/wiki/O3b_mPOWER' },
      { label: 'SatNews – >5,000 steerable beams per satellite', url: 'https://news.satnews.com/2022/12/05/boeing-delivers-first-two-o3b-mpower-satellites-to-ses-that-provide-more-than-5000-steerable-beams-per-satellite/' },
    ],
  },
  {
    id: 'geo-hts', name: 'GEO Ka High-Throughput Satellites', operator: 'Various', orbit: 'GEO', constellationId: 'geo-hts',
    facts: [
      ['Examples', 'KA-SAT (9°E, 82 beams), Eutelsat KONNECT VHTS (2.7°E, 230 beams, 500 Gbps), SES-17 (67.1°W, ≈200 beams), ViaSat-3 (88.9°W, Tbps-class)'],
      ['User beams', 'Multi-beam reflector antennas, ≈0.3–0.6° HPBW → ≈150–400 km spots'],
      ['Reuse', '4-colour (2 frequency sub-bands × 2 circular polarisations)'],
      ['Typical', 'EIRP 58–62 dBW/beam, G/T 15–20 dB/K'],
      ['Latency', '≈480–650 ms RTT'],
    ],
    beams: 'Spot beams are fixed by the reflector feed geometry. Overlapping beams in a hexagonal lattice cross over at ≈−3 to −4 dB; co-channel beams are separated by one beam of a different colour, so C/I is ≈15–22 dB depending on the sidelobe level. Operators publish EIRP and G/T contours as KML – import them in the Payload editor.',
    handover: 'None for the satellite; beam-to-beam handover only for mobile terminals.',
    sources: [
      { label: 'Eutelsat KONNECT VHTS enters service', url: 'https://www.satnow.com/news/details/1245-eutelsat-s-state-of-the-art-eutelsat-konnect-vhts-satellite-successfully-enters-into-service' },
      { label: 'SES-17 launch', url: 'https://www.advanced-television.com/?p=185619' },
      { label: 'ViaSat-3', url: 'https://viasat.com/viasat3' },
    ],
  },
];
