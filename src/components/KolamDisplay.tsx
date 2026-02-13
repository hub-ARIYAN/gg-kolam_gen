import React, { useEffect, useRef, useState } from 'react';
import { KolamPattern } from '../types/kolam';
import { SVGGenerator } from '../utils/svgGenerator';
import { generateKolamSVG, generateKolamAnimatedSVG } from '../utils/svgGenerator';

interface KolamDisplayProps {
	pattern: KolamPattern | null;
	animated?: boolean;
	animationDuration?: number;
	width?: number;
	height?: number;
	showDots?: boolean;
	backgroundColor?: string;
	strokeColor?: string;
	strokeWidth?: number;
	className?: string;
}

export const KolamDisplay: React.FC<KolamDisplayProps> = ({
	pattern,
	animated = false,
	animationDuration = 3000,
	width,
	height,
	showDots = true,
	backgroundColor = 'white',
	strokeColor = '#2D3748',
	strokeWidth = 2,
	className = ''
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [svgContent, setSvgContent] = useState<string>('');

	useEffect(() => {
		if (!pattern) {
			setSvgContent('');
			return;
		}

        const options = {
            width: width || pattern.dimensions.width,
            height: height || pattern.dimensions.height,
            backgroundColor,
            showDots,
            strokeColor,
            strokeWidth
        } as any;

        // Prefer zen-kolam SVG path rendering for authentic curves
        const useZen = true;
        let svg = '';
        try {
            if (useZen) {
                svg = animated
                    ? generateKolamAnimatedSVG(pattern, animationDuration, { background: '#000000', brush: '#ffffff', padding: 40, showDots })
                    : generateKolamSVG(pattern, { background: '#000000', brush: '#ffffff', padding: 40, showDots });
            } else {
                svg = animated
                    ? SVGGenerator.generateAnimatedSVG(pattern, animationDuration, options)
                    : SVGGenerator.generateSVG(pattern, options);
            }
        } catch (err) {
            console.error('Kolam SVG render failed, using fallback:', err);
            svg = SVGGenerator.generateSVG(pattern, options);
        }

		setSvgContent(svg);
	}, [pattern, animated, animationDuration, width, height, showDots, backgroundColor, strokeColor, strokeWidth]);

	if (!pattern) {
		return (
			<div className={`flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg ${className}`}>
				<div className="text-gray-500 text-center">
					<svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
					<p className="text-lg font-medium">No Kolam Pattern</p>
					<p className="text-sm">Generate a pattern to see it here</p>
				</div>
			</div>
		);
	}

	return (
		<div 
			ref={containerRef}
			className={`bg-black rounded-lg shadow-lg overflow-hidden ${className}`}
			style={{ width: '100%', height: height || 'auto' }}
		>
			<div 
				dangerouslySetInnerHTML={{ __html: svgContent }}
				className="w-full h-auto"
			/>
		</div>
	);
};

export default KolamDisplay;
