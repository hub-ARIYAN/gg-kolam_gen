// Exact zen‑kolam pattern data and helpers
import { KolamCurvePattern } from '@/types/kolam';
// Import the same JSON used by zen-kolam for a 1:1 match
// Keeping it external avoids duplicating a huge JSON file
// If you prefer, we can copy it into src/data later.
// @ts-ignore - Vite supports JSON imports
import kolamData from '../../zen-kolam/src/data/kolamPatternsData.json';

export const KOLAM_CURVE_PATTERNS: KolamCurvePattern[] = kolamData.patterns.map((p: any) => ({
    id: p.id,
    points: p.points,
    hasDownConnection: p.hasDownConnection,
    hasRightConnection: p.hasRightConnection,
}));

export const CONNECTIVITY_RULES = {
    downConnectors: new Set(
        KOLAM_CURVE_PATTERNS.filter(p => p.hasDownConnection).map(p => p.id)
    ),
    rightConnectors: new Set(
        KOLAM_CURVE_PATTERNS.filter(p => p.hasRightConnection).map(p => p.id)
    ),
    compatiblePatterns: generateCompatibilityMatrix()
};

function generateCompatibilityMatrix(): { [key: number]: number[] } {
    const matrix: { [key: number]: number[] } = {};
    for (let i = 1; i <= 16; i++) {
        const current = KOLAM_CURVE_PATTERNS.find(p => p.id === i);
        if (!current) continue;
        const compatible: number[] = [];
        for (let j = 1; j <= 16; j++) {
            if (i === j) continue;
            const target = KOLAM_CURVE_PATTERNS.find(p => p.id === j);
            if (!target) continue;
            if (current.hasRightConnection || current.hasDownConnection) {
                if (target.hasRightConnection || target.hasDownConnection || j === 1) compatible.push(j);
            } else {
                compatible.push(j);
            }
        }
        matrix[i] = compatible;
    }
    return matrix;
}

export const SYMMETRY_TRANSFORMS = {
    horizontalInverse: [1, 2, 5, 4, 3, 9, 8, 7, 6, 10, 11, 12, 15, 14, 13, 16],
    verticalInverse:   [1, 4, 3, 2, 5, 7, 6, 9, 8, 10, 11, 14, 13, 12, 15, 16],
    rotation90:        [1, 3, 2, 5, 4, 6, 9, 8, 7, 11, 10, 13, 12, 15, 14, 16],
    diagonalSymmetric: [1, 6, 8, 16],
    horizontalSymmetric: [1, 2, 5, 10, 11, 12, 16],
    verticalSymmetric:   [1, 3, 5, 10, 11, 14, 16],
};
