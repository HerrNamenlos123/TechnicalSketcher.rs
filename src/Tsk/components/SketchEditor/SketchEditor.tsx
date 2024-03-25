import React, {
    Component,
    useEffect,
    useRef,
    useState,
} from "react";
import Vec2 from "../../types/Vector";
import { CanvasRenderer } from "./CanvasRenderer";

interface Props {
    zoomSensitivity: number;
    invertMouse: boolean;
}

interface State {
    canvasContext: CanvasRenderingContext2D | null;
    pan: Vec2;
    zoom: number;
}

class SketchEditor extends Component<Props, State> {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    canvasRenderer: CanvasRenderer | undefined;
    prevMouse: Vec2;

    constructor(props: Props) {
        super(props);
        this.state = {
            canvasContext: null,
            pan: new Vec2(),
            zoom: 1,
        };
        this.canvasRef = React.createRef<HTMLCanvasElement>();
        this.prevMouse = new Vec2();

        // Binding the functions to the instance
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    handlePanDelta(delta: Vec2) {
        this.setState(prev => ({
            pan: prev.pan.add(delta)
        }));
    };

    handleMouseDown(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        this.prevMouse = new Vec2(e.clientX, e.clientY);
        const handleMouseMove = (e: MouseEvent) => {
            const client = new Vec2(e.clientX, e.clientY);
            const delta = client.sub(this.prevMouse);
            this.handlePanDelta(delta);
            this.prevMouse = client;
        };
        
        const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    handleZoom(amount: number, position: Vec2) {
        const canvas = this.canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            if (rect) {
                const mousePos = position.sub(new Vec2(rect.left, rect.top));
                this.setState(prev => ({ 
                    zoom: prev.zoom + prev.zoom * amount, 
                    pan: prev.pan.sub(mousePos.sub(prev.pan).mul(amount)) 
                }));
            }
        }
    }

    handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
        if (e.ctrlKey) {
            const delta = e.deltaX + e.deltaY;
            this.handleZoom(-delta * this.props.zoomSensitivity, new Vec2(e.clientX, e.clientY));
        }
        else {
            const delta = new Vec2(-e.deltaX, -e.deltaY);
            if (this.props.invertMouse) {
                delta.mul(-1);
            }
            this.handlePanDelta(delta);
        }
    };

    componentDidMount() {
        const canvas = this.canvasRef.current;
        if (canvas) {
            const context = canvas.getContext("2d");
            if (context) {
                this.setState({ canvasContext: context });
                this.canvasRenderer = new CanvasRenderer(context);
            }
        }
    }

    componentDidUpdate() {
        const { canvasContext, pan, zoom } = this.state;
        if (canvasContext) {
            if (this.canvasRenderer) {
                this.canvasRenderer.renderCanvas(pan, zoom);
            }
        }
    }

    render() {
        return (
            <canvas
                ref={this.canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                style={{ background: "white" }}
                onMouseDown={this.handleMouseDown}
                onWheel={this.handleWheel}
            />
        );
    }
}

export default SketchEditor;
