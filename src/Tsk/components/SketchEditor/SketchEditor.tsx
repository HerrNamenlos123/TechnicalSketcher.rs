import React, { Component, useEffect, useRef, useState } from "react";
import Vec2 from "../../types/Vector";
import { CanvasRenderer } from "./CanvasRenderer";
import Toolbar from "./Toolbar";
import "./SketchEditor.css";
import TskDocument from "../../types/TskDocument";
import { SelectTool } from "../../types/Tools";

interface SketchEditorProps {
    zoomSensitivity: number;
    invertMouse: boolean;
    snapToGridCM: number;
}

interface SketchEditorState {
    canvasContext: CanvasRenderingContext2D | null;
    pan: Vec2;
    zoom: number;
    eventCache: React.PointerEvent<HTMLCanvasElement>[];
    cursorPreviewPos: Vec2;
    cursorPreviewEnabled: boolean;

    __document: TskDocument;
}

class SketchEditor extends Component<SketchEditorProps, SketchEditorState> {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    canvasRenderer: CanvasRenderer | undefined;
    lastAveragePosition: Vec2 | undefined;
    initialZoomFingerDistance: number | undefined;
    initialZoomFactor: number | undefined;
    initialZoomPosition: Vec2 | undefined;
    prevPan: Vec2;
    prevZoomFactor: number;
    prevMousePosition: Vec2;

    constructor(props: SketchEditorProps) {
        super(props);
        this.state = {
            canvasContext: null,
            pan: new Vec2(),
            zoom: 100,
            eventCache: [],
            cursorPreviewPos: new Vec2(),
            cursorPreviewEnabled: true,

            __document: new TskDocument(),
        };
        this.canvasRef = React.createRef<HTMLCanvasElement>();
        this.lastAveragePosition = undefined;
        this.initialZoomFingerDistance = undefined;
        this.initialZoomFactor = undefined;
        this.initialZoomPosition = undefined;
        this.prevPan = new Vec2();
        this.prevZoomFactor = this.state.zoom;
        this.prevMousePosition = new Vec2();

        // Binding the functions to the instance
        this.handleWheel = this.handleWheel.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.pointerDownHandler = this.pointerDownHandler.bind(this);
        this.pointerMoveHandler = this.pointerMoveHandler.bind(this);
        this.pointerUpHandler = this.pointerUpHandler.bind(this);
    }

    globalMouseToCanvasPos(globalMouse: Vec2): Vec2 {
        const canvas = this.canvasRef.current;
        if (!canvas) {
            return new Vec2();
        }

        const rect = canvas.getBoundingClientRect();
        if (!rect) {
            return new Vec2();
        }

        return globalMouse.sub(new Vec2(rect.left, rect.top));
    }

    getDocument(): TskDocument {
        return this.state.__document;
    }

    updateDocument(document: TskDocument) {
        this.setState({ __document: document });
    }

    updateDocumentCursorPosition(mousePosition: Vec2): void {
        if (this.canvasRenderer) {
            const mouse = this.globalMouseToCanvasPos(mousePosition);
            const document = this.getDocument();
            document.setRawCursorPos(
                this.canvasRenderer.canvasToObjectCoords(mouse)
            );
            document.onCursorMove();
            this.updateDocument(document);
        }
    }

