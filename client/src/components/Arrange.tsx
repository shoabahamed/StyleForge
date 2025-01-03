import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import IconComponent from "./icon-component";
import {
  UndoDot,
  RedoDot,
  UnfoldVertical,
  UnfoldHorizontal,
} from "lucide-react";
import { Button } from "./ui/button";
import { Canvas, FabricImage } from "fabric";
import { useEffect, useState } from "react";
import { useLogContext } from "@/hooks/useLogContext";

type ArrangeProps = {
  canvas: Canvas;
  image: FabricImage;
};

const Arrange = ({ canvas, image }: ArrangeProps) => {
  const { addLog } = useLogContext();
  const [rotateX, setRotateX] = useState(false);
  const [rotateY, setRotateY] = useState(false);

  useEffect(() => {
    image.set({
      flipX: rotateX,
      flipY: rotateY,
    });

    canvas.renderAll();
  }, [rotateX, rotateY]);

  const handleReset = () => {
    addLog("Reseted back to original image orientation");
    setRotateX(false);
    setRotateY(false);
  };
  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      {/* <div className="w-[90%]">
      <ImageSize
        canvas={mainCanvas!}
        initialHeight={containerDimensions.height}
        initialWidth={containerDimensions.width}
      />
    </div> */}

      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Roate&Flip</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <IconComponent
                icon={<UndoDot />}
                iconName="Rotate Left"
                handleClick={() => {
                  if (rotateX) {
                    addLog("Rotated 180 degress right");
                  } else {
                    addLog("Rotated 180 degress left");
                  }
                  setRotateX(!rotateX);
                }}
              />

              <IconComponent
                icon={<RedoDot />}
                iconName="Roate Right"
                handleClick={() => {
                  if (rotateX) {
                    addLog("Rotated 180 degress left");
                  } else {
                    addLog("Rotated 180 degress right");
                  }
                  setRotateX(!rotateX);
                }}
              />

              <IconComponent
                icon={<UnfoldVertical />}
                iconName="Vertial Flip"
                handleClick={() => {
                  if (rotateY) {
                    addLog("Rotated 180 degress down");
                  } else {
                    addLog("Rotated 180 degress up");
                  }
                  setRotateX(!rotateY);
                }}
              />

              <IconComponent
                icon={<UnfoldHorizontal />}
                iconName="Vertical  Flip"
                handleClick={() => {
                  if (rotateY) {
                    addLog("Rotated 180 degress up");
                  } else {
                    addLog("Rotated 180 degress down");
                  }
                  setRotateX(!rotateY);
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Mode</CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex flex-col gap-3">
              <Button onClick={handleReset}>Reset Image</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Arrange;
