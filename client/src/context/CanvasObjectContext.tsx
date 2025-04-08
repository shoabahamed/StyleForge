import { createContext, useState, ReactNode } from "react";

// Define the type of the canvas object
type CanvasObject = any;
interface originalImageDimensionsType {
  imageWidth: number;
  imageHeight: number;
}
interface finalImageDimensionsType {
  imageWidth: number;
  imageHeight: number;
}

// Define the context type
interface CanvasObjectsContextType {
  selectedObject: CanvasObject | null;
  setSelectedObject: (obj: CanvasObject | null) => void;
  originalImageDimensions: originalImageDimensionsType;
  setOriginalImageDimensions: (obj: originalImageDimensionsType) => void;
  finalImageDimensions: finalImageDimensionsType;
  setFinalImageDimensions: (obj: finalImageDimensionsType) => void;
  loadedFromSaved: boolean;
  setLoadedFromSaved: (value: boolean) => void;
  zoomValue: number;
  setZoomValue: (value: number) => void;
}

// Create the context with a default value
export const CanvasObjectsContext = createContext<
  CanvasObjectsContextType | undefined
>(undefined);

// Create a provider component
export const CanvasObjectsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [selectedObject, setSelectedObject] = useState<CanvasObject | null>(
    null
  );
  const [originalImageDimensions, setOriginalImageDimensions] =
    useState<originalImageDimensionsType>({
      imageWidth: 0,
      imageHeight: 0,
    });
  const [finalImageDimensions, setFinalImageDimensions] =
    useState<finalImageDimensionsType>({
      imageWidth: 0,
      imageHeight: 0,
    });
  const [loadedFromSaved, setLoadedFromSaved] = useState(false);

  const [zoomValue, setZoomValue] = useState(1);

  return (
    <CanvasObjectsContext.Provider
      value={{
        selectedObject,
        setSelectedObject,
        originalImageDimensions,
        finalImageDimensions,
        setFinalImageDimensions,
        setOriginalImageDimensions,
        loadedFromSaved,
        setLoadedFromSaved,
        zoomValue,
        setZoomValue,
      }}
    >
      {children}
    </CanvasObjectsContext.Provider>
  );
};
