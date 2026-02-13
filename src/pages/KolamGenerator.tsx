import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KolamPattern } from '../types/kolam';
import { KolamGenerator } from '../utils/kolamGenerator';
import { SVGGenerator, generateKolamSVG } from '../utils/svgGenerator';
import KolamDisplay from '../components/KolamDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Palette, Play, Square, Sparkles, RotateCcw, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import genBack from '@/assets/gen_back.png';

const KolamGeneratorPage: React.FC = () => {
	const navigate = useNavigate();
	const [currentPattern, setCurrentPattern] = useState<KolamPattern | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [size, setSize] = useState([5]);
	const [animated, setAnimated] = useState(true);
	const [animationDuration, setAnimationDuration] = useState([3000]);
	const [showDots, setShowDots] = useState(true);
	const [backgroundColor, setBackgroundColor] = useState('#ffffff');
	const [strokeColor, setStrokeColor] = useState('#2D3748');

	// Auto-generate on first mount so canvas isn't blank
	useEffect(() => {
		try {
			const initial = KolamGenerator.generateKolam1D(size[0] || 7);
			setCurrentPattern(initial);
		} catch (e) {
			console.error('Failed to pre-generate kolam', e);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const generatePattern = async (type: 'square' | 'diamond' | 'star' | 'traditional') => {
		setIsGenerating(true);
		try {
			// Simulate generation delay for better UX
			await new Promise(resolve => setTimeout(resolve, 500));
			// Use exact zen-kolam generator (1D algorithm)
			const pattern = KolamGenerator.generateKolam1D(size[0]);
			setCurrentPattern(pattern);
			toast.success(`Kolam generated!`);
		} catch (error) {
			toast.error('Failed to generate kolam pattern');
		} finally {
			setIsGenerating(false);
		}
	};

	const generateTraditional = async () => {
		setIsGenerating(true);
		try {
			await new Promise(resolve => setTimeout(resolve, 800));
			
			// Traditional also uses the 1D generator for consistency
			const pattern = KolamGenerator.generateKolam1D(size[0]);
			setCurrentPattern(pattern);
			toast.success('Kolam generated!');
		} catch (error) {
			toast.error('Failed to generate kolam pattern');
		} finally {
			setIsGenerating(false);
		}
	};

	const downloadPNG = async () => {
		if (!currentPattern) return;
		
		try {
			// Use the same SVG as on-screen for pixel-perfect match
			const PADDING = 40;
			const svg = generateKolamSVG(currentPattern, {
					background: backgroundColor,
					brush: strokeColor,
				padding: PADDING,
					showDots
				});
			
			// Convert SVG to PNG using canvas
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const img = new Image();
			
			const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(svgBlob);
			
			img.onload = () => {
				const w = currentPattern.dimensions.width + PADDING * 2;
				const h = currentPattern.dimensions.height + PADDING * 2;
				canvas.width = w;
				canvas.height = h;
				// Ensure background color matches the preview even if SVG background is via CSS
				if (ctx) {
					ctx.fillStyle = backgroundColor || '#ffffff';
					ctx.fillRect(0, 0, w, h);
					ctx.drawImage(img, 0, 0, w, h);
				}
				
				canvas.toBlob((blob) => {
					if (blob) {
						const pngUrl = URL.createObjectURL(blob);
						const a = document.createElement('a');
						a.href = pngUrl;
						a.download = `kolam_${currentPattern.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.png`;
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
						URL.revokeObjectURL(pngUrl);
						toast.success('PNG downloaded successfully!');
					}
				}, 'image/png');
			};
			
			img.src = url;
		} catch (error) {
			toast.error('Failed to download PNG');
		}
	};

	return (
		<div
			className="min-h-screen p-6 bg-cover bg-center bg-fixed relative"
			style={{
				backgroundImage: `linear-gradient(135deg, rgba(12,12,14,0.25), rgba(28,16,8,0.65)), url(${genBack})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundAttachment: 'fixed'
			}}
		>
			<div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/20" />
			<div className="relative z-10 max-w-7xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<Button 
						onClick={() => navigate('/')} 
						variant="outline" 
						className="flex items-center gap-2 bg-black/70 backdrop-blur hover:bg-white shadow-sm"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Analyzer
					</Button>
					<div className="text-center">
						<h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
							🎨 Kolam Pattern Generator
						</h1>
						<p className="text-lg text-white">
							Create beautiful traditional South Indian kolam patterns
						</p>
					</div>
					<div className="w-32"></div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Controls */}
					<div className="lg:col-span-1 space-y-6 ">
						<Card className="bg-white/80 backdrop-blur border-0 shadow-xl rounded-2xl text-zinc-900">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Sparkles className="w-5 h-5 text-zinc-900" />
										Generate
									</CardTitle>
									<CardDescription className='text-zinc-700'>
										Click to create a kolam
									</CardDescription>
								</CardHeader>
							<CardContent className="space-y-3">
									<Button 
										onClick={() => {
											const types: Array<'square'|'diamond'|'star'|'traditional'> = ['square','diamond','star','traditional'];
											const t = types[Math.floor(Math.random()*types.length)];
											generatePattern(t);
										}}
										disabled={isGenerating}
									className="w-full bg-amber-600 hover:bg-amber-700 text-zinc-900 shadow-lg shadow-amber-600/20"
									variant="default"
									>
										<Play className="w-4 h-4 mr-2" />
										Generate
									</Button>
								</CardContent>
							</Card>

						<Card className="bg-white/80 backdrop-blur border-0 shadow-xl rounded-2xl text-zinc-900">
							<CardHeader>
								<CardTitle>Settings</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="size">Grid Size: {size[0]}x{size[0]}</Label>
									<Slider
										id="size"
										min={3}
										max={15}
										step={1}
										value={size}
										onValueChange={setSize}
										className="mt-2"
									/>
								</div>

								<div className="flex items-center space-x-2">
									<Switch
										id="animated"
										checked={animated}
										onCheckedChange={setAnimated}
									/>
									<Label htmlFor="animated">Enable Animation</Label>
								</div>

								{animated && (
									<div>
										<Label htmlFor="duration">Animation Duration: {animationDuration[0]}ms</Label>
										<Slider
											id="duration"
											min={1000}
											max={8000}
											step={500}
											value={animationDuration}
											onValueChange={setAnimationDuration}
											className="mt-2"
										/>
									</div>
								)}

								<div className="flex items-center space-x-2">
									<Switch
										id="showDots"
										checked={showDots}
										onCheckedChange={setShowDots}
									/>
									<Label htmlFor="showDots">Show Dots</Label>
								</div>
							</CardContent>
						</Card>

							{currentPattern && (
								<Card className="bg-white/80 backdrop-blur border-0 shadow-xl rounded-2xl text-zinc-900">
								<CardHeader>
										<CardTitle>Export</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
										<Button onClick={downloadPNG} className="w-full bg-zinc-900 text-white hover:bg-zinc-800 shadow-md" variant="default">
										<Download className="w-4 h-4 mr-2" />
										Download PNG
									</Button>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Display */}
					<div className="lg:col-span-2">
						<Card className="bg-zinc-950 border-0 rounded-3xl shadow-2xl ring-1 ring-zinc-800">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Play className="w-5 h-5" />
									{currentPattern ? currentPattern.name : 'Kolam Preview'}
								</CardTitle>
								<CardDescription>
									{currentPattern 
										? `${currentPattern.grid.size}x${currentPattern.grid.size} grid • ${currentPattern.curves.length} curves`
										: 'Generate a pattern to see it here'
									}
								</CardDescription>
							</CardHeader>
								<CardContent>
								<div className="flex justify-center">
									<KolamDisplay
											pattern={currentPattern}
											animated={animated}
											animationDuration={animationDuration[0]}
											showDots={showDots}
											backgroundColor={backgroundColor}
											strokeColor={strokeColor}
										className="w-full"
									/>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default KolamGeneratorPage;
