"use client"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { ArrowLeft, RefreshCw, Edit, Sparkles } from "lucide-react"
import React, { useState, useCallback } from "react";

// --- Sub-Component for Draggable Panel ---
interface DraggablePanelProps {
    x: number;
    y: number;
    width: number;
    height: number;
    imageSrc: string;
    alt: string;
    index: number;
    isSelected: boolean;
    handleDragStart: (index: number, event: React.MouseEvent<HTMLDivElement>) => void;
    handleSelect: (index: number) => void;
    handleResize: (index: number, event: React.MouseEvent<HTMLDivElement>, direction: string) => void;
    onClick?: () => void; // Add onClick to the interface
}
const DraggablePanel: React.FC<DraggablePanelProps> = ({ 
    x, y, width, height, imageSrc, alt, index, isSelected, 
    handleDragStart, handleSelect, handleResize
}) => {
    const borderStyle = isSelected
        ? "4px solid #F06292"
        : "1px solid #777";

    return (
        <div
            key={index}
            style={{
                position: "absolute",
                left: `${x}px`,
                top: `${y}px`,
                width: `${width}px`,
                height: `${height}px`,
                overflow: "hidden",
                cursor: "grab",
                border: borderStyle,
                transition: "border-color 0.2s ease-in-out",
                userSelect: "none",
            }}
            onMouseDown={(event) => {
                // only start dragging
                handleDragStart(index, event);
            }}
            onClick={(e) => {
                e.stopPropagation(); // prevent parent deselect
                handleSelect(index); // now selection happens on click
            }}
        >
            <img
                src={imageSrc}
                alt={alt}
                draggable="false"
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "10px",
                    height: "10px",
                    backgroundColor: "var(--foreground-color)",
                    cursor: "nwse-resize",
                }}
                onMouseDown={(event) => handleResize(index, event, "bottom-right")}
            />
        </div>
    );
};

// ------------------------------------------


