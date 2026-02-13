// Kolam generator for traditional South Indian geometric patterns
import { KOLAM_CURVE_PATTERNS } from '@/data/kolamPatterns';
import { CurvePoint, Dot, KolamPattern, Line } from '@/types/kolam';

export class KolamGenerator {
	private static readonly CELL_SPACING = 60;

	// Core constants for kolam generation (exact copy from zen-kolam)
	private static readonly pt_dn = [0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1];
	private static readonly pt_rt = [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1];
	private static readonly mate_pt_dn = {
		1: [2, 3, 5, 6, 9, 10, 12],
		2: [4, 7, 8, 11, 13, 14, 15, 16]
	} as const;
	private static readonly mate_pt_rt = {
		1: [2, 3, 4, 6, 7, 11, 13],
		2: [5, 8, 9, 10, 12, 14, 15, 16]
	} as const;
	private static readonly h_inv = [1, 2, 5, 4, 3, 9, 8, 7, 6, 10, 11, 12, 15, 14, 13, 16];
	private static readonly v_inv = [1, 4, 3, 2, 5, 7, 6, 9, 8, 10, 11, 14, 13, 12, 15, 16];
	private static readonly h_self = KolamGenerator.findSelfInverse(KolamGenerator.h_inv);
	private static readonly v_self = KolamGenerator.findSelfInverse(KolamGenerator.v_inv);

	private static findSelfInverse(inv: number[]): number[] {
		const result: number[] = [];
		for (let i = 0; i < inv.length; i++) {
			if (inv[i] === i + 1) {
				result.push(i + 1);
			}
		}
		return result;
	}
	private static intersect(arr1: number[], arr2: number[]): number[] {
		return arr1.filter(x => arr2.includes(x));
	}
	private static randomChoice(arr: number[]): number {
		if (arr.length === 0) return 1;
		return arr[Math.floor(Math.random() * arr.length)];
	}
	private static ones(size: number): number[][] {
		const matrix: number[][] = [];
		for (let i = 0; i < size; i++) {
			matrix[i] = new Array(size).fill(1);
		}
		return matrix;
	}

	// Literal translation of propose_kolam1D.m
	static proposeKolam1D(size_of_kolam: number): number[][] {
		const odd = (size_of_kolam % 2) !== 0;
		let hp: number = odd ? Math.floor((size_of_kolam - 1) / 2) : size_of_kolam / 2;
		const Mat = this.ones(hp + 2);

		for (let i = 1; i <= hp; i++) {
			for (let j = 1; j <= hp; j++) {
				const ptDnValue = this.pt_dn[Mat[i - 1][j] - 1];
				const Valid_by_Up = this.mate_pt_dn[ptDnValue + 1 as keyof typeof this.mate_pt_dn];

				const ptRtValue = this.pt_rt[Mat[i][j - 1] - 1];
				const Valid_by_Lt = this.mate_pt_rt[ptRtValue + 1 as keyof typeof this.mate_pt_rt];

				const Valids = this.intersect(Valid_by_Up, Valid_by_Lt);
				try { Mat[i][j] = this.randomChoice(Valids); } catch { Mat[i][j] = 1; }
			}
		}

		Mat[hp + 1][0] = 1; Mat[0][hp + 1] = 1;

		for (let j = 1; j <= hp; j++) {
			const ptDnValue = this.pt_dn[Mat[hp][j] - 1];
			const Valid_by_Up = this.mate_pt_dn[ptDnValue + 1 as keyof typeof this.mate_pt_dn];
			const ptRtValue = this.pt_rt[Mat[hp + 1][j - 1] - 1];
			const Valid_by_Lt = this.mate_pt_rt[ptRtValue + 1 as keyof typeof this.mate_pt_rt];
			let Valids = this.intersect(Valid_by_Up, Valid_by_Lt);
			Valids = this.intersect(Valids, this.v_self);
			try { Mat[hp + 1][j] = this.randomChoice(Valids); } catch { Mat[hp + 1][j] = 1; }
		}

		for (let i = 1; i <= hp; i++) {
			const ptDnValue = this.pt_dn[Mat[i - 1][hp + 1] - 1];
			const Valid_by_Up = this.mate_pt_dn[ptDnValue + 1 as keyof typeof this.mate_pt_dn];
			const ptRtValue = this.pt_rt[Mat[i][hp] - 1];
			const Valid_by_Lt = this.mate_pt_rt[ptRtValue + 1 as keyof typeof this.mate_pt_rt];
			let Valids = this.intersect(Valid_by_Up, Valid_by_Lt);
			Valids = this.intersect(Valids, this.h_self);
			try { Mat[i][hp + 1] = this.randomChoice(Valids); } catch { Mat[i][hp + 1] = 1; }
		}

		const ptDnValue = this.pt_dn[Mat[hp][hp + 1] - 1];
		const Valid_by_Up = this.mate_pt_dn[ptDnValue + 1 as keyof typeof this.mate_pt_dn];
		const ptRtValue = this.pt_rt[Mat[hp + 1][hp] - 1];
		const Valid_by_Lt = this.mate_pt_rt[ptRtValue + 1 as keyof typeof this.mate_pt_rt];
		let Valids = this.intersect(Valid_by_Up, Valid_by_Lt);
		Valids = this.intersect(Valids, this.h_self);
		Valids = this.intersect(Valids, this.v_self);
		try { Mat[hp + 1][hp + 1] = this.randomChoice(Valids); } catch { Mat[hp + 1][hp + 1] = 1; }

		const Mat1: number[][] = [];
		for (let i = 1; i <= hp; i++) { Mat1[i - 1] = []; for (let j = 1; j <= hp; j++) { Mat1[i - 1][j - 1] = Mat[i][j]; } }
		const Mat3: number[][] = [];
		for (let i = hp - 1; i >= 0; i--) { Mat3[hp - 1 - i] = []; for (let j = 0; j < hp; j++) { Mat3[hp - 1 - i][j] = this.v_inv[Mat1[i][j] - 1]; } }
		const Mat2: number[][] = [];
		for (let i = 0; i < hp; i++) { Mat2[i] = []; for (let j = hp - 1; j >= 0; j--) { Mat2[i][hp - 1 - j] = this.h_inv[Mat1[i][j] - 1]; } }
		const Mat4: number[][] = [];
		for (let i = hp - 1; i >= 0; i--) { Mat4[hp - 1 - i] = []; for (let j = 0; j < hp; j++) { Mat4[hp - 1 - i][j] = this.v_inv[Mat2[i][j] - 1]; } }

		let M: number[][];
		if (odd) {
			const size = 2 * hp + 1; M = Array(size).fill(null).map(() => Array(size).fill(1));
			for (let i = 0; i < hp; i++) for (let j = 0; j < hp; j++) M[i][j] = Mat1[i][j];
			for (let i = 1; i < hp + 1; i++) M[i - 1][hp] = Mat[i][hp + 1];
			for (let i = 0; i < hp; i++) for (let j = 0; j < hp; j++) M[i][hp + 1 + j] = Mat2[i][j];
			for (let j = 1; j < hp + 2; j++) M[hp][j - 1] = Mat[hp + 1][j];
			for (let j = hp; j >= 1; j--) M[hp][hp + (hp - j + 1)] = this.h_inv[Mat[hp + 1][j] - 1];
			for (let i = 0; i < hp; i++) for (let j = 0; j < hp; j++) M[hp + 1 + i][j] = Mat3[i][j];
			for (let i = hp; i >= 1; i--) M[hp + (hp - i + 1)][hp] = this.v_inv[Mat[i][hp + 1] - 1];
			for (let i = 0; i < hp; i++) for (let j = 0; j < hp; j++) M[hp + 1 + i][hp + 1 + j] = Mat4[i][j];
		} else {
			const size = 2 * hp; M = Array(size).fill(null).map(() => Array(size).fill(1));
			for (let i = 0; i < hp; i++) for (let j = 0; j < hp; j++) M[i][j] = Mat1[i][j];
			for (let i = 0; i < hp; i++) for (let j = 0; j < hp; j++) M[i][hp + j] = Mat2[i][j];
			for (let i = 0; i < hp; i++) for (let j = 0; j < hp; j++) M[hp + i][j] = Mat3[i][j];
			for (let i = 0; i < hp; i++) for (let j = 0; j < hp; j++) M[hp + i][hp + j] = Mat4[i][j];
		}
		return M;
	}

