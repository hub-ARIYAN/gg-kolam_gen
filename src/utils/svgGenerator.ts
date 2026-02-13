// SVG generator for kolam patterns
import { KolamPattern, Line, Dot } from '../types/kolam';
import { generateSVGPath } from './svgPathGenerator';

export class SVGGenerator {
	/**
	 * Generate SVG string from kolam pattern
	 */
	static generateSVG(pattern: KolamPattern, options: {
		width?: number;
		height?: number;
		backgroundColor?: string;
		showDots?: boolean;
		strokeColor?: string;
		strokeWidth?: number;
	} = {}): string {
		const {
			width = pattern.dimensions.width,
			height = pattern.dimensions.height,
			backgroundColor = 'white',
			showDots = true,
			strokeColor = '#2D3748',
			strokeWidth = 2
		} = options;

		// Create SVG header
		let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
		
		// Add background
		if (backgroundColor !== 'transparent') {
			svg += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`;
		}

		// Add curves
		for (const curve of pattern.curves) {
			svg += `<line x1="${curve.start.x}" y1="${curve.start.y}" x2="${curve.end.x}" y2="${curve.end.y}" 
				stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;
		}

		// Add dots
		if (showDots) {
			for (const dot of pattern.dots) {
				svg += `<circle cx="${dot.center.x}" cy="${dot.center.y}" r="${dot.radius || 4}" 
					fill="${dot.color || '#E53E3E'}" stroke="none"/>`;
			}
		}

		svg += '</svg>';
		return svg;
	}

