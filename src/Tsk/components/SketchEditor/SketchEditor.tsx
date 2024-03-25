import React, {
    Component,
    useEffect,
    useRef,
    useState,
} from "react";
import Vec2 from "../../types/Vector";
import { CanvasRenderer } from "./CanvasRenderer";

interface Props {}

interface State {
    canvasContext: CanvasRenderingContext2D | null;
    pan: Vec2;
    zoom: number;
}

class SketchEditor extends Component<Props, State> {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    canvasRenderer: CanvasRenderer;
    prevMouse: Vec2;

    constructor(props: Props) {
        super(props);
        this.state = {
            canvasContext: null,
            pan: new Vec2(),
            zoom: 1,
        };
        this.canvasRef = React.createRef<HTMLCanvasElement>();
        this.canvasRenderer = new CanvasRenderer();
        this.prevMouse = new Vec2();

        // Binding the functions to the instance
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    handleMouseDown(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        this.prevMouse = new Vec2(e.clientX, e.clientY);
        const handleMouseMove = (e: MouseEvent) => {
            const client = new Vec2(e.clientX, e.clientY);
            const delta = client.sub(this.prevMouse);
            this.setState(prev => ({
                pan: prev.pan.add(delta)
            }));

            this.prevMouse = client;
        };

        const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
        const zoomAmount = -e.deltaY * 0.001;
        const canvas = this.canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            if (rect) {
                const client = new Vec2(e.clientX, e.clientY);
                const mousePos = client.sub(new Vec2(rect.left, rect.top));
                console.log(zoomAmount);
                this.setState(prev => ({ 
                    zoom: prev.zoom + prev.zoom * zoomAmount, 
                    pan: prev.pan.sub(mousePos.sub(prev.pan).mul(zoomAmount)) 
                }));
            }
        }
    };

    componentDidMount() {
        const canvas = this.canvasRef.current;
        if (canvas) {
            const context = canvas.getContext("2d");
            if (context) {
                this.setState({ canvasContext: context });
            }
        }
    }

    componentDidUpdate() {
        const { canvasContext, pan, zoom } = this.state;
        if (canvasContext) {
            this.canvasRenderer.renderCanvas(canvasContext, pan, zoom);
            console.log("render");
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
