import { TskDocument } from "../types/TskDocument";
import { Vec2 } from "../types/Vector";

export type SketcherState = {
  canvasContext: CanvasRenderingContext2D | null;
  pan: Vec2;
  zoom: number;
  eventCache: PointerEvent[];
  cursorPreviewPos: Vec2;
  cursorPreviewEnabled: boolean;
  document: TskDocument;
}