function FrameWithPanels() {
    // [x, y, width, height]
    const initialPanelData = [
        [46, 0, 259, 249],
        [46, 250, 259, 204],
        [307, 0, 249, 454],
        [46, 455, 510, 440],
    ];

    const handleResetLayout = () => {
        setPositions(initialPanelData);  // reset rectangles
        setSelectedPanel(null);          // also clear selection if you want
    };

    const coreImage = [602, 895]; // [width, height]

    const panelImages = [
        "/stub/panel0.png",
        "/stub/panel1.png",
        "/stub/panel2.png",
        "/stub/panel3.png",
    ];

    const [positions, setPositions] = useState(initialPanelData);
    const [selectedPanel, setSelectedPanel] = useState<number | null>(null);
    const [activePanel, setActivePanel] = useState<number | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [popupImage, setPopupImage] = useState<string | null>(null);

    const handleTogglePanel = (index: number) => {
        // Toggle selection
        setSelectedPanel(selectedPanel === index ? null : index);
    };

    const handleDragStart = useCallback((index: number, event: React.MouseEvent<HTMLDivElement>) => {
        if (isResizing) return; // Prevent drag if resizing
        event.stopPropagation();

        const rect = event.currentTarget.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (isResizing) return; // Prevent drag if resizing

            const newX = moveEvent.clientX - offsetX - (window.innerWidth / 3 - coreImage[0] / 2);
            const newY = moveEvent.clientY - offsetY - window.innerHeight * 0.1;

            setPositions(prevPositions => {
                const updatedPositions = [...prevPositions];
                updatedPositions[index] = [newX, newY, updatedPositions[index][2], updatedPositions[index][3]];
                return updatedPositions;
            });
        };

        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [isResizing]);

    const handleResize = (index: number, event: React.MouseEvent<HTMLDivElement>, direction: string) => {
        setIsResizing(true);

        const newPositions = [...positions];

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.movementX;
            const deltaY = moveEvent.movementY;

            if (direction === "bottom-right") {
                newPositions[index] = [
                    newPositions[index][0],
                    newPositions[index][1],
                    newPositions[index][2] + deltaX,
                    newPositions[index][3] + deltaY,
                ];
            }

            setPositions([...newPositions]);
        };

        const onMouseUp = () => {
            setIsResizing(false);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    const handleSegmentLayersClick = (imageSrc: string) => {
        setPopupImage(imageSrc);
    };

    const closePopup = () => {
        setPopupImage(null);
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            <Card className="max-w-6xl bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1" style={{
                backgroundImage: "linear-gradient(to right, #e0e0e0 1px, transparent 1px), linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                width: `${coreImage[0] * 1.1}px`,
                height: `${coreImage[1] * 1.1}px`,
            }}>
                <CardHeader>
                </CardHeader>
                <CardContent>
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                        }}
                        onClick={() => setSelectedPanel(null)}
                    >
                        {positions.map(([x, y, width, height], index) => (
                            <DraggablePanel
                                key={index}
                                index={index}
                                x={x}
                                y={y}
                                width={width}
                                height={height}
                                imageSrc={panelImages[index]}
                                alt={`Panel ${index + 1}`}
                                isSelected={selectedPanel === index}
                                handleSelect={handleTogglePanel}
                                handleDragStart={handleDragStart}
                                handleResize={handleResize}
                                onClick={() => handleTogglePanel(index)}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="max-w-sm bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1" style={{
                width: "500px",
                height: "450px",
                padding: "20px",
                overflowY: "auto",
            }}>
                    <CardHeader className="relative">
                        <div className="absolute inset-0 items-center justify-center w-70 h-10 -rotate-5">
                            <img
                                src="/highlight_orange.png"
                                alt="Background"
                                className="w-full h-full object-cover pointer-events-none"
                            />
                            </div>
                        <CardTitle className="text-2xl font-black text-foreground relative">{selectedPanel !== null ? `Panel ${selectedPanel + 1} Info` : "Overall Info"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                    {selectedPanel !== null ? (
                       <div className="space-y-4 tp-24">
                        <div className="grid flex gap-4 mt-20">
                            <button
                            className="washi-tape-pink w-60 backdrop-blur-sm border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1"
                            style={{
                                padding: "10px 20px",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                            onClick={() => handleSegmentLayersClick(panelImages[selectedPanel!])}
                            >
                            Regenerate this panel
                            </button>
                            <button
                            className="washi-tape-blue w-60 backdrop-blur-sm border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1"
                            style={{
                                padding: "10px 20px",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = panelImages[selectedPanel]; // Use the selected panel image URL
                                link.download = `panel-${selectedPanel + 1}.png`; // Set the file name
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            >
                            Save My File
                            </button>
                        </div>
                        </div>

                    ) : (
                        <div>
                            <p style={{ fontSize: "14px", color: "#555" }}>Select a panel to see details and actions.</p>
                             <div className="flex gap-2 mt-35">
                                    <button
                                    className="washi-tape-mint w-30 backdrop-blur-sm border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1"
                                    style={{
                                        padding: "10px 20px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleResetLayout()}
                                    >
                                    Reset Layout
                                    </button>
                                    <button
                                    className="washi-tape-pink w-30 backdrop-blur-sm border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1"
                                    style={{
                                        padding: "10px 20px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleSegmentLayersClick(panelImages[selectedPanel!])}
                                    >
                                    Save Original PNG
                                    </button>
                                    <button
                                    className="washi-tape-blue w-30 backdrop-blur-sm border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1"
                                    style={{
                                        padding: "10px 20px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => {
                                    }}
                                    >
                                    Save Original PSD
                                    </button>
                                </div>
                        </div>
                        
                    )}
                </CardContent>
            </Card>

            {popupImage && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                    onClick={closePopup}
                >
                    <Card
                        className="bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform"
                        style={{
                            width: "80vw",
                            height: "80vh",
                            display: "flex",
                            flexDirection: "row",
                            overflow: "hidden",
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
                    >
                        <div style={{ flex: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <img
                                src={popupImage}
                                alt="Panel Popup"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        </div>
                        <div
                            style={{
                                flex: 1,
                                backgroundColor: "#f9f9f9",
                                padding: "20px",
                                overflowY: "auto",
                                borderLeft: "2px solid var(--foreground-color)",
                            }}
                        >
                            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>{"Information"}</h2>
                            <p style={{ fontSize: "14px", color: "#555" }}>Details about the selected panel can go here.</p>
                            {/* Add more information or controls here */}
                        </div>
                        <button
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                backgroundColor: "red",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                padding: "5px 10px",
                                cursor: "pointer",
                            }}
                            onClick={closePopup}
                        >
                            Close
                        </button>
                    </Card>
                </div>
            )}
        </div>
    );
}

// --- ResultsPage (Main Component) ---
export default function ResultsPage() {

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Gradient Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#F2C6DE] via-[#DBCDF0] to-[#C6DEF1] -z-10" />

            {/* Decoration Panels */}
            <div className="fixed inset-0 -z-5 opacity-20 pointer-events-none">
                {/* ... (omitted decoration panels for brevity) */}
            </div>

            {/* Header */}
            <header className="border-b-2 border-transparent bg-transparent backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </Link>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 md:py-12">
                {/* Header Section */}
                <Card className="max-w-6xl mx-auto mb-8 bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1">
                    <CardHeader>
                        <div className="inline-block mb-2">
                            <div className="washi-tape washi-tape-lavender text-sm font-medium text-foreground w-30">✨ Generated</div>
                        </div>
                        
                        <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">Your Storyboard Creation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground italic">
                            Review your generated panels below. You can drag the panels, and click to highlight their borders.
                        </p>
                    </CardContent>
                </Card>
                <FrameWithPanels />
            </div>
        </div>
    )
}

