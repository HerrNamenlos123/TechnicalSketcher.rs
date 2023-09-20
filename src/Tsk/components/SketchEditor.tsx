import {
    PointerEvent,
    WheelEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import EditorGridSvg from "./EditorGridSvg";
import Vec2 from "../types/Vector";
import useMousePosition from "../hooks/MousePosition";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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

    const [gestureCache, setGestureCache] = useState<
        PointerEvent<SVGSVGElement>[]
    >([]);
    let [lastAverageGestureDist, setLastAverageGestureDist] = useState(-1);
    let [lastAverageGesturePos, setLastAverageGesturePos] = useState(
        new Vec2(-1, -1)
    );

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
            changeCenterPosBy(delta);
        }
    }

    function onWheel(event: WheelEvent<SVGSVGElement>) {
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

    function onPointerDown(event: PointerEvent<SVGSVGElement>) {
        // // The pointerdown event signals the start of a touch interaction.
        // gestureCache.push(event);
        // console.log(gestureCache);
        // setGestureCache(gestureCache);
        // console.log("pointerDown");
    }

    function onPointerMove(event: PointerEvent<SVGSVGElement>) {
        // if (gestureCache.length === 0) {
        //     return;
        // }
        // console.log("pointerMove");
        // const gestureIndex = gestureCache.findIndex(
        //     (cachedEv) => cachedEv.pointerId === event.pointerId
        // );
        // gestureCache[gestureIndex] = event;
        // setGestureCache(gestureCache);
        // function getGesturePos(index: number) {
        //     console.log(gestureCache);
        //     return new Vec2(
        //         gestureCache[index].clientX,
        //         gestureCache[index].clientY
        //     );
        // }
        // let averageGesturePos = getGesturePos(0);
        // for (var i = 1; i < gestureCache.length; i++) {
        //     averageGesturePos = averageGesturePos.add(
        //         getGesturePos(i).div(gestureCache.length)
        //     );
        // }
        // const diff = averageGesturePos.sub(lastAverageGesturePos);
        // // setCenterPositionPx(lastAverageGesturePos);
        // console.log(lastAverageGesturePos);
        // console.log(averageGesturePos);
        // changeCenterPosBy(diff);
        // lastAverageGesturePos = averageGesturePos;
        // setLastAverageGesturePos(lastAverageGesturePos);
        // // changeCenterPosBy(
        // //     new Vec2(gestureCache[0].clientX, gestureCache[0].clientY)
        // // );
        // //     // Calculate the distance between the two pointers
        // //     const curDiff = Math.abs(evCache[0].clientX - evCache[1].clientX);
        // //     if (prevDiff > 0) {
        // //         if (curDiff > prevDiff) {
        // //             // The distance between the two pointers has increased
        // //             console.log("Pinch moving OUT -> Zoom in", event);
        // //             event.currentTarget.style.background = "pink";
        // //         }
        // //         if (curDiff < prevDiff) {
        // //             // The distance between the two pointers has decreased
        // //             console.log("Pinch moving IN -> Zoom out", event);
        // //             event.currentTarget.style.background = "lightblue";
        // //         }
        // //     }
        // //     // Cache the distance for the next move event
        // //     prevDiff = curDiff;
        // // }
    }

    function onPointerUp(event: PointerEvent<SVGSVGElement>) {
        console.log(event.type);
        // Remove this pointer from the cache
        const index = gestureCache.findIndex(
            (cachedEv) => cachedEv.pointerId === event.pointerId
        );
        if (index !== -1) {
            gestureCache.splice(index, 1);
            setGestureCache(gestureCache);
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

    // This is the position of the upper-left corner of the viewport, in SVG-units
    let leftUpperVPCorner = screenToSVGCoords(new Vec2()).sub(
        viewportSizeSVG.div(2)
    );

    // return (
    //     <TransformWrapper
    //         initialScale={1}
    //         initialPositionX={200}
    //         initialPositionY={100}
    //     >
    //         {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
    //             <>
    //                 <div className="tools">
    //                     <button onClick={() => zoomIn()}>+</button>
    //                     <button onClick={() => zoomOut()}>-</button>
    //                     <button onClick={() => resetTransform()}>x</button>
    //                 </div>
    //                 <TransformComponent>
    //                     <img
    //                         src="https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D&w=1000&q=80"
    //                         alt="test"
    //                     />
    //                     <div>Example text</div>
    //                 </TransformComponent>
    //             </>
    //         )}
    //     </TransformWrapper>
    // );

    return (
        <>
            <TransformWrapper>
                <TransformComponent>
                    <svg
                        ref={svgRef}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox={`${leftUpperVPCorner.x} ${leftUpperVPCorner.y} ${viewportSizeSVG.x} ${viewportSizeSVG.y}`}
                        preserveAspectRatio="none"
                        style={{ width: "100%", height: "100%" }}
                        // onMouseMove={(ev) => onMouseMove(ev)}
                        onWheel={(ev) => onWheel(ev)}
                        onPointerDown={(ev) => onPointerDown(ev)}
                        onPointerMove={(ev) => onPointerMove(ev)}
                        onPointerUp={(ev) => onPointerUp(ev)}
                        onPointerCancel={(ev) => onPointerUp(ev)}
                        onPointerOut={(ev) => onPointerUp(ev)}
                        onPointerLeave={(ev) => onPointerUp(ev)}
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
                </TransformComponent>
            </TransformWrapper>
        </>
    );
}

export default SketchEditor;
