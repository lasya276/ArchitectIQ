import React, { useEffect, useRef, useState, useId } from 'react';
import mermaid from 'mermaid';
import { AlertTriangle } from 'lucide-react';

// ─── One-time global Mermaid initialisation ───────────────────────────────────
// Called once at module load. All diagram-type-specific tuning happens here.
// useMaxWidth: false  →  never let Mermaid squash the SVG to fit its host;
//                        we handle overflow with a scrollable wrapper instead.
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    // ── Colour palette ────────────────────────────────────────────────────
    primaryColor: '#312e81',          // deep indigo fill for nodes/entities
    primaryTextColor: '#e0e7ff',      // light lavender text inside nodes
    primaryBorderColor: '#6366f1',    // indigo node borders
    lineColor: '#818cf8',             // indigo-400 connector lines (brighter for visibility)
    secondaryColor: '#1e1b4b',        // very dark indigo for secondary nodes
    tertiaryColor: '#0f172a',         // slate-950 for background areas
    background: '#0f172a',
    mainBkg: '#1e293b',               // slate-800 entity/class body
    nodeBorder: '#6366f1',
    clusterBkg: '#1e293b',
    clusterBorder: '#4f46e5',
    titleColor: '#e2e8f0',
    edgeLabelBackground: '#1e293b',
    textColor: '#e0e7ff',             // default text — light on dark bg
    // ── ER diagram ────────────────────────────────────────────────────────
    // Row backgrounds — must be dark so white/light text is readable
    attributeBackgroundColorEven: '#ffffff',
    attributeBackgroundColorOdd: '#ffffff',
    attributeForegroundColor: '#111827',
    entityBorder: '#334155',
    // ── Class diagram ─────────────────────────────────────────────────────
    classText: '#e0e7ff',             // light lavender — readable on dark bg
    // fillType0-7: backgrounds for class sections (header, attributes, methods)
    // ALL must be dark so that classText (#e0e7ff) is readable
    fillType0: '#1e293b',             // slate-800
    fillType1: '#1e1b4b',             // dark indigo
    fillType2: '#172554',             // dark blue
    fillType3: '#1e3a5f',
    fillType4: '#0f172a',             // slate-950
    fillType5: '#312e81',             // deep indigo
    fillType6: '#1e293b',
    fillType7: '#1e1b4b',
    // ── Sequence diagram ──────────────────────────────────────────────────
    actorBkg: '#1e293b',
    actorBorder: '#6366f1',
    actorTextColor: '#e0e7ff',
    activationBkgColor: '#312e81',
    activationBorderColor: '#818cf8',
    signalColor: '#94a3b8',
    signalTextColor: '#e0e7ff',
    noteBkgColor: '#1e293b',
    noteTextColor: '#cbd5e1',
    noteBorderColor: '#475569',
    loopTextColor: '#e0e7ff',
    labelBoxBkgColor: '#1e293b',
    labelBoxBorderColor: '#475569',
    labelTextColor: '#e0e7ff',
    // ── Flowchart / component diagrams ────────────────────────────────────
    nodeTextColor: '#e0e7ff',
  },
  // ── ER diagrams ────────────────────────────────────────────────────────
  er: {
    diagramPadding: 20,
    layoutDirection: 'TB',
    minEntityWidth: 180,
    minEntityHeight: 60,
    entityPadding: 12,
    useMaxWidth: false,
  },
  // ── Flowcharts / architecture graphs ──────────────────────────────────
  flowchart: {
    curve: 'basis',
    padding: 18,
    nodeSpacing: 50,
    rankSpacing: 60,
    htmlLabels: true,
    useMaxWidth: false,
  },
  // ── Sequence diagrams ─────────────────────────────────────────────────
  sequence: {
    diagramMarginX: 20,
    diagramMarginY: 20,
    actorMargin: 60,
    width: 160,
    height: 60,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 40,
    mirrorActors: false,
    useMaxWidth: false,
  },
  // ── Class diagrams ────────────────────────────────────────────────────
  class: {
    useMaxWidth: false,
  },
  // ── General ───────────────────────────────────────────────────────────
  securityLevel: 'loose',
  fontFamily: '"Inter", "system-ui", sans-serif',
  fontSize: 12,
});

