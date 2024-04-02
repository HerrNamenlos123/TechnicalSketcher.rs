import { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Toolbar.css"
import '@material-ui/icons';

interface ToolbarProps {
  onSelectTool: (tool: string) => void;
}

interface ToolbarState {
  activeTool: string;
}

interface Tool {
  name: string;
  icon: string;
}

const tools: Tool[] = [
  { name: 'select', icon: "select_all" },
  { name: 'line', icon: "minimize" },
  { name: 'line_strip', icon: "timeline" },
  { name: 'circle', icon: "radio_button_unchecked" },
  { name: 'arc', icon: "switch_access_shortcut_add" },
  { name: 'brush', icon: "format_paint" },
  { name: 'cut', icon: "content_cut" },
  { name: 'copy', icon: "content_copy" },
  { name: 'settings', icon: "settings" },
];

class Toolbar extends Component<ToolbarProps, ToolbarState> {

  constructor(props: ToolbarProps) {
    super(props);
    this.state = {
      activeTool: tools[0].name,
    }
    this.props.onSelectTool(this.state.activeTool);
  }

  handleToolClick(tool: string) {
    this.setState({ activeTool: tool });
    this.props.onSelectTool(tool);
  };

  render() {
    return (
      <div className="toolbar-container">
        <div className="btn-group" role="group">
          {tools.map((tool) => (
            <button
              key={tool.name}
              type="button"
              className={`btn btn-light ${this.state.activeTool === tool.name ? 'active' : ''}`}
              onClick={() => this.handleToolClick(tool.name)}
            >
              <i className="material-icons">{tool.icon}</i>
            </button>
          ))}
        </div>
      </div>
    );
  }
}

export default Toolbar;