import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import CustomSlider from "./custom-slider";
import * as fabric from "fabric";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useLogContext } from "@/hooks/useLogContext";

type DrawProps = {
  canvas: fabric.Canvas;
};

const Draw = ({ canvas }: DrawProps) => {
  const { selectedObject, setSelectedObject } = useCanvasObjects();
  const { addLog } = useLogContext();
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState("#00ff00");
  const [brushType, setBrushType] = useState("pencil");

  const createBrush = (
    canvas: fabric.Canvas,
    type: string,
    color: string,
    size: number
  ) => {
    let brush: fabric.BaseBrush;

    switch (type) {
      case "hline":
        brush = new fabric.PatternBrush(canvas);
        brush.getPatternSrc = function () {
          const patternCanvas = document.createElement("canvas");
          const patternSize = size * 4;
          patternCanvas.width = patternCanvas.height = patternSize;
          const ctx = patternCanvas.getContext("2d");
          if (ctx) {
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.beginPath();
            ctx.moveTo(0, patternSize / 2);
            ctx.lineTo(patternSize, patternSize / 2);
            ctx.stroke();
          }
          return patternCanvas;
        };
        break;

      case "vline":
        brush = new fabric.PatternBrush(canvas);
        brush.getPatternSrc = function () {
          const patternCanvas = document.createElement("canvas");
          const patternSize = size * 4;
          patternCanvas.width = patternCanvas.height = patternSize;
          const ctx = patternCanvas.getContext("2d");
          if (ctx) {
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.beginPath();
            ctx.moveTo(patternSize / 2, 0);
            ctx.lineTo(patternSize / 2, patternSize);
            ctx.stroke();
          }
          return patternCanvas;
        };
        break;

      case "square":
        brush = new fabric.PatternBrush(canvas);
        brush.getPatternSrc = function () {
          const squareSize = size * 2;
          const patternCanvas = document.createElement("canvas");
          patternCanvas.width = patternCanvas.height = squareSize + 2;
          const ctx = patternCanvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, squareSize, squareSize);
          }
          return patternCanvas;
        };
        break;

      case "diamond":
        brush = new fabric.PatternBrush(canvas);
        brush.getPatternSrc = function () {
          const diamondSize = size * 2;
          const patternCanvas = document.createElement("canvas");
          const rect = new fabric.Rect({
            width: diamondSize,
            height: diamondSize,
            angle: 45,
            fill: color,
          });
          const canvasWidth = rect.getBoundingRect().width;
          patternCanvas.width = patternCanvas.height = canvasWidth;
          const ctx = patternCanvas.getContext("2d");
          if (ctx) rect.render(ctx);
          return patternCanvas;
        };
        break;

      case "circle":
        brush = new fabric.CircleBrush(canvas);
        brush.width = size;
        brush.color = color;
        break;

      case "spray":
        brush = new fabric.SprayBrush(canvas);
        brush.width = size;
        brush.color = color;
        break;

      default:
        brush = new fabric.PencilBrush(canvas);
        brush.color = color;
        brush.width = size;
    }

    return brush;
  };

  useEffect(() => {
    if (canvas) {
      if (brushType !== "none") {
        canvas.isDrawingMode = true;
        const brush = createBrush(canvas, brushType, brushColor, brushSize);
        canvas.freeDrawingBrush = brush;
      } else {
        canvas.isDrawingMode = false;
      }
    }
  }, [canvas, brushType, brushColor, brushSize]);

  const clearBrushStrokes = () => {
    if (!canvas) return;
    addLog("Cleared all created brush strokes");
    // Filter objects that are created in drawing mode
    const objectsToRemove = canvas.getObjects().filter((obj) => {
      // Exclude objects that are not part of brush strokes
      return (
        obj.type === "path" || // Pencil Brush objects
        obj.type === "circle" || // Circle Brush objects
        obj.type === "spray" || // Spray Brush group objects
        obj.type === "group" // Group objects (used by Spray Brush sometimes)
      );
    });

    // Remove the filtered objects
    objectsToRemove.forEach((obj) => canvas.remove(obj));

    canvas.renderAll(); // Refresh the canvas
  };

  useEffect(() => {
    if (!canvas) return;

    // Function to handle selection of an object
    const handleObjectCreated = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        addLog("Selected brush stokes");
        setSelectedObject(activeObject); // Update the context with the selected object
      }
    };

    const handleObjectUpdated = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const objectName = activeObject.type || "Unknown Object";
        addLog(`Updated object: ${objectName}`);
        setSelectedObject(activeObject); // Update the context with the selected object
      }
    };

    const handleObjectModified = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const objectName = activeObject.type || "Unknown Object";
        addLog(`Modified object: ${objectName}`);
        setSelectedObject(activeObject); // Update the context with the selected object
      }
    };

    const handleObjectScaled = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const objectName = activeObject.type || "Unknown Object";
        const scaleX = activeObject.scaleX?.toFixed(2) || "N/A";
        const scaleY = activeObject.scaleY?.toFixed(2) || "N/A";

        addLog(
          `Scaled selected object: ${objectName}. scaleX changed to ${scaleX}, scaleY changed to ${scaleY}`
        );

        addLog("Scaled brush strokes");
        setSelectedObject(activeObject); // Update the context with the selected object
      }
    };

    // Function to handle deselection of objects
    const handleObjectDeselected = () => {
      addLog("Deselected brush strokes");
      setSelectedObject(null); // Clear the selected object in the context
    };

    // Attach event listeners
    canvas.on("selection:created", handleObjectCreated);
    canvas.on("selection:updated", handleObjectUpdated);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:scaling", handleObjectScaled);
    canvas.on("selection:cleared", handleObjectDeselected);

    // Cleanup event listeners on unmount or canvas changes
    return () => {
      canvas.off("selection:created", handleObjectCreated);
      canvas.off("selection:updated", handleObjectUpdated);
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:scaling", handleObjectScaled);
      canvas.off("selection:cleared", handleObjectDeselected);
    };
  }, [canvas, setSelectedObject]);

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      {/* Brush Selector */}
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Tool</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              onValueChange={(value) => {
                addLog("Changed brush type " + brushType + " to " + value);
                setBrushType(value);
              }}
              defaultValue={brushType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a brush" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="pencil">Pencil</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="spray">Spray</SelectItem>
                {/* <SelectItem value="hline">HLine</SelectItem> */}
                {/* <SelectItem value="vline">VLine</SelectItem> */}
                {/* <SelectItem value="square">Square</SelectItem> */}
                {/* <SelectItem value="diamond">Diamond</SelectItem> */}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Color and Size Controls */}
      <div className="w-[90%]">
        <Card>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="color_picker"
                  className="text-sm text-slate-400 mt-2"
                >
                  Color
                </label>
                <Input
                  id="color_picker"
                  type="color"
                  value={brushColor}
                  onChange={(e) => {
                    addLog(
                      "Changed brush color " +
                        brushColor +
                        " to " +
                        e.target.value
                    );
                    setBrushColor(e.target.value);
                  }}
                />
              </div>
              <CustomSlider
                sliderName="Width"
                min={1}
                max={20}
                defaultValue={brushSize}
                sliderValue={brushSize}
                setSliderValue={setBrushSize}
                logName="BrushSize"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={clearBrushStrokes} className="w-full">
              Reset Drawing
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Draw;
