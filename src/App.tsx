import { useState, useCallback, useRef, KeyboardEvent } from 'react'

// ── Types ─────────────────────────────────────────────────────────
interface Subject {
  id: string
  type: string
  description: string
  pose: string
  position: string
  expression: string
}

interface Camera {
  angle: string
  distance: string
  lens: string
  focus: string
}

interface PromptData {
  scene: string
  subjects: Subject[]
  style: string
  color_palette: string[]
  lighting: string
  mood: string
  background: string
  composition: string
  camera: Camera
  medium: string
  effects: string[]
}

// ── Randomizer pools ──────────────────────────────────────────────
const SCENES = [
  'A baroque spacecraft interior adorned with gilded machinery and velvet panels',
  'A solarpunk vertical garden city at golden hour, cascading with bioluminescent flora',
  'A macro-scale alien coral reef colony pulsing with ultraviolet light',
  'An ancient celestial observatory carved into a mountain of obsidian glass',
  'A cyberpunk night market suspended beneath a colossal bridge structure',
  'A derelict art deco space station reclaimed by crystalline fungal colonies',
  'A liminal waiting room between dimensions, lit by cold fluorescent tubes',
  'A grand underground library carved into luminescent cave formations',
  'A surrealist desert where geometric monoliths cast impossible shadows',
  'A floating archipelago of cloud islands above a violet gas giant',
]

const SUBJECT_TYPES = [
  'a mysterious cloaked wanderer',
  'a biomechanical guardian construct',
  'an ethereal luminous entity',
  'a weathered renaissance scholar',
  'a solarpunk cultivator',
  'a baroque automaton with clockwork wings',
  'an ancient oracle draped in cosmic silk',
  'a rogue archivist with a mechanical eye',
  'a ceremonial warrior in crystalline armor',
  'a translucent deep-sea creature',
]

const SUBJECT_POSES = [
  'standing in quiet contemplation',
  'mid-gesture, reaching toward an unseen source of light',
  'kneeling beside an artifact, examining it closely',
  'turning back over the shoulder, half-shadowed',
  'suspended mid-leap, frozen in motion',
  'seated cross-legged, eyes closed in meditation',
  'striding forward with purposeful energy',
  'crouching low, alert and watchful',
]

const SUBJECT_EXPRESSIONS = [
  'serene and otherworldly',
  'intense and calculating',
  'softly melancholic',
  'radiant with wonder',
  'stoic and timeless',
  'quietly amused',
  'haunted and introspective',
]

const STYLES = [
  'hyper-detailed cinematic realism, 8K UHD',
  'impressionist oil with photorealistic lighting',
  'baroque chiaroscuro with digital precision',
  'solarpunk illustration with painterly textures',
  'macro naturalism, scientific illustration aesthetic',
  'concept art, matte painting finish',
  'noir graphic novel with atmospheric gradients',
  'surrealist digital painting, Salvador Dalí influence',
  'biomechanical illustration, H.R. Giger lineage',
  'retro-futurist poster art, Art Nouveau borders',
]

const LIGHTING = [
  'volumetric god rays piercing through dust particles',
  'cool bioluminescent ambience with rim lighting',
  'dramatic chiaroscuro, single candle source',
  'golden hour diffuse with long shadows',
  'neon underglow reflecting off wet surfaces',
  'overcast soft box, even and melancholic',
  'deep space backlighting, silhouette-forward',
  'flickering electric storm ambience',
  'dawn light through stained glass geometry',
  'ultraviolet blacklight with fluorescent accents',
]

const MOODS = [
  'profound solitude and cosmic wonder',
  'tense anticipation before a cataclysm',
  'quiet melancholy tinged with hope',
  'euphoric transcendence',
  'ancient mystery and reverence',
  'uncanny dreamlike unease',
  'heroic determination',
  'bittersweet nostalgia',
  'ethereal serenity',
  'primal awe before something vast',
]

const BACKGROUNDS = [
  'deep nebula fields with star nurseries',
  'crumbling baroque architecture overgrown with luminescent moss',
  'infinite mirrored corridors',
  'stacked vertical gardens fading into atmospheric haze',
  'fractured geometric crystal formations',
  'rain-slicked cobblestone with neon reflections',
  'ancient ceremonial murals glowing faintly',
  'swirling dimensional rift portals',
  'submerged ruins beneath crystal-clear water',
  'dense canopy jungle with shafts of filtered light',
]