// ─── Helper: make the rendered SVG responsive ──────────────────────────────────
//
// Goal: small diagrams stay at their natural pixel size; large diagrams scale
// DOWN so they never overflow the parent container; aspect ratio is always
// preserved via viewBox. No diagram is ever stretched beyond its natural width.
//
// Technique — the standard responsive-image CSS pattern applied to SVG:
//
//   max-width : 100%  → the SVG's rendered width is capped at the container
//                        width.  If the SVG's intrinsic width is already ≤ the
//                        container, it renders at its natural size (no stretch).
//
//   height    : auto  → the browser derives height from the viewBox aspect
//                        ratio as the width changes, preserving proportions.
//
// We do NOT set width="100%" — that would force every SVG to stretch to the
// full container width regardless of its natural size.
//
// Steps:
//   1. Strip Mermaid's inline style="max-width:NNNpx;" — it is a pixel ceiling
//      that can be lower than the container width, causing premature capping.
//   2. Leave the SVG's intrinsic width="NNN" attribute intact (natural size).
//   3. Remove the explicit height="NNN" attribute — viewBox + CSS height:auto
//      recalculate it correctly at any scale. Safe for all current diagram
//      types (ER, class, sequence, flowchart) because Mermaid always emits a
//      viewBox when it emits pixel width/height.
//   4. Inject max-width:100%;height:auto; into the <svg> style attribute so
//      the responsive scaling rule is applied inline (not reliant on a global
//      stylesheet that may not target the injected SVG).
//
function normalizeSvg(svgString: string): string {
  return (
    svgString
      // 1. Remove Mermaid's inline pixel max-width (e.g. style="max-width:800.5px;")
      //    which can interfere with our CSS rule.
      .replace(/\bmax-width\s*:\s*[\d.]+px\s*;?/g, '')
      // 2. Intrinsic pixel width is left as-is — we only cap it via CSS.
      // 3. Remove explicit pixel height so the browser derives it from viewBox.
      .replace(/(<svg[^>]*)\bheight="(\d+(?:\.\d+)?)"/g, '$1')
      // 4a. Inject into an existing style attribute.
      .replace(
        /(<svg\b[^>]*)(style=")([^"]*)(")/,
        (_match, pre, _sa, existing, _close) =>
          `${pre}style="max-width:100%;height:auto;${existing}"`,
      )
      // 4b. Add a style attribute if the SVG has none.
      .replace(
        /(<svg\b(?![^>]*\bstyle=)[^>]*)>/,
        '$1 style="max-width:100%;height:auto;">',
      )
  );
}


// ─── Helper: force consistent ER diagram styling ───────────────────────────────
// Mermaid's ER renderer uses its own SVG classes/structure.  We style only
// ER entity elements here so Class/Component/Sequence diagrams are unaffected.
//
// Design:
//   - Every entity/table background = white
//   - Every entity/table text = black/dark
//   - No alternating row colours
//   - Dark borders for clear table boundaries
//   - Dark relationship lines and cardinality markers
//   - Slightly smaller typography for dense technical ER diagrams