	/**
	 * Generate animated SVG with drawing effect
	 */
	static generateAnimatedSVG(pattern: KolamPattern, duration: number = 3000, options: {
		width?: number;
		height?: number;
		backgroundColor?: string;
		showDots?: boolean;
		strokeColor?: string;
		strokeWidth?: number;
	} = {}): string {
		const {
			width = pattern.dimensions.width,
			height = pattern.dimensions.height,
			backgroundColor = 'white',
			showDots = true,
			strokeColor = '#2D3748',
			strokeWidth = 2
		} = options;

		// Create SVG header with animation support
		let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
		
		// Add background
		if (backgroundColor !== 'transparent') {
			svg += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`;
		}

		// Add animated curves
		const totalCurves = pattern.curves.length;
		for (let i = 0; i < pattern.curves.length; i++) {
			const curve = pattern.curves[i];
			const delay = (i / totalCurves) * duration;
			
			svg += `<line x1="${curve.start.x}" y1="${curve.start.y}" x2="${curve.end.x}" y2="${curve.end.y}" 
				stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round"
				stroke-dasharray="${this.calculateLineLength(curve)}"
				stroke-dashoffset="${this.calculateLineLength(curve)}"
				opacity="0">
				<animate attributeName="stroke-dashoffset" 
					values="${this.calculateLineLength(curve)};0" 
					dur="${Math.max(100, duration / totalCurves)}ms" 
					begin="${delay}ms" 
					fill="freeze"/>
				<animate attributeName="opacity" 
					values="0;1" 
					dur="50ms" 
					begin="${delay}ms" 
					fill="freeze"/>
			</line>`;
		}

		// Add animated dots
		if (showDots) {
			for (let i = 0; i < pattern.dots.length; i++) {
				const dot = pattern.dots[i];
				const delay = (i / pattern.dots.length) * duration;
				
				svg += `<circle cx="${dot.center.x}" cy="${dot.center.y}" r="${dot.radius || 4}" 
					fill="${dot.color || '#E53E3E'}" stroke="none" opacity="0">
					<animate attributeName="opacity" 
						values="0;1" 
						dur="200ms" 
						begin="${delay}ms" 
						fill="freeze"/>
				</circle>`;
			}
		}

		svg += '</svg>';
		return svg;
	}

	/**
	 * Calculate line length for stroke-dasharray
	 */
	private static calculateLineLength(line: Line): number {
		const dx = line.end.x - line.start.x;
		const dy = line.end.y - line.start.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	/**
	 * Generate embed code for the kolam
	 */
	static generateEmbedCode(pattern: KolamPattern, options: {
		width?: number;
		height?: number;
		animated?: boolean;
		duration?: number;
	} = {}): string {
		const svgContent = options.animated 
			? this.generateAnimatedSVG(pattern, options.duration, options)
			: this.generateSVG(pattern, options);

		// Encode SVG for data URL
		const encodedSvg = encodeURIComponent(svgContent);
		const dataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;

		return `<img src="${dataUrl}" width="${options.width || pattern.dimensions.width}" height="${options.height || pattern.dimensions.height}" alt="Kolam Pattern" />`;
	}
}

// Zen-kolam style SVG generator (paths with smooth curves)
export function generateKolamSVG(
    pattern: KolamPattern,
    options: { background?: string; brush?: string; padding?: number; showDots?: boolean } = {}
): string {
    const { background = '#fef3c7', brush = '#92400e', padding = 0, showDots = true } = options;
    const { dimensions, dots, curves } = pattern;

    const paddedWidth = dimensions.width + padding * 2;
    const paddedHeight = dimensions.height + padding * 2;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${paddedWidth}" height="${paddedHeight}" viewBox="0 0 ${paddedWidth} ${paddedHeight}" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; background-color: ${background};">\n  <defs>\n    <style>\n      .kolam-curve { fill: none; stroke: ${brush}; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }\n      .kolam-dot { fill: ${brush}; }\n    </style>\n  </defs>\n  <g transform="translate(${padding}, ${padding})">`;

    // Dots
    if (showDots) {
        dots.forEach(dot => {
            svg += `\n    <circle class=\"kolam-dot\" cx=\"${dot.center.x}\" cy=\"${dot.center.y}\" r=\"${dot.radius || 3}\" fill=\"${brush}\" stroke=\"${brush}\" stroke-width=\"1\"/>`;
        });
    }

    // Curves
    curves.forEach(curve => {
        if (curve.curvePoints && curve.curvePoints.length > 1) {
            const path = generateSVGPath(curve.curvePoints);
            svg += `\n    <path class=\"kolam-curve\" d=\"${path}\"/>`;
        } else {
            svg += `\n    <line class=\"kolam-curve\" x1=\"${curve.start.x}\" y1=\"${curve.start.y}\" x2=\"${curve.end.x}\" y2=\"${curve.end.y}\"/>`;
        }
    });

    svg += `\n  </g>\n</svg>`;
    return svg;
}

// Animated zen-style SVG (progressively draws curves)
export function generateKolamAnimatedSVG(
    pattern: KolamPattern,
    durationMs: number = 3000,
    options: { background?: string; brush?: string; padding?: number; showDots?: boolean } = {}
): string {
    const { background = '#fef3c7', brush = '#92400e', padding = 0, showDots = true } = options;
    const { dimensions, dots, curves } = pattern;

    const paddedWidth = dimensions.width + padding * 2;
    const paddedHeight = dimensions.height + padding * 2;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${paddedWidth}" height="${paddedHeight}" viewBox="0 0 ${paddedWidth} ${paddedHeight}" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto; background-color: ${background};">\n  <defs>\n    <style>\n      .kolam-curve { fill: none; stroke: ${brush}; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }\n      .kolam-dot { fill: ${brush}; }\n    </style>\n  </defs>\n  <g transform="translate(${padding}, ${padding})">`;

    // Dots fade in near the end
    if (showDots) {
        dots.forEach((dot, i) => {
            const delay = durationMs * 0.9 + (i / Math.max(1, dots.length)) * durationMs * 0.1;
            svg += `\n    <circle class=\"kolam-dot\" cx=\"${dot.center.x}\" cy=\"${dot.center.y}\" r=\"${dot.radius || 3}\" fill=\"${brush}\" opacity=\"0\">\n      <animate attributeName=\"opacity\" values=\"0;1\" dur=\"200ms\" begin=\"${delay}ms\" fill=\"freeze\"/>\n    </circle>`;
        });
    }

    // Curves animate drawing using stroke-dashoffset
    // Make total animation roughly equal to durationMs: last curve ends near durationMs
    const perCurve = Math.max(20, durationMs / Math.max(1, curves.length));
    curves.forEach((curve, idx) => {
        const begin = idx * perCurve;
        if (curve.curvePoints && curve.curvePoints.length > 1) {
            const path = generateSVGPath(curve.curvePoints);
            svg += `\n    <path class=\"kolam-curve\" d=\"${path}\" stroke-dasharray=\"1000\" stroke-dashoffset=\"1000\" opacity=\"0\">\n      <animate attributeName=\"opacity\" values=\"0;1\" dur=\"1ms\" begin=\"${begin}ms\" fill=\"freeze\"/>\n      <animate attributeName=\"stroke-dashoffset\" values=\"1000;0\" dur=\"${perCurve}ms\" begin=\"${begin}ms\" fill=\"freeze\"/>\n    </path>`;
        } else {
            svg += `\n    <line class=\"kolam-curve\" x1=\"${curve.start.x}\" y1=\"${curve.start.y}\" x2=\"${curve.end.x}\" y2=\"${curve.end.y}\" stroke-dasharray=\"1000\" stroke-dashoffset=\"1000\" opacity=\"0\">\n      <animate attributeName=\"opacity\" values=\"0;1\" dur=\"1ms\" begin=\"${begin}ms\" fill=\"freeze\"/>\n      <animate attributeName=\"stroke-dashoffset\" values=\"1000;0\" dur=\"${perCurve}ms\" begin=\"${begin}ms\" fill=\"freeze\"/>\n    </line>`;
        }
    });

    svg += `\n  </g>\n</svg>`;
    return svg;
}