    handleKeyDown(e: React.KeyboardEvent<HTMLCanvasElement>) {
        const document = this.getDocument();
        document.handleKey(e.code);
        if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
            document.setCursorSmooth(true);
        }
        document.onCursorMove();
        this.updateDocument(document);
    }

    handleKeyUp(e: React.KeyboardEvent<HTMLCanvasElement>) {
        const document = this.getDocument();
        if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
            document.setCursorSmooth(false);
        }
        document.onCursorMove();
        this.updateDocument(document);
    }

    handlePanDelta(delta: Vec2) {
        this.prevPan = this.prevPan.add(delta);
        this.setState({ pan: this.prevPan });
    }

    handleZoom(newGlobalFactor: number, averagePosition: Vec2) {
        const averageInCanvasCoords =
            this.globalMouseToCanvasPos(averagePosition);
        const averageToPrevPan = this.prevPan.sub(averageInCanvasCoords);
        const scaledAverageToPan = averageToPrevPan.mul(
            newGlobalFactor / this.prevZoomFactor
        );
        const newPan = averageInCanvasCoords.add(scaledAverageToPan);

        this.setState({
            zoom: newGlobalFactor,
            pan: newPan,
        });
        this.prevPan = newPan;
        this.prevZoomFactor = newGlobalFactor;
    }

    handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
        if (e.ctrlKey) {
            const delta = e.deltaX + e.deltaY;
            const newGlobalZoom =
                this.state.zoom +
                this.state.zoom * (-delta * this.props.zoomSensitivity);
            this.handleZoom(newGlobalZoom, new Vec2(e.clientX, e.clientY));
        } else {
            const delta = new Vec2(-e.deltaX, -e.deltaY);
            if (this.props.invertMouse) {
                delta.mul(-1);
            }
            this.handlePanDelta(delta);
        }
    }

    moveCanvasCenterToPoint(point: Vec2) {
        this.prevPan = point;
        this.setState({ pan: this.prevPan });
    }

    updatePointers() {
        const numberOfFingers = this.state.eventCache.length;
        if (numberOfFingers === 1) {
            const averagePosition = new Vec2(
                this.state.eventCache[0].clientX,
                this.state.eventCache[0].clientY
            );
            if (!this.lastAveragePosition) {
                this.lastAveragePosition = averagePosition;
                return;
            }
            this.handlePanDelta(averagePosition.sub(this.lastAveragePosition));
            this.lastAveragePosition = averagePosition;
            return;
        } else if (numberOfFingers !== 2) {
            this.initialZoomFingerDistance = undefined;
            this.lastAveragePosition = undefined;
            this.initialZoomFactor = undefined;
            return;
        }

        const finger1 = new Vec2(
            this.state.eventCache[0].clientX,
            this.state.eventCache[0].clientY
        );
        const finger2 = new Vec2(
            this.state.eventCache[1].clientX,
            this.state.eventCache[1].clientY
        );
        const averagePosition = finger1.add(finger2).div(2);
        const fingerDistance = finger2.sub(finger1).mag();

        if (
            !this.initialZoomFingerDistance ||
            !this.lastAveragePosition ||
            !this.initialZoomFactor ||
            !this.initialZoomPosition
        ) {
            this.initialZoomFingerDistance = fingerDistance;
            this.lastAveragePosition = averagePosition;
            this.initialZoomFactor = this.state.zoom;
            this.initialZoomPosition = averagePosition;
            return;
        }

        this.handlePanDelta(averagePosition.sub(this.lastAveragePosition));
        const fingerDistanceScaleFactor =
            fingerDistance / this.initialZoomFingerDistance;
        this.handleZoom(
            this.initialZoomFactor * fingerDistanceScaleFactor,
            averagePosition
        );

        this.lastAveragePosition = averagePosition;
    }

    pointerDownHandler(e: React.PointerEvent<HTMLCanvasElement>) {
        if (e.pointerType == "touch") {
            let cache = this.state.eventCache;
            cache.push(e);
            this.setState({ eventCache: cache });
            this.initialZoomFingerDistance = undefined;
            this.lastAveragePosition = undefined;
            this.initialZoomFactor = undefined;
            this.updatePointers();
        } else if (e.pointerType == "mouse") {
            const mousePos = new Vec2(e.clientX, e.clientY);
            if (e.buttons === 4 || (e.shiftKey && e.buttons == 1)) {
                this.prevMousePosition = mousePos;
            }
            const document = this.getDocument();
            document.setCursorSmooth(e.shiftKey);
            switch (e.button) {
                case 0:
                    document.onCursorDown("left");
                    break;
                case 1:
                    document.onCursorDown("wheel");
                    break;
                case 2:
                    document.onCursorDown("right");
                    break;
            }
            this.updateDocument(document);
        } else if (e.pointerType == "pen") {
            const document = this.getDocument();
            document.setCursorSmooth(e.shiftKey);
            document.onCursorDown("left");
            this.updateDocument(document);
        }
    }

    pointerMoveHandler(e: React.PointerEvent<HTMLCanvasElement>) {
        if (e.pointerType == "touch") {
            const index = this.state.eventCache.findIndex(
                (cachedEv) => cachedEv.pointerId === e.pointerId
            );
            this.state.eventCache[index] = e;
            this.updatePointers();
        } else if (e.pointerType == "mouse") {
            const mouse = new Vec2(e.clientX, e.clientY);
            if (
                e.buttons === 4 ||
                (e.shiftKey &&
                    e.buttons == 1 &&
                    this.getDocument().selectedTool instanceof SelectTool)
            ) {
                this.handlePanDelta(mouse.sub(this.prevMousePosition));
            }
            this.prevMousePosition = mouse;
            const document = this.getDocument();
            document.setCursorSmooth(e.shiftKey);
            this.updateDocument(document);
            this.updateDocumentCursorPosition(new Vec2(e.clientX, e.clientY));
        } else if (e.pointerType == "pen") {
            const mouse = new Vec2(e.clientX, e.clientY);
            this.prevMousePosition = mouse;
            const document = this.getDocument();
            // document.setCursorSmooth(e.shiftKey);
            document.setCursorSmooth(true);
            this.updateDocument(document);
            this.updateDocumentCursorPosition(new Vec2(e.clientX, e.clientY));
        }
    }

    pointerUpHandler(e: React.PointerEvent<HTMLCanvasElement>) {
        if (e.pointerType == "touch") {
            const index = this.state.eventCache.findIndex(
                (cachedEv) => cachedEv.pointerId === e.pointerId
            );
            if (index !== -1) {
                this.state.eventCache.splice(index, 1);
            }
            this.initialZoomFingerDistance = undefined;
            this.lastAveragePosition = undefined;
            this.initialZoomFactor = undefined;
            this.updatePointers();
        } else if (e.pointerType == "mouse") {
            const document = this.getDocument();
            document.setCursorSmooth(e.shiftKey);
            switch (e.button) {
                case 0:
                    document.onCursorUp("left");
                    break;
                case 1:
                    document.onCursorUp("wheel");
                    break;
                case 2:
                    document.onCursorUp("right");
                    break;
            }
            this.updateDocument(document);
        } else if (e.pointerType == "pen") {
            const document = this.getDocument();
            document.setCursorSmooth(e.shiftKey);
            document.onCursorUp("left");
            this.updateDocument(document);
        }
    }

    onSelectTool(tool: string) {
        const document = this.getDocument();
        document.selectTool(tool);
        this.updateDocument(document);
    }

    componentDidMount() {
        const canvas = this.canvasRef.current;
        if (canvas) {
            const context = canvas.getContext("2d");
            if (context) {
                this.setState({ canvasContext: context });
                this.moveCanvasCenterToPoint(
                    new Vec2(
                        context.canvas.width / 2,
                        context.canvas.height / 2
                    )
                );
                this.canvasRenderer = new CanvasRenderer(this.state, context);
            }
        }
    }

    componentWillUnmount() {}

    componentDidUpdate() {
        if (this.state.canvasContext) {
            if (this.canvasRenderer) {
                this.canvasRenderer.renderCanvas(this.state);
            }
        }
    }

    render() {
        return (
            <div className="sketcheditor-container">
                <Toolbar onSelectTool={(tool) => this.onSelectTool(tool)} />
                <canvas
                    className="sketcheditor-canvas"
                    tabIndex={0} /* Make it selectable (keyboard input) */
                    ref={this.canvasRef}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    onWheel={this.handleWheel}
                    onKeyDown={this.handleKeyDown}
                    onKeyUp={this.handleKeyUp}
                    onPointerDown={this.pointerDownHandler}
                    onPointerMove={this.pointerMoveHandler}
                    // Use same handler for pointer{up,cancel,out,leave} events since
                    // the semantics for these events - in this app - are the same.
                    onPointerUp={this.pointerUpHandler}
                    onPointerCancel={this.pointerUpHandler}
                    onPointerOut={this.pointerUpHandler}
                    onPointerLeave={this.pointerUpHandler}
                />
            </div>
        );
    }
}

export default SketchEditor;
