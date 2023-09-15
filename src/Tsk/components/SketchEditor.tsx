import { useCallback, useEffect, useRef, useState } from "react";
import EditorGridSvg from "./EditorGridSvg";
import Vec2 from "../types/Vector";
import useMousePosition from "../hooks/MousePosition";

// The "CenterPosition" is specified as in the number of screen pixels it was
// moved from the center of the original viewport. When it is zero, the zero
// point of the working area is in the center of the viewport.

function SketchEditor() {
    let [centerPositionPx, setCenterPositionPx] = useState(new Vec2(0, 0));
    let [zoom, setZoom] = useState(8);

    const [mousePosPx, setMousePosPx] = useState(new Vec2(0, 0));
    const svgRef = useRef<SVGSVGElement>(null);
    const svgSize = new Vec2(
        svgRef.current?.clientWidth,
        svgRef.current?.clientHeight
    );
    const zoomSpeed = 0.001;

    function changeCenterPosBy(pos: Vec2) {
        const newPos = centerPositionPx.add(pos);
        setCenterPositionPx(newPos);
        centerPositionPx = newPos;
    }

    function changeZoomTo(newZoom: number) {
        setZoom(newZoom);
        zoom = newZoom;
    }

    function onMouseMove(ev: React.MouseEvent<SVGSVGElement, MouseEvent>) {
        const delta = new Vec2(ev.movementX, ev.movementY);
        const bounds = ev.currentTarget.getBoundingClientRect();
        const mousePos = new Vec2(
            ev.clientX - bounds.left,
            ev.clientY - bounds.top
        );
        setMousePosPx(mousePos);
        if (ev.buttons === 1) {
            setCenterPositionPx((center) => center.add(delta));
        }
    }

    function onWheel(event: React.WheelEvent<SVGSVGElement>) {
        const zoomAmount = event.deltaY * zoomSpeed;
        const zoomFactor = 1 + Math.abs(zoomAmount);
        const mouseToCenter = centerPositionPx.sub(
            mousePosPx.sub(svgSize.div(2))
        );
        if (zoomAmount > 0) {
            changeZoomTo(zoom * zoomFactor);
            changeCenterPosBy(mouseToCenter.div(zoomFactor).sub(mouseToCenter));
        } else {
            changeZoomTo(zoom / zoomFactor);
            changeCenterPosBy(
                mouseToCenter.sub(mouseToCenter.mul(zoomFactor)).neg()
            );
        }
    }

    function screenToSVGCoords(screenCoords: Vec2) {
        return screenCoords
            .sub(centerPositionPx.sub(svgSize.div(2)))
            .sub(svgSize.div(2))
            .mul(zoom);
    }

    // function svgToScreenCoords(svgCoords: Vec2) {
    //     return centerPositionPx
    //         .add(svgSize.div(2))
    //         .add(svgCoords.mul(zoom))
    //         .add(svgSize.div(2));
    // }

    // This is the size of the SVG viewport in SVG-units
    let viewportSizeSVG = new Vec2(svgSize.x, svgSize.y).mul(zoom);

    let leftUpperVPCorner = screenToSVGCoords(new Vec2()).sub(
        viewportSizeSVG.div(2)
    );
    // leftUpperVPCorner = new Vec2(-50, -50);

    let value = 0;
    const increment = () => {
        console.log("increment");
    };
    const memoizedUpdateCount = useCallback(increment, [value]);

    const funcCallback = useCallback(() => {
        console.log("funcCallback");
    }, []);

    return (
        <>
            <svg
                ref={svgRef}
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`${leftUpperVPCorner.x} ${leftUpperVPCorner.y} ${viewportSizeSVG.x} ${viewportSizeSVG.y}`}
                preserveAspectRatio="none"
                style={{ width: "100%", height: "100%" }}
                onMouseMove={(ev) => onMouseMove(ev)}
                onWheel={(ev) => onWheel(ev)}
            >
                <EditorGridSvg
                    // zoom={zoom}
                    // centerPositionPx={centerPositionPx}
                    lineWidth={1}
                    opacity={1}
                    color="#00FF00"
                    canvasColor="#FF0000"
                    // onMouseMove={funcCallback}
                />
            </svg>
        </>
    );
}

export default SketchEditor;