function styleErSvg(svgString: string): string {
  const erCss = `
    <style>
      /* ================================================================
         ER TABLE / ENTITY BACKGROUNDS
         ================================================================ */

      /* Entity without attributes */
      g[id^="entity-"].node.default > rect {
        fill: #ffffff !important;
        stroke: #334155 !important;
        stroke-width: 1.5px !important;
      }

      /* Entity header / main entity shape */
      g[id^="entity-"].node.default > g[style] > path:first-child {
        fill: #ffffff !important;
        stroke: #334155 !important;
      }

      /* Every attribute row — BOTH odd and even */
      g[id^="entity-"].node.default > g.row-rect-even path:first-child,
      g[id^="entity-"].node.default > g.row-rect-odd path:first-child {
        fill: #ffffff !important;
        stroke: #cbd5e1 !important;
      }

      /* Catch attribute rectangles/paths even when Mermaid changes
         the exact row wrapper structure. */
      .er.attributeBoxEven,
      .er.attributeBoxOdd {
        fill: #ffffff !important;
        stroke: #cbd5e1 !important;
      }

      /* ================================================================
         ER TEXT
         ================================================================ */

      /* Entity/table labels */
      g[id^="entity-"].node.default span.nodeLabel,
      g[id^="entity-"].node.default span.nodeLabel p,
      .er.entityLabel {
        color: #111827 !important;
        fill: #111827 !important;
        font-weight: 600 !important;
      }

      /* Attribute text */
      g[id^="entity-"].node.default text,
      g[id^="entity-"].node.default tspan {
        fill: #111827 !important;
        color: #111827 !important;
      }

      /* Mermaid sometimes renders labels through foreignObject */
      g[id^="entity-"].node.default span,
      g[id^="entity-"].node.default p {
        color: #111827 !important;
      }

      /* ================================================================
         ER RELATIONSHIPS
         ================================================================ */

      .er.relationshipLine,
      .relationshipLine {
        stroke: #334155 !important;
        stroke-width: 1.5px !important;
      }

      .er.relationshipLabel,
      .er.relationshipLabelBox {
        fill: #ffffff !important;
        color: #111827 !important;
        stroke: #cbd5e1 !important;
      }

      /* Cardinality markers */
      defs .marker.onlyOne.er *,
      defs .marker.zeroOrOne.er *,
      defs .marker.oneOrMore.er *,
      defs .marker.zeroOrMore.er * {
        stroke: #334155 !important;
        fill: #ffffff !important;
      }
    </style>
  `;

  // Insert the ER-specific CSS immediately inside the SVG.
  return svgString.replace(/(<svg\b[^>]*>)/, `$1${erCss}`);
}

/**
 * Direct DOM post-processor for ER diagrams.
 * Applied after Mermaid.render() inserts the SVG into the DOM.
 * Traverses and directly styles all rendered ER entity/table elements with inline styles,
 * ensuring:
 *  - Every table header and attribute row has a solid #ffffff background (no alternating or dark rows)
 *  - All text is #111827 (dark/black, eliminating pale/invisible text)
 *  - Outer borders are #334155, inner row borders #cbd5e1
 *  - Relationship lines are #334155 with existing geometry preserved
 *  - Relationship labels have #ffffff background and #111827 text
 *  - Cardinality markers have #334155 stroke and #ffffff fill
 */
