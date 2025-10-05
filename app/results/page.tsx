"use client"
import Link from "next/link"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { ArrowLeft, RefreshCw, Edit, Sparkles } from "lucide-react"
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
}

const DraggablePanel: React.FC<DraggablePanelProps> = ({ 
    x, y, width, height, imageSrc, alt, index, isSelected, 
    handleDragStart, handleSelect 
}) => {
    
    // Determine border style based on selection
    const borderStyle = isSelected
        ? "4px solid #F06292" // Highlight color (e.g., pink/magenta)
        : "1px solid #777";   // Default border color

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
                transition: "border-color 0.2s ease-in-out", // Smooth highlight transition
                // Prevent image right-click/selection
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                userSelect: 'none',
            }}
            // OnMouseDown handles both drag start AND selection
            onMouseDown={(event) => {
                handleSelect(index);
                handleDragStart(index, event);
            }}
        >
            <img
                src={imageSrc}
                alt={alt}
                draggable="false" // Prevent native image dragging
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    // Additional lock: ensures image doesn't steal pointer events from the parent div
                    pointerEvents: 'none', 
                }}
            />
        </div>
    );
};
// ------------------------------------------


interface StoryboardData {
    panels: string[];  // Base64 encoded panel images
    coordinates: number[][];  // Panel positions [x, y, width, height]
    total_size: number[];  // Original image dimensions [width, height]
    panel_count: number;
    n8n_data?: any;
    original_prompt?: string;
    style?: string;
    panels_requested?: string;
}

function FrameWithPanels() {
    const router = useRouter();
    const [storyboardData, setStoryboardData] = useState<StoryboardData | null>(null);
    const [positions, setPositions] = useState<number[][]>([]);
    const [selectedPanel, setSelectedPanel] = useState<number | null>(null);

    // Load data from sessionStorage on mount
    useEffect(() => {
        const storedData = sessionStorage.getItem('storyboardData');
        if (storedData) {
            try {
                const data: StoryboardData = JSON.parse(storedData);
                console.log("📦 Loaded storyboard data:", data);
                setStoryboardData(data);
                // Initialize positions from coordinates
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

    // Handler to set the selected panel
    const handleSelect = (index: number) => {
        setSelectedPanel(index);
    };

    // Corrected Drag Handler using the global window listener pattern and functional state updates
    const handleDragStart = useCallback((index: number, event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();

        // 1. Calculate the offset (distance from mouse click to panel's top-left corner)
        const rect = event.currentTarget.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        // 2. Define the mouse move logic
        const onMouseMove = (moveEvent: MouseEvent) => {
            // Calculate new X and Y using the current mouse position minus the initial offset
            // We do not need to subtract large fixed numbers (like 650, 200) unless
            // the parent container has a non-zero, non-relative position, which
            // is not the case for the FrameWithPanels div (relative position).
            const newX = moveEvent.clientX - offsetX - 650;
            const newY = moveEvent.clientY - offsetY - 70;

            // Use the functional state update to ensure we use the very latest position state
            setPositions(prevPositions => {
                const updatedPositions = [...prevPositions];
                // Update only the x and y (indices 0 and 1)
                updatedPositions[index] = [newX, newY, updatedPositions[index][2], updatedPositions[index][3]];
                return updatedPositions;
            });
        };

        // 3. Define the mouse up logic (for cleanup)
        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        // 4. Attach global listeners to start the drag
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        // Prevent the browser from trying to select text/image while dragging
        // This is a browser default that needs to be prevented for smooth dragging
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, []); // Empty dependency array, as the logic relies on event and state setter

    // Show loading state while data is loading
    if (!storyboardData) {
        return (
            <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Loading storyboard...</p>
            </div>
        );
    }

    return (
        <div
            style={{
                position: "relative",
                width: `${storyboardData.total_size[0]}px`,
                height: `${storyboardData.total_size[1]}px`,
                border: "2px solid black",
                margin: "0 auto",
            }}
            // Clicking anywhere outside a panel should deselect the current panel
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
                />
            ))}
        </div>
    );
}

// --- ResultsPage (Main Component) ---
export default function ResultsPage() {
    // ... (omitted static data for brevity)

    const getCardClass = (theme: string) => {
        const themeMap: Record<string, string> = {
            blue: "card-tinted-blue", peach: "card-tinted-peach", pink: "card-tinted-pink",
            lavender: "card-tinted-lavender", mint: "card-tinted-mint", yellow: "card-tinted-yellow",
        }
        return themeMap[theme] || ""
    }

    const getWashiColor = (theme: string) => {
        const colorMap: Record<string, string> = {
            blue: "#C6DEF1", peach: "#F7D9C4", pink: "#F2C6DE",
            lavender: "#DBCDF0", mint: "#C9E4DE", yellow: "#FAEDCB",
        }
        return colorMap[theme] || "#C9E4DE"
    }

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

                {/* Panels Grid */}
                <Card className="max-w-6xl mx-auto mb-8 bg-white/95 backdrop-blur-sm border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform hover:-translate-y-1">
                    <CardHeader>
                    </CardHeader>
                    <CardContent>
                        <FrameWithPanels />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}