	// Literal translation of draw_kolam.m coordinate conversion
	static drawKolam(M: number[][]): KolamPattern {
		const m = M.length;
		const n = M[0].length;
		const flippedM: number[][] = [];
		for (let i = m - 1; i >= 0; i--) { flippedM[m - 1 - i] = [...M[i]]; }

		const dots: Dot[] = [];
		const curves: Line[] = [];

		for (let i = 0; i < m; i++) {
			for (let j = 0; j < n; j++) {
				if (flippedM[i][j] > 0) {
					dots.push({
						id: `dot-${i}-${j}`,
						center: { x: (j + 1) * this.CELL_SPACING, y: (i + 1) * this.CELL_SPACING },
						radius: 3,
						color: '#ffffff',
						filled: true
					});

					const patternIndex = flippedM[i][j] - 1;
					if (patternIndex >= 0 && patternIndex < KOLAM_CURVE_PATTERNS.length) {
						const pattern = KOLAM_CURVE_PATTERNS[patternIndex];
						const curvePoints: CurvePoint[] = pattern.points.map(point => ({
							x: ((j + 1) + point.x) * this.CELL_SPACING,
							y: ((i + 1) + point.y) * this.CELL_SPACING,
							controlX: point.controlX !== undefined ? ((j + 1) + point.controlX) * this.CELL_SPACING : undefined,
							controlY: point.controlY !== undefined ? ((i + 1) + point.controlY) * this.CELL_SPACING : undefined
						}));

						curves.push({
							id: `curve-${i}-${j}`,
							start: curvePoints[0],
							end: curvePoints[curvePoints.length - 1],
							curvePoints,
							strokeWidth: 1.5,
							color: '#ffffff'
						});
					}
				}
			}
		}

		const grid = {
			size: Math.max(m, n),
			cells: Array(m).fill(null).map((_, i) =>
				Array(n).fill(null).map((_, j) => ({
					row: i,
					col: j,
					patternId: flippedM[i][j],
					dotCenter: { x: (j + 1) * this.CELL_SPACING, y: (i + 1) * this.CELL_SPACING }
				}))
			),
			cellSpacing: this.CELL_SPACING
		};

		return {
			id: `kolam-${m}x${n}`,
			name: `Kolam ${m}×${n}`,
			grid,
			curves,
			dots,
			symmetryType: '1D',
			dimensions: { width: (n + 1) * this.CELL_SPACING, height: (m + 1) * this.CELL_SPACING },
			created: new Date(),
			modified: new Date()
		};
	}

	// Main entry point - generate kolam pattern using algorithm
	static generateKolam1D(size: number): KolamPattern {
		const matrix = this.proposeKolam1D(size);
		return this.drawKolam(matrix);
	}
}
