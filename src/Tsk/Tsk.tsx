import Toolbar from "./components/Toolbar";
import SketchEditor from "./components/SketchEditor";

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
            <SketchEditor />
        </div>
    );
}

export default Tsk;
