"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { ArrowLeft } from "lucide-react"
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

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
                handleDragStart(index, event);
            }}
            onClick={(e) => {
                e.stopPropagation();
                handleSelect(index);
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


interface StoryboardData {
    panels: string[];
    coordinates: number[][];
    total_size: number[];
    panel_count: number;
    n8n_data?: any;
    final_image: string;
    original_prompt?: string;
    style?: string;
    panels_requested?: string;
}

function FrameWithPanels() {
    const router = useRouter();
    const [storyboardData, setStoryboardData] = useState<StoryboardData | null>(null);
    const [initialPositions, setInitialPositions] = useState<number[][]>([]);
    const [positions, setPositions] = useState<number[][]>([]);
    const [selectedPanel, setSelectedPanel] = useState<number | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [popupImage, setPopupImage] = useState<string | null>(null);
    const [popupData, setPopupData] = useState<{ prompt: string; characters: string[] }>({ prompt: '', characters: [] });
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Load data from sessionStorage on mount
    useEffect(() => {
        const storedData = sessionStorage.getItem('storyboardData');
        if (storedData) {
            try {
                const data: StoryboardData = JSON.parse(storedData);
                console.log("📦 Loaded storyboard data");
                setStoryboardData(data);
                setInitialPositions(data.coordinates);
                setPositions(data.coordinates);
            } catch (error) {
                console.error("Failed to parse storyboard data:", error);
                router.push("/create");
            }
        } else {
            console.warn("No storyboard data found, redirecting to create page");
            router.push("/create");
        }
    }, [router]);

    const handleResetLayout = () => {
        setPositions(initialPositions);
        setSelectedPanel(null);
    };

    const handleSelect = (index: number) => {
        setSelectedPanel(selectedPanel === index ? null : index);
    };

    const handleDragStart = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
        if (isResizing) return;
        event.stopPropagation();

        const container = containerRef.current;
        if (!container) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const currentContainerRect = container.getBoundingClientRect();
            const newX = moveEvent.clientX - currentContainerRect.left - offsetX;
            const newY = moveEvent.clientY - currentContainerRect.top - offsetY;

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
    };

    const handleResize = (index: number, event: React.MouseEvent<HTMLDivElement>, direction: string) => {
        event.stopPropagation();
        setIsResizing(true);

        const container = containerRef.current;
        if (!container) return;

        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = positions[index][2];
        const startHeight = positions[index][3];

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            setPositions(prevPositions => {
                const updatedPositions = [...prevPositions];
                if (direction === "bottom-right") {
                    updatedPositions[index] = [
                        updatedPositions[index][0],
                        updatedPositions[index][1],
                        Math.max(50, startWidth + deltaX),
                        Math.max(50, startHeight + deltaY),
                    ];
                }
                return updatedPositions;
            });
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

    // Show loading state while data is loading
    if (!storyboardData) {
        return (
            <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Loading storyboard...</p>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            <Card className="max-w-6xl bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1" style={{
                backgroundImage: "linear-gradient(to right, #e0e0e0 1px, transparent 1px), linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                width: `${storyboardData.total_size[0] * 1.1}px`,
                height: `${storyboardData.total_size[1] * 1.1}px`,
            }}>
                <CardHeader>
                </CardHeader>
                <CardContent>
                    <div
                        ref={containerRef}
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
                                imageSrc={storyboardData.panels[index]}
                                alt={`Panel ${index + 1}`}
                                isSelected={selectedPanel === index}
                                handleSelect={handleSelect}
                                handleDragStart={handleDragStart}
                                handleResize={handleResize}
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
                    <CardTitle className="text-2xl font-black text-foreground relative">
                        {selectedPanel !== null ? `Panel ${selectedPanel + 1} Info` : "Overall Info"}
                    </CardTitle>
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
                                    onClick={() => handleSegmentLayersClick(storyboardData.panels[selectedPanel])}
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
                                        link.href = storyboardData.panels[selectedPanel];
                                        link.download = `panel-${selectedPanel + 1}.png`;
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
                                    onClick={() => {
                                        if (storyboardData?.final_image) {
                                            console.log(`📥 Downloading final image ${storyboardData.final_image}`);
                                            const link = document.createElement('a');
                                            link.href = `${storyboardData.final_image}`;
                                            link.download = 'original_image.png';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        } else {
                                            alert("No final image available to download.");
                                        }
                                    }}
                                >
                                    Save Original PNG
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
                            <p style={{ fontSize: "14px", color: "#555" }}><strong>Prompt:</strong> {popupData.prompt}</p>
                            <ul style={{ fontSize: "14px", color: "#555" }}>
                                {popupData.characters.map((character, index) => (
                                    <li key={index}>{character}</li>
                                ))}
                            </ul>
                            
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
                            <div className="washi-tape washi-tape-lavender text-sm font-medium text-foreground w-40">✨ Generated</div>
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

