# Modules
import re
import webbrowser
import sys
import os

import numpy as np
import svgpathtools
from svgpathtools import Line, CubicBezier
from png_to_svg import raster_to_svg_cv

def clean_equation(eq: str) -> str:
    eq = eq.replace("\\\\", "\\")
    eq = eq.replace("\\left\\{", "{").replace("\\right\\}", "}")
    eq = eq.replace("\\le", "<=").replace(" ", "")
    eq = eq.replace("+-", "-")
    eq = eq.replace("{", " | ").replace("}", "")
    return eq

def generate_equations(image_path, output_dir):
    base_name = os.path.splitext(os.path.basename(image_path))[0]
    eq_path = os.path.join(output_dir, f"{base_name}_equations.txt")

    # --- Begin existing logic ---
    temp_svg = "Images/temp.svg"
    svg_path = raster_to_svg_cv(image_path, temp_svg, threshold=120)
    with open(svg_path, "r") as file:
        data = file.read().replace('fill="#000000" opacity="1.000000" stroke="none"', "")

    def _tokenize_path(pathfinder):
        FLOAT_RE = re.compile(r"[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?")
        for x in re.compile("([MmZzLlHhVvCcSsQqTtAa])").split(pathfinder):
            if x in set("MmZzLlHhVvCcSsQqTtAa"):
                yield x
            for token in FLOAT_RE.findall(x):
                yield token

    def aplusbiFormat(real, imaginary):
        return real + imaginary * 1j

    def extract_path(pathfinder, current_pos=0j):
        elements = list(_tokenize_path(pathfinder))
        elements.reverse()
        segments = []
        start_pos = None
        command = None
        while elements:
            if elements[-1] in set("MmZzLlHhVvCcSsQqTtAa"):
                command = elements.pop()
                absolute = command in set("MZLHVCSQTA")
                command = command.upper()
            else:
                if command is None:
                    raise ValueError("Error!")
            if command == "M":
                x = elements.pop()
                y = elements.pop()
                pos = float(x) + float(y) * 1j
                if absolute:
                    current_pos = pos
                else:
                    current_pos += pos
                start_pos = current_pos
                command = "L"
            elif command == "Z":
                if not (current_pos == start_pos):
                    segments.append(Line(current_pos, start_pos))
                current_pos = start_pos
                command = None
            elif command == "L":
                x = elements.pop()
                y = elements.pop()
                pos = float(x) + float(y) * 1j
                if not absolute:
                    pos += current_pos
                segments.append(Line(current_pos, pos))
                current_pos = pos
            elif command == "C":
                control1 = float(elements.pop()) + float(elements.pop()) * 1j
                control2 = float(elements.pop()) + float(elements.pop()) * 1j
                final = float(elements.pop()) + float(elements.pop()) * 1j
                if not absolute:
                    control1 += current_pos
                    control2 += current_pos
                    final += current_pos
                segments.append(CubicBezier(current_pos, control1, control2, final))
                current_pos = final
        return segments

    pathArray = re.findall(r'<path d="(.*?)"', data, re.DOTALL)
    pathString = ""
    for path in pathArray:
        pathString += path
    path = extract_path(pathString)
    equations = []
    for segment in path:
        if isinstance(segment, svgpathtools.path.Line):
            start = aplusbiFormat(segment.start.real, segment.start.imag)
            end = aplusbiFormat(segment.end.real, segment.end.imag)
            if end.real - start.real != 0 and end.imag - start.imag != 0:
                m = (end.imag - start.imag) / (end.real - start.real)
                b = start.imag - m * start.real
                xMin = min(start.real, end.real)
                xMax = max(start.real, end.real)
                yMin = min(start.imag, end.imag)
                yMax = max(start.imag, end.imag)
                equations.append(
                    "y="
                    + str(m)
                    + "x+"
                    + str(b)
                    + " "
                    + "\\\\left\\\\{"
                    + str(xMin)
                    + "\\\\le x \\\\le "
                    + str(xMax)
                    + "\\\\right\\\\} "
                    + "\\\\left\\\\{"
                    + str(yMin)
                    + "\\\\le y \\\\le "
                    + str(yMax)
                    + "\\\\right\\\\}"
                )
            if end.real - start.real == 0:
                xMin = min(start.real, end.real)
                xMax = max(start.real, end.real)
                yMin = min(start.imag, end.imag)
                yMax = max(start.imag, end.imag)
                equations.append(
                    "x="
                    + str(start.real)
                    + "\\\\left\\\\{"
                    + str(xMin)
                    + "\\\\le x \\\\le "
                    + str(yMin)
                    + "\\\\right\\\\}\\\\left\\\\{"
                    + str(yMin)
                    + "\\\\le y \\\\le "
                    + str(yMax)
                    + "\\\\right\\\\}"
                )
            else:
                yMin = min(start.imag, end.imag)
                yMax = max(start.imag, end.imag)
                equations.append(
                    "x="
                    + str(start.real)
                    + "\\\\left\\\\{"
                    + str(yMin)
                    + "\\\\le y \\\\le "
                    + str(yMax)
                    + "\\\\right\\\\}"
                )
        elif isinstance(segment, svgpathtools.path.CubicBezier):
            p0 = aplusbiFormat(segment.start.real, segment.start.imag)
            p1 = aplusbiFormat(segment.control1.real, segment.control1.imag)
            p2 = aplusbiFormat(segment.control2.real, segment.control2.imag)
            p3 = aplusbiFormat(segment.end.real, segment.end.imag)
            equations.append(
                "\\\\left((1-t)^3*"
                + str(p0.real)
                + "+3*t*(1-t)^2*"
                + str(p1.real)
                + "+3*t^2*(1-t)*"
                + str(p2.real)
                + "+t^3*"
                + str(p3.real)
                + ", (1-t)^3*"
                + str(p0.imag)
                + "+3*t*(1-t)^2*"
                + str(p1.imag)
                + "+3*t^2*(1-t)*"
                + str(p2.imag)
                + "+t^3*"
                + str(p3.imag)
                + ")\\\\right)"
            )
        elif isinstance(segment, svgpathtools.path.QuadraticBezier):
            p0 = aplusbiFormat(segment.start.real, segment.start.imag)
            p1 = aplusbiFormat(segment.control.real, segment.control.imag)
            p2 = aplusbiFormat(segment.end.real, segment.end.imag)
            equations.append(
                "\\\\left((1-t)^2*"
                + str(p0.real)
                + "+2*t*(1-t)*"
                + str(p1.real)
                + "+t^2*"
                + str(p2.real)
                + ", (1-t)^2*"
                + str(p0.imag)
                + "+2*t*(1-t)*"
                + str(p1.imag)
                + "+t^2*"
                + str(p2.imag)
                + ")\\\\right))"
            )
        elif isinstance(segment, svgpathtools.path.Arc):
            p0 = aplusbiFormat(segment.start.real, segment.start.imag)
            p1 = aplusbiFormat(segment.end.real, segment.end.imag)
            r = aplusbiFormat(segment.radius.real, segment.radius.imag)
            equations.append(
                "\\\\left("
                + str(p0.real)
                + "+"
                + str(r.real)
                + "*\\cos(t), "
                + str(p0.imag)
                + "+"
                + str(r.imag)
                + "*\\sin(t)\\\\right)"
            )
    # --- End existing logic ---

    # Write equations to file with base name
    with open(eq_path, "w", encoding="utf-8") as f:
        for eq in equations:
            f.write(clean_equation(eq) + "\n")

    # Define the Desmos API script
    desmos = """
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"></script>
    <div id="calculator" style="width: 100%; height: 100%;"></div>
    <script>
    var elt = document.getElementById('calculator');
    var calculator = Desmos.GraphingCalculator(elt);
    """

    # Add the bounds to the Desmos API script
    desmos += (
            "calculator.setMathBounds({ left: "
            + str(-194.97)
            + ", right: "
            + str(8852.635)
            + ", bottom: "
            + str(-221.556)
            + ", top: "
            + str(6152.893)
            + " });\n"
    )

    # Add each equation to the Desmos API script
    for i in range(len(equations)):
        desmos += (
                "calculator.setExpression({ id: 'a-slider"
                + str(i)
                + "', latex: '"
                + equations[i]
                + "', color: Desmos.Colors.BLACK });\n"
        )
    desmos += "</script>"

    # Save and open Desmos file
    with open(os.path.join(output_dir, f"{base_name}_output_eq.html"), "w") as f:
        f.write(desmos)

if __name__ == "__main__":
    image_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "public/results"
    generate_equations(image_path, output_dir)