const COMPOSITIONS = [
  'rule of thirds, subject placed left, expansive negative space right',
  'central symmetrical, iconic and monumental',
  'extreme foreground depth with layered middleground',
  'Dutch angle, unsettling and kinetic',
  'birds-eye overhead, pattern-forward',
  'worm\'s eye, subject towering and imposing',
  'triptych panel structure, narrative sequence',
  'vignette framing, soft circular crop toward center',
]

const MEDIUMS = [
  'digital oil painting',
  'photorealistic CGI render',
  'mixed media collage with analog textures',
  'watercolor with ink linework',
  'acrylic impasto with palette knife marks',
  'generative art with painterly post-processing',
  'charcoal and pastel on toned paper',
  '35mm film photograph, grain and all',
]

const EFFECTS = [
  'lens flares', 'chromatic aberration', 'depth of field blur',
  'particle dust motes', 'heat shimmer distortion', 'film grain overlay',
  'anamorphic streak highlights', 'subsurface scattering on skin',
  'volumetric fog layers', 'motion blur trails', 'bloom highlights',
  'bioluminescent particle systems', 'ink bleed edges', 'vignette',
]

const PALETTES = [
  ['midnight indigo', 'tarnished gold', 'pale bone', 'deep crimson'],
  ['viridian', 'burnt sienna', 'slate grey', 'cream'],
  ['electric violet', 'neon coral', 'void black', 'silver'],
  ['cobalt blue', 'amber', 'antique white', 'forest shadow'],
  ['rose quartz', 'sage', 'umber', 'champagne'],
  ['prussian blue', 'vermillion', 'ivory', 'charcoal'],
  ['emerald', 'ultraviolet', 'pewter', 'blush'],
  ['obsidian', 'bioluminescent cyan', 'deep maroon', 'pale gold'],
]

const ANGLES = ['low angle', 'eye level', 'high angle', 'dutch angle', 'overhead', 'extreme low angle']
const DISTANCES = ['extreme close-up', 'close-up', 'medium shot', 'medium wide', 'wide shot', 'extreme wide']
const LENSES = ['14mm ultra-wide', '24mm wide', '35mm standard', '50mm prime', '85mm portrait', '135mm telephoto', '200mm compressed']
const FOCUSES = ['tack sharp subject, bokeh background', 'deep focus, full scene sharp', 'selective focus, dreamy foreground blur', 'rack focus, subject emerging from blur', 'soft focus overall, painterly']

// ── Helpers ───────────────────────────────────────────────────────
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const pickMultiple = <T,>(arr: T[], min: number, max: number): T[] => {
  const n = min + Math.floor(Math.random() * (max - min + 1))
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}
const uid = () => Math.random().toString(36).slice(2, 10)

const EMPTY_SUBJECT = (): Subject => ({
  id: uid(), type: '', description: '', pose: '', position: '', expression: '',
})

const EMPTY_DATA = (): PromptData => ({
  scene: '',
  subjects: [EMPTY_SUBJECT()],
  style: '',
  color_palette: [],
  lighting: '',
  mood: '',
  background: '',
  composition: '',
  camera: { angle: '', distance: '', lens: '', focus: '' },
  medium: '',
  effects: [],
})