function applyErDiagramStyles(container: HTMLElement): void {
  const svg = container.querySelector('svg');
  if (!svg) return;

  // 1. Locate all entity/table container groups
  const entityNodes = svg.querySelectorAll<SVGGElement>(
    'g[id^="entity-"], g[id*="entity-"], g.node, g.entityBox, .er.entityBox'
  );

  entityNodes.forEach((entity) => {
    // Outer bounding shape
    const outerShapes = entity.querySelectorAll<SVGElement>(
      '.outer-path, .outer-path path, .outer-path rect, rect.outer-path'
    );
    outerShapes.forEach((shape) => {
      shape.style.setProperty('fill', '#ffffff', 'important');
      shape.style.setProperty('stroke', '#334155', 'important');
      shape.style.setProperty('stroke-width', '1.5px', 'important');
    });

    // Attribute rows (both even & odd rows forced to clean white background)
    const rowElements = entity.querySelectorAll<SVGElement>(
      '.row-rect-even, .row-rect-odd, .attributeBoxEven, .attributeBoxOdd, ' +
      '.row-rect-even path, .row-rect-odd path, .row-rect-even rect, .row-rect-odd rect, ' +
      '.attributeBoxEven path, .attributeBoxOdd path, .attributeBoxEven rect, .attributeBoxOdd rect'
    );
    rowElements.forEach((row) => {
      row.style.setProperty('fill', '#ffffff', 'important');
      row.style.setProperty('stroke', '#cbd5e1', 'important');
      row.style.setProperty('stroke-width', '1px', 'important');
    });

    // Dividers between header and rows, or between columns
    const dividers = entity.querySelectorAll<SVGElement>(
      '.divider, .divider path, .divider polygon, polygon.divider, path.divider, line.divider'
    );
    dividers.forEach((divider) => {
      divider.style.setProperty('fill', '#334155', 'important');
      divider.style.setProperty('stroke', '#334155', 'important');
      divider.style.setProperty('stroke-width', '1px', 'important');
    });

    // Comprehensive catch-all: all shapes within this entity table
    const allShapes = entity.querySelectorAll<SVGElement>('rect, path, polygon');
    allShapes.forEach((shape) => {
      if (shape.classList.contains('divider') || shape.closest('.divider')) {
        shape.style.setProperty('fill', '#334155', 'important');
        shape.style.setProperty('stroke', '#334155', 'important');
        return;
      }
      shape.style.setProperty('fill', '#ffffff', 'important');
      if (shape.classList.contains('outer-path') || shape.closest('.outer-path')) {
        shape.style.setProperty('stroke', '#334155', 'important');
        shape.style.setProperty('stroke-width', '1.5px', 'important');
      } else {
        shape.style.setProperty('stroke', '#cbd5e1', 'important');
      }
    });

    // Entity Header / Title Typography
    const titleElements = entity.querySelectorAll<HTMLElement | SVGElement>(
      '.name, .name text, .name tspan, .name span, .name p, .name div, ' +
      '.entityLabel, .entityLabel text, .entityLabel tspan, .entityLabel span, .entityLabel p, ' +
      'span.nodeLabel, span.nodeLabel p'
    );
    titleElements.forEach((el) => {
      el.style.setProperty('color', '#111827', 'important');
      el.style.setProperty('fill', '#111827', 'important');
      el.style.setProperty('font-weight', '700', 'important');
    });

    // Attribute text (fields, types, PK/FK/UK, comments)
    const attributeTexts = entity.querySelectorAll<HTMLElement | SVGElement>(
      '.attribute-type, .attribute-type text, .attribute-type tspan, .attribute-type span, .attribute-type p, ' +
      '.attribute-name, .attribute-name text, .attribute-name tspan, .attribute-name span, .attribute-name p, ' +
      '.attribute-keys, .attribute-keys text, .attribute-keys tspan, .attribute-keys span, .attribute-keys p, ' +
      '.attribute-comment, .attribute-comment text, .attribute-comment tspan, .attribute-comment span, .attribute-comment p, ' +
      '.attributeBoxEven text, .attributeBoxEven tspan, .attributeBoxOdd text, .attributeBoxOdd tspan'
    );
    attributeTexts.forEach((el) => {
      el.style.setProperty('color', '#111827', 'important');
      el.style.setProperty('fill', '#111827', 'important');
    });

    // General text catch-all within entity
    const allTexts = entity.querySelectorAll<HTMLElement | SVGElement>('text, tspan, span, p, div');
    allTexts.forEach((el) => {
      el.style.setProperty('color', '#111827', 'important');
      el.style.setProperty('fill', '#111827', 'important');
    });
  });

  // 2. Relationship lines connecting entities
  const relLines = svg.querySelectorAll<SVGElement>(
    '.relationshipLine, path.relationshipLine, .er.relationshipLine, ' +
    'path[class*="relationshipLine"], .edgePaths path, g.edgePath path'
  );
  relLines.forEach((line) => {
    line.style.setProperty('stroke', '#334155', 'important');
    line.style.setProperty('stroke-width', '1.5px', 'important');
    line.style.setProperty('fill', 'none', 'important');
  });

  // 3. Relationship labels
  const relLabelBoxes = svg.querySelectorAll<SVGElement>(
    '.relationshipLabelBox, .relationshipLabelBox rect, .relationshipLabelBox path, ' +
    '.edgeLabel rect, .edgeLabel .label rect, .er.relationshipLabelBox'
  );
  relLabelBoxes.forEach((box) => {
    box.style.setProperty('fill', '#ffffff', 'important');
    box.style.setProperty('stroke', '#cbd5e1', 'important');
    box.style.setProperty('stroke-width', '1px', 'important');
    box.style.setProperty('opacity', '1', 'important');
  });

  const relLabelTexts = svg.querySelectorAll<HTMLElement | SVGElement>(
    '.relationshipLabel, .relationshipLabel text, .relationshipLabel tspan, ' +
    '.relationshipLabel span, .relationshipLabel p, ' +
    '.edgeLabel text, .edgeLabel tspan, .edgeLabel span, .edgeLabel p'
  );
  relLabelTexts.forEach((text) => {
    text.style.setProperty('color', '#111827', 'important');
    text.style.setProperty('fill', '#111827', 'important');
    text.style.setProperty('font-weight', '500', 'important');
  });

  // 4. Cardinality markers in <defs>
  const markers = svg.querySelectorAll<SVGElement>(
    'defs marker, marker[id*="only_one"], marker[id*="zero_or_one"], marker[id*="one_or_more"], marker[id*="zero_or_more"], .marker.er'
  );
  markers.forEach((marker) => {
    const shapes = marker.querySelectorAll<SVGElement>('circle, path, line, polygon');
    shapes.forEach((shape) => {
      shape.style.setProperty('stroke', '#334155', 'important');
      shape.style.setProperty('stroke-width', '1.5px', 'important');
      const tag = shape.tagName.toLowerCase();
      if (tag === 'circle') {
        shape.style.setProperty('fill', '#ffffff', 'important');
      } else if (tag === 'path' || tag === 'polygon') {
        const fill = shape.getAttribute('fill') || shape.style.fill;
        if (fill && fill !== 'none') {
          shape.style.setProperty('fill', '#ffffff', 'important');
        }
      }
    });
  });
}
function normalizeMermaidCode(raw: string): string {
  if (!raw) return '';

  // Step 1: Normalize \r\n → \n
  let code = raw.replace(/\r\n/g, '\n');

  // Step 2: If the code has no real newlines but has literal \n sequences,
  // convert them. This detects the "JSON-escaped newline stored as two chars"
  // scenario without risking corruption of legitimate content.
  const hasRealNewlines = code.includes('\n');
  const hasLiteralBackslashN = code.includes('\\n');

  if (!hasRealNewlines && hasLiteralBackslashN) {
    // The entire diagram is on one "line" with \n as separators — convert them.
    code = code.split('\\n').join('\n');
  }

  return code.trim();
}


