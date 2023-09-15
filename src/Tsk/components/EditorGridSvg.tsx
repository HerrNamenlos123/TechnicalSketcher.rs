import { Vec2 } from "../types/Vectors";
import GridLines from "react-gridlines";
import useMousePosition from "../hooks/MousePosition";
import React from "react";

interface EditorGridSvgProps {
    // centerPositionPx: Vec2;
    // zoom: number;
    lineWidth: number;
    opacity: number;
    color: string;
    canvasColor: string;
}

function EditorGridSvg(props: EditorGridSvgProps) {
    // let lines = [];

    // for (let x = ; x < 10; x++) {

    // }

    // const mouse = useMousePosition();

    let jsx: any = [];

    for (var x = -200; x <= 200; x += 20) {
        for (var y = -200; y <= 200; y += 20) {
            console.log("render");
            jsx.push(
                <>
                    <line
                        x1={x - 5}
                        y1={y - 5}
                        x2={x + 5}
                        y2={y + 5}
                        stroke="red"
                    />
                    <line
                        x1={x + 5}
                        y1={y - 5}
                        x2={x - 5}
                        y2={y + 5}
                        stroke="red"
                    />
                    <line
                        x1={x - 10}
                        y1={y - 10}
                        x2={x - 10}
                        y2={y + 10}
                        stroke="green"
                    />
                    <line
                        x1={x - 10}
                        y1={y + 10}
                        x2={x + 10}
                        y2={y + 10}
                        stroke="green"
                    />
                    <line
                        x1={x + 10}
                        y1={y + 10}
                        x2={x + 10}
                        y2={y - 10}
                        stroke="green"
                    />
                    <line
                        x1={x + 10}
                        y1={y - 10}
                        x2={x - 10}
                        y2={y - 10}
                        stroke="green"
                    />
                </>
            );
        }
    }

    return <>{jsx}</>;
}

// void ApplicationRenderer::DrawGrid(bool infinite) {
//	auto nav = Navigator::GetInstance();
//
//    auto thickness = GetInstance().gridLineWidth;
//    auto alpha = std::min(Navigator::GetInstance()->scale * GetInstance().gridAlphaFactor + GetInstance().gridAlphaOffset, GetInstance().gridAlphaMax);
//	ImVec4 color = ImVec4(GetInstance().gridLineColor, GetInstance().gridLineColor, GetInstance().gridLineColor, alpha);
//
//	auto [ w, h ] = App::s_mainWindow->getSize();
//
//	float right = static_cast<float>(w);
//    float left = 0;
//    float top = static_cast<float>(h);
//    float bottom = 0;
//
//	if (!infinite) {	// Draw an A4-sheet
//		ImVec2 sheetSize = { 210, 297 };
//		right  = Navigator::GetInstance()->ConvertWorkspaceToScreenCoords( sheetSize / 2.f).x;
//		left   = Navigator::GetInstance()->ConvertWorkspaceToScreenCoords(-sheetSize / 2.f).x;
//		top    = Navigator::GetInstance()->ConvertWorkspaceToScreenCoords( sheetSize / 2.f).y;
//		bottom = Navigator::GetInstance()->ConvertWorkspaceToScreenCoords(-sheetSize / 2.f).y;
//
//		for (float x = nav->m_panOffset.x + w / 2; x < right; x += nav->scale * nav->snapSize) {
//			//Renderer2D::DrawPrimitiveLine({ x, bottom }, { x, top }, thickness, color);
//		}
//		for (float x = nav->m_panOffset.x + w / 2 - nav->scale * nav->snapSize; x > left; x -= nav->scale * nav->snapSize) {
//			//Renderer2D::DrawPrimitiveLine({ x, bottom }, { x, top }, thickness, color);
//		}
//		for (float y = nav->m_panOffset.y + h / 2; y < top; y += nav->scale * nav->snapSize) {
//			//Renderer2D::DrawPrimitiveLine({ left, y }, { right, y }, thickness, color);
//		}
//		for (float y = nav->m_panOffset.y + h / 2 - nav->scale * nav->snapSize; y > bottom; y -= nav->scale * nav->snapSize) {
//			//Renderer2D::DrawPrimitiveLine({ left, y }, { right, y }, thickness, color);
//		}
//	}
//	else {
//
//		for (float x = nav->m_panOffset.x + w / 2; x < right; x += nav->scale * nav->snapSize) {
//			//Renderer2D::DrawPrimitiveLine({ x, bottom }, { x, top }, thickness, color);
//		}
//		for (float x = nav->m_panOffset.x + w / 2; x > left; x -= nav->scale * nav->snapSize) {
//			//Renderer2D::DrawPrimitiveLine({ x, bottom }, { x, top }, thickness, color);
//		}
//		for (float y = nav->m_panOffset.y + h / 2; y < top; y += nav->scale * nav->snapSize) {
//			//Renderer2D::DrawPrimitiveLine({ left, y }, { right, y }, thickness, color);
//		}
//		for (float y = nav->m_panOffset.y + h / 2; y > bottom; y -= nav->scale * nav->snapSize) {
//			//Renderer2D::DrawPrimitiveLine({ left, y }, { right, y }, thickness, color);
//		}
//	}
//
//	if (!infinite) {	// Draw sheet outline
//		//Renderer2D::DrawPrimitiveLine({ left,  bottom }, { right, bottom }, thickness * 2, color);
//		//Renderer2D::DrawPrimitiveLine({ right, bottom }, { right, top }, thickness * 2, color);
//		//Renderer2D::DrawPrimitiveLine({ right, top},     { left,  top }, thickness * 2, color);
//		//Renderer2D::DrawPrimitiveLine({ left,  top },    { left, bottom }, thickness * 2, color);
//	}
//}

export default React.memo(EditorGridSvg);