// ── Chip input component ──────────────────────────────────────────
function ChipInput({ values, onChange, placeholder }: {
  values: string[]
  onChange: (v: string[]) => void
  placeholder: string
}) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed])
    }
    setDraft('')
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit() }
    if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      onChange(values.slice(0, -1))
    }
  }

  return (
    <div className="chip-input-wrap" onClick={() => inputRef.current?.focus()}>
      {values.map((v) => (
        <span key={v} className="chip">
          {v}
          <button type="button" onClick={(e) => { e.stopPropagation(); onChange(values.filter(x => x !== v)) }}>×</button>
        </span>
      ))}
      <input
        ref={inputRef}
        className="chip-input"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={commit}
        placeholder={values.length === 0 ? placeholder : ''}
      />
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState<PromptData>(EMPTY_DATA)
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [copyLabel, setCopyLabel] = useState('Copy')

  // Serializer — strips internal id from subjects
  const cleanData = useCallback(() => {
    const result = {
      ...data,
      subjects: data.subjects.map(({ id: _id, ...rest }) => rest),
    }
    return JSON.stringify(result, null, 2)
  }, [data])

  // Field helpers
  const setField = <K extends keyof PromptData>(key: K, value: PromptData[K]) =>
    setData(d => ({ ...d, [key]: value }))

  const setCameraField = (key: keyof Camera, value: string) =>
    setData(d => ({ ...d, camera: { ...d.camera, [key]: value } }))

  const addSubject = () => setData(d => ({ ...d, subjects: [...d.subjects, EMPTY_SUBJECT()] }))
  const removeSubject = (id: string) => setData(d => ({ ...d, subjects: d.subjects.filter(s => s.id !== id) }))
  const updateSubject = (id: string, key: keyof Subject, value: string) =>
    setData(d => ({
      ...d,
      subjects: d.subjects.map(s => s.id === id ? { ...s, [key]: value } : s),
    }))

  // Randomizer
  const handleRandomize = () => {
    const subjectCount = 1 + Math.floor(Math.random() * 2)
    const subjects: Subject[] = Array.from({ length: subjectCount }, () => ({
      id: uid(),
      type: pick(SUBJECT_TYPES),
      description: '',
      pose: pick(SUBJECT_POSES),
      position: pick(['foreground left', 'foreground right', 'midground center', 'background', 'extreme foreground']),
      expression: pick(SUBJECT_EXPRESSIONS),
    }))
    setData({
      scene: pick(SCENES),
      subjects,
      style: pick(STYLES),
      color_palette: pick(PALETTES),
      lighting: pick(LIGHTING),
      mood: pick(MOODS),
      background: pick(BACKGROUNDS),
      composition: pick(COMPOSITIONS),
      camera: { angle: pick(ANGLES), distance: pick(DISTANCES), lens: pick(LENSES), focus: pick(FOCUSES) },
      medium: pick(MEDIUMS),
      effects: pickMultiple(EFFECTS, 2, 4),
    })
  }

  // Copy
  const handleCopy = async () => {
    await navigator.clipboard.writeText(cleanData())
    setCopyLabel('Copied!')
    setTimeout(() => setCopyLabel('Copy'), 2000)
  }

  // Download
  const handleDownload = () => {
    const blob = new Blob([cleanData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prompt.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import
  const handleImport = () => {
    setImportError('')
    try {
      const parsed = JSON.parse(importText)
      if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Root must be an object')
      const subjects: Subject[] = (parsed.subjects ?? []).map((s: Omit<Subject, 'id'>) => ({ id: uid(), ...s }))
      setData({
        scene: parsed.scene ?? '',
        subjects,
        style: parsed.style ?? '',
        color_palette: Array.isArray(parsed.color_palette) ? parsed.color_palette : [],
        lighting: parsed.lighting ?? '',
        mood: parsed.mood ?? '',
        background: parsed.background ?? '',
        composition: parsed.composition ?? '',
        camera: {
          angle: parsed.camera?.angle ?? '',
          distance: parsed.camera?.distance ?? '',
          lens: parsed.camera?.lens ?? '',
          focus: parsed.camera?.focus ?? '',
        },
        medium: parsed.medium ?? '',
        effects: Array.isArray(parsed.effects) ? parsed.effects : [],
      })
      setImportText('')
      setImportOpen(false)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Invalid JSON')
    }
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <h1>JSON Prompt <span>Architect</span></h1>
        <div className="ops-bar">
          <button className="btn btn-randomize" onClick={handleRandomize}>⚄ Randomize</button>
          <button className="btn btn-ghost" onClick={() => { setImportOpen(true); setImportError('') }}>Import JSON</button>
          <button className="btn btn-ghost" onClick={handleCopy}>{copyLabel}</button>
          <button className="btn btn-success" onClick={handleDownload}>↓ Download</button>
        </div>
      </header>

      <div className="app-body">
        {/* Form panel */}
        <main className="form-panel">

          {/* Global Context */}
          <section className="card">
            <div className="card-title">Global Context</div>
            <div className="field">
              <label>Scene</label>
              <textarea placeholder="Describe the overall scene and setting…" value={data.scene} onChange={e => setField('scene', e.target.value)} />
            </div>
            <div className="field">
              <label>Background</label>
              <input type="text" placeholder="Background details…" value={data.background} onChange={e => setField('background', e.target.value)} />
            </div>
            <div className="field">
              <label>Composition</label>
              <input type="text" placeholder="e.g. rule of thirds, central symmetry…" value={data.composition} onChange={e => setField('composition', e.target.value)} />
            </div>
          </section>

          {/* Subjects */}
          <section className="card">
            <div className="card-title">Subjects</div>
            <div className="subject-list">
              {data.subjects.map((s, i) => (
                <div key={s.id} className="subject-card">
                  <div className="subject-card-header">
                    <span>Subject {i + 1}</span>
                    {data.subjects.length > 1 && (
                      <button className="btn btn-danger" onClick={() => removeSubject(s.id)}>Remove</button>
                    )}
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label>Type</label>
                      <input type="text" placeholder="e.g. character, creature, object" value={s.type} onChange={e => updateSubject(s.id, 'type', e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Position</label>
                      <input type="text" placeholder="e.g. foreground center" value={s.position} onChange={e => updateSubject(s.id, 'position', e.target.value)} />
                    </div>
                  </div>
                  <div className="field">
                    <label>Description</label>
                    <textarea placeholder="Detailed visual description…" value={s.description} onChange={e => updateSubject(s.id, 'description', e.target.value)} />
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label>Pose</label>
                      <input type="text" placeholder="Body pose or action" value={s.pose} onChange={e => updateSubject(s.id, 'pose', e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Expression</label>
                      <input type="text" placeholder="Facial expression or mood" value={s.expression} onChange={e => updateSubject(s.id, 'expression', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-add" onClick={addSubject}>+ Add Subject</button>
          </section>

          {/* Aesthetics */}
          <section className="card">
            <div className="card-title">Aesthetics &amp; Parameters</div>
            <div className="field-row">
              <div className="field">
                <label>Style</label>
                <input type="text" placeholder="e.g. cinematic realism, impressionist" value={data.style} onChange={e => setField('style', e.target.value)} />
              </div>
              <div className="field">
                <label>Medium</label>
                <input type="text" placeholder="e.g. digital oil painting, CGI" value={data.medium} onChange={e => setField('medium', e.target.value)} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Lighting</label>
                <input type="text" placeholder="e.g. volumetric god rays" value={data.lighting} onChange={e => setField('lighting', e.target.value)} />
              </div>
              <div className="field">
                <label>Mood</label>
                <input type="text" placeholder="e.g. cosmic wonder, quiet melancholy" value={data.mood} onChange={e => setField('mood', e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Color Palette <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(press Enter or comma to add)</span></label>
              <ChipInput values={data.color_palette} onChange={v => setField('color_palette', v)} placeholder="Type a color name and press Enter…" />
            </div>
            <div className="field">
              <label>Effects <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(press Enter or comma to add)</span></label>
              <ChipInput values={data.effects} onChange={v => setField('effects', v)} placeholder="e.g. lens flare, film grain…" />
            </div>
          </section>

          {/* Camera */}
          <section className="card">
            <div className="card-title">Camera Rig</div>
            <div className="field-row">
              <div className="field">
                <label>Angle</label>
                <input type="text" placeholder="e.g. low angle, overhead" value={data.camera.angle} onChange={e => setCameraField('angle', e.target.value)} />
              </div>
              <div className="field">
                <label>Distance</label>
                <input type="text" placeholder="e.g. close-up, wide shot" value={data.camera.distance} onChange={e => setCameraField('distance', e.target.value)} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Lens</label>
                <input type="text" placeholder="e.g. 85mm portrait" value={data.camera.lens} onChange={e => setCameraField('lens', e.target.value)} />
              </div>
              <div className="field">
                <label>Focus</label>
                <input type="text" placeholder="e.g. tack sharp, bokeh background" value={data.camera.focus} onChange={e => setCameraField('focus', e.target.value)} />
              </div>
            </div>
          </section>

        </main>

        {/* Sidebar — live JSON */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <span>Live Output</span>
            <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={handleCopy}>{copyLabel}</button>
          </div>
          <div className="sidebar-json">
            <pre>{cleanData()}</pre>
          </div>
        </aside>
      </div>

      {/* Import modal */}
      {importOpen && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setImportOpen(false) }}>
          <div className="modal">
            <h2>Import JSON</h2>
            <p>Paste a prompt JSON payload below. Subject IDs will be assigned automatically.</p>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder={'{\n  "scene": "...",\n  "subjects": [...]\n}'}
              autoFocus
            />
            {importError && <div className="modal-error">{importError}</div>}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setImportOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleImport}>Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