// ─── Helper: remove orphaned Mermaid error SVG elements ───────────────────────
//
// When mermaid.render() fails, Mermaid may inject a hidden error SVG element
// with the requested ID directly into the document body. On subsequent renders
// this stale element can interfere with the DOM or become visible. We clean it
// up before each render attempt.
//
function removeOrphanedMermaidElement(svgId: string): void {
  try {
    const orphan = document.getElementById(svgId);
    if (orphan) {
      orphan.remove();
    }
  } catch {
    // Silently ignore — cleanup is best-effort
  }
}


// ─── Component ────────────────────────────────────────────────────────────────

interface MermaidDiagramProps {
  /** Raw Mermaid DSL string */
  code: string;
  /**
   * Per-page index (0-based). Combined with React's useId() to guarantee
   * a globally unique Mermaid SVG element ID even when multiple diagrams
   * appear on the same page.
   */
  diagramIndex: number;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code, diagramIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  // useId() returns a string like ":r3:" — strip colons so it's a valid HTML id
  const uid = useId().replace(/:/g, '');
  const svgId = `mermaid-${diagramIndex}-${uid}`;

  useEffect(() => {
    if (!containerRef.current || !code?.trim()) return;

    let cancelled = false;

    const render = async () => {
      try {
        setError(null);
        setIsRendered(false);

        // Clear previous render
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Remove any orphaned Mermaid error element left from a prior failed render
        removeOrphanedMermaidElement(svgId);

        // Normalize input before handing to Mermaid:
        //  - convert literal \n sequences to real newlines
        //  - normalize \r\n line endings
        //  - trim whitespace
        const normalizedCode = normalizeMermaidCode(code);

        if (!normalizedCode) {
          setError('Diagram code is empty');
          return;
        }

        const { svg, bindFunctions } = await mermaid.render(svgId, normalizedCode);

        if (cancelled || !containerRef.current) return;

        // Mermaid sometimes injects error SVGs that contain "Syntax error" text.
        // Detect these before injecting them into the visible DOM.
        if (svg && svg.includes('Syntax error') && svg.includes('mermaid')) {
          throw new Error('Mermaid returned a syntax error SVG — invalid diagram syntax');
        }

        const isEr = normalizedCode.trim().startsWith('erDiagram');

        // Strip shrinking attributes before injection
        const styledSvg = isEr ? styleErSvg(svg) : svg;
        containerRef.current.innerHTML = normalizeSvg(styledSvg);

        // Apply dedicated post-processing styles directly to rendered ER SVG elements
        if (isEr && containerRef.current) {
          applyErDiagramStyles(containerRef.current);
        }

        // Wire up any interactive elements (flowchart click handlers, etc.)
        if (bindFunctions) {
          bindFunctions(containerRef.current);
        }

        setIsRendered(true);
      } catch (err: any) {
        if (cancelled) return;
        // Clean up any error element Mermaid may have left in the DOM
        removeOrphanedMermaidElement(svgId);
        console.error('[MermaidDiagram] render error:', err);
        const msg =
          (err?.message ?? '')
            .replace(/^Error:\s*/i, '')
            .split('\n')[0]
            .trim() || 'Invalid diagram syntax';
        setError(msg);
        setIsRendered(false);
      }
    };

    render();

    return () => {
      cancelled = true;
    };
    // svgId is derived from stable values (diagramIndex + uid) and code;
    // adding "code" as the primary dep triggers re-render on prop change.
  }, [code, svgId]);

