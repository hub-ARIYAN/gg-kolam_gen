import { CurvePoint } from '@/types/kolam';

export function generateSVGPath(curvePoints?: CurvePoint[]): string {
    if (!curvePoints || curvePoints.length === 0) return '';
    let path = `M ${curvePoints[0].x} ${curvePoints[0].y}`;
    for (let i = 1; i < curvePoints.length; i++) {
        const point = curvePoints[i];
        const prevPoint = curvePoints[i - 1];
        if (point.controlX !== undefined && point.controlY !== undefined) {
            path += ` Q ${point.controlX} ${point.controlY} ${point.x} ${point.y}`;
        } else {
            const controlX = (prevPoint.x + point.x) / 2;
            const controlY = (prevPoint.y + point.y) / 2;
            path += ` Q ${controlX} ${controlY} ${point.x} ${point.y}`;
        }
    }
    return path;
}




