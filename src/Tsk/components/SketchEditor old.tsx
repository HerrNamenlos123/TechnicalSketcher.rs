import {
    PointerEvent,
    WheelEvent,
    useCallback,
    useEffect,
    useRef,
    useMemo,
    useState,
} from "react";
import EditorGridSvg from "./EditorGridSvg";
import toImg from 'react-svg-to-image';
import debounce from "lodash";
import html2canvas from "html2canvas";
import Vec2 from "../types/Vector";
import { Canvg, presets } from "canvg";
import useMousePosition from "../hooks/MousePosition";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// The "CenterPosition" is specified as in the number of screen pixels it was
// moved from the center of the original viewport. When it is zero, the zero
// point of the working area is in the center of the viewport.

function SketchEditor() {
    let [centerPositionPx, setCenterPositionPx] = useState(new Vec2(0, 0));
    let [zoom, setZoom] = useState(1);

    const [canvasMousePosPx, setCanvasMousePosPx] = useState(new Vec2(0, 0));
    const canvasHostRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const actualCanvasHostSize = () => 
        new Vec2(canvasHostRef.current?.clientWidth, canvasHostRef.current?.clientHeight);
    const actualCanvasSize = () => 
        new Vec2(canvasRef.current?.clientWidth, canvasRef.current?.clientHeight);
    const zoomSpeed = 0.001;
    const canvasSize = new Vec2(210, 297);

    const [gestureCache, setGestureCache] = useState<PointerEvent<HTMLDivElement>[]>([]);
    let [lastAverageGestureDist, setLastAverageGestureDist] = useState(-1);
    let [lastAverageGesturePos, setLastAverageGesturePos] = useState(
        new Vec2(-1, -1)
    );
    let [prerenderedCanvasUrl, setPrerenderedCanvasUrl] = useState("");

    async function dso() {
        console.log("Prerendering");

        if (canvasHostRef.current !== null) {
            const canvasHostSize = actualCanvasHostSize();

            console.log(`Prerendering ${canvasHostSize.x}x${canvasHostSize.y}`)

            const canvas = new OffscreenCanvas(canvasHostSize.x, canvasHostSize.y);
            const ctx = canvas.getContext('2d')
            if (ctx !== null) {
                const cv = await Canvg.from(ctx, 
                    svgRef.current?.outerHTML ?? "",
                    presets.offscreen());
                await cv.render();
                const blob = await canvas.convertToBlob()
                const pngUrl = URL.createObjectURL(blob)
                setPrerenderedCanvasUrl(pngUrl);
            }

            // setPrerenderedSvg(cv);
            // console.log(cv);
            // console.log(canvas);
        }

        console.log("Prerendering done")
    }

    function prerender() {
        dso();
        console.log("dso end")
    }

    const canvasScaledDebounce = useMemo(() => debounce.debounce(() => {
        prerender();
    }, 200), []);

    function onMouseMove(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        const delta = new Vec2(ev.movementX, ev.movementY);
        const mousePos = new Vec2(
            ev.clientX - (canvasRef.current?.offsetLeft ?? 0) - actualCanvasSize().x / 2,
            ev.clientY - (canvasRef.current?.offsetTop ?? 0) - actualCanvasSize().y / 2
        );
        setCanvasMousePosPx(mousePos);
        if (ev.buttons === 1) {
            centerPositionPx = centerPositionPx.add(delta);
            setCenterPositionPx(centerPositionPx);
        }
    }

    function onWheel(event: WheelEvent<HTMLDivElement>) {
        let zoomAmount = event.deltaY * zoomSpeed;      // This is a bit greater or smaller than 0, depending on the direction

        const canvasHostPos = new Vec2(event.currentTarget.getBoundingClientRect().x, event.currentTarget.getBoundingClientRect().y);
        const canvasHostSize = new Vec2(canvasHostRef.current?.clientWidth, canvasHostRef.current?.clientHeight);
        const mousePosCanvasHost = new Vec2(event.clientX, event.clientY).sub(canvasHostPos);

        const mousePosCanvasCenter = mousePosCanvasHost.sub(canvasHostSize.div(2)).sub(centerPositionPx);
        
        zoom += zoom * zoomAmount;
        setZoom(zoom);
        centerPositionPx = centerPositionPx.sub(mousePosCanvasCenter.mul(zoomAmount));
        setCenterPositionPx(centerPositionPx);

        // Debounce
        canvasScaledDebounce();
    }

    function onPointerDown(event: PointerEvent<HTMLDivElement>) {
        // The pointerdown event signals the start of a touch interaction.
        gestureCache.push(event);
        setGestureCache(gestureCache);
    }

    function onPointerMove(event: PointerEvent<HTMLDivElement>) {
        if (gestureCache.length === 0) {
            return;
        }
        console.log("pointerMove");
        const gestureIndex = gestureCache.findIndex(
            (ev) => ev.pointerId === event.pointerId
        );
        gestureCache[gestureIndex] = event;
        setGestureCache(gestureCache);

        let getGesturePos = (index: number) => {
            return new Vec2(
                gestureCache[index].clientX,
                gestureCache[index].clientY
            );
        }

        // Compute the average of all the pointers in the cache
        let averageGesturePos = getGesturePos(0);
        for (let i = 1; i < gestureCache.length; i++) {
            averageGesturePos = averageGesturePos.add(
                getGesturePos(i).div(gestureCache.length)
            );
        }

        const diff = averageGesturePos.sub(lastAverageGesturePos);
        console.log(`Moving by ${diff.x} ${diff.y}`)
        centerPositionPx = centerPositionPx.add(diff);
        setCenterPositionPx(centerPositionPx);

        lastAverageGesturePos = averageGesturePos;
        setLastAverageGesturePos(lastAverageGesturePos);
    }

    function onPointerUp(event: PointerEvent<HTMLDivElement>) {
        // Remove this pointer from the cache
        const index = gestureCache.findIndex(
            (cachedEv) => cachedEv.pointerId === event.pointerId
        );
        if (index !== -1) {
            gestureCache.splice(index, 1);
            setGestureCache(gestureCache);
        }
    }

    // function screenToSVGCoords(screenCoords: Vec2) {
    //     return screenCoords
    //         .sub(centerPositionPx.sub(svgSize.div(2)))
    //         .sub(svgSize.div(2))
    //         .mul(zoom);
    // }

    // function svgToScreenCoords(svgCoords: Vec2) {
    //     return centerPositionPx
    //         .add(svgSize.div(2))
    //         .add(svgCoords.mul(zoom))
    //         .add(svgSize.div(2));
    // }

    const parentDivRef = useRef<HTMLDivElement>(null);
    return (
        <div ref={parentDivRef} style={{ width: "100%", height: "100%" }}>
            <div id="canvasHost"
                ref={canvasHostRef}
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    touchAction: "none",
                    background: "#EEEEEE",
                    overflow: "hidden",
                }}
                // onPointerDown={onPointerDown}
                // onPointerMove={onPointerMove}
                // onPointerUp={onPointerUp}
                // onPointerCancel={onPointerUp}
                // onPointerOut={onPointerUp}
                // onPointerLeave={onPointerUp}
                onWheel={onWheel}
                onMouseMove={onMouseMove}
            >
                <div id="canvas"
                    ref={canvasRef}
                    style={{
                        position: "absolute",
                        left: `calc(50% - ${canvasSize.x / 2}px * ${zoom} + ${centerPositionPx.x}px)`,
                        top: `calc(50% - ${canvasSize.y / 2}px * ${zoom} + ${centerPositionPx.y}px)`,
                        width: `calc(${canvasSize.x}px * ${zoom})`,
                        height: `calc(${canvasSize.y}px * ${zoom})`,
                        background: "#FFFFFF",
                        boxShadow: "0 0 5px 1px #999",
                    }}
                >
                    <img src={prerenderedCanvasUrl} style={{
                        width: "100%",
                        height: "100%",
                    }}></img>
                    <div style={{ display: 'none', width: "100%", height: "100%" }}>
                        <svg
                            id="tskCanvasSvg"
                            ref={svgRef}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox={`${-canvasSize.x / 2} ${-canvasSize.y / 2} ${canvasSize.x} ${canvasSize.y}`}
                            preserveAspectRatio="none"
                            style={{
                                width: `100%`,
                                height: `100%`,
                                visibility: "visible",
                            }}
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
                    </div>
                </div>
                
            {/* <div
                style={{
                    position: "relative",
                    width: "1px",
                    height: "100%",
                    left: "50%",
                    top: "0px",
                    background: "#000000",
                }}
                >
            </div>
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "1px",
                    left: "0px",
                    top: "50%",
                    background: "#000000",
                }}
                >
            </div> */}
            </div>
        </div>
    );
}

export default SketchEditor;