  // ── Error state: amber banner + raw-code fallback ────────────────────────
  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium leading-relaxed">
            Diagram render error:{' '}
            <span className="font-mono break-all">{error}</span>
          </p>
        </div>
        {/* Fallback: show raw DSL so the user still has the data */}
        <pre className="text-[11px] font-mono leading-relaxed text-emerald-300 bg-slate-950 p-4 rounded-xl overflow-x-auto border border-slate-800 whitespace-pre">
          {code}
        </pre>
      </div>
    );
  }

  // ── Normal / loading state ───────────────────────────────────────────────
  return (
    <div className="relative">
      {/*
       * Container layout:
       *  - normalizeSvg() keeps the SVG's natural pixel width attribute and
       *    injects  style="max-width:100%;height:auto;"  inline.
       *  - Small diagrams render at natural width (no stretching).
       *  - Large diagrams are capped at the container width and scale down
       *    proportionally via viewBox + height:auto.
       *  - overflow-x-auto is a last-resort scroll fallback for extreme cases
       *    (e.g. very wide sequence diagrams); it won't trigger for typical ER
       *    or flowchart diagrams at normal viewport widths.
       */}
      <div
        ref={containerRef}
        className={[
          'mermaid-output',
          // No explicit width on the wrapper — it naturally fills the available
          // column width (block layout). The SVG inside is capped by max-width:100%.
          'overflow-x-auto', // safety scroll fallback for pathologically wide diagrams
          'rounded-xl',
          'border border-slate-700/50',
          'bg-slate-950',
          'p-4',
          // Centre SVGs whose natural width is smaller than the container.
          // This has no effect on SVGs that fill the container width.
          '[&_svg]:block [&_svg]:mx-auto',
        ].join(' ')}
        style={{ minHeight: isRendered ? undefined : '120px' }}
      />
      {!isRendered && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] text-slate-500 animate-pulse">
            Rendering diagram…
          </span>
        </div>
      )}
    </div>
  );
};

export default MermaidDiagram;
