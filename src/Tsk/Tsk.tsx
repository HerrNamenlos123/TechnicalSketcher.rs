import Toolbar from "./components/Toolbar";
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
            <Toolbar height={10} />
            <SketchEditor zoomSensitivity={0.001} invertMouse={false}/>
        </div>
    );
}

export default Tsk;
