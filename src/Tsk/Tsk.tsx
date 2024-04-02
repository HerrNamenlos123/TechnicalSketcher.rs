import Toolbar2 from "./components/Toolbar2";
import SketchEditor from "./components/SketchEditor/SketchEditor";

function Tsk() {
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Toolbar2 height={10} />
            <SketchEditor zoomSensitivity={0.001} invertMouse={false} snapToGridCM={1}/>
        </div>
    );
}

export default Tsk;
