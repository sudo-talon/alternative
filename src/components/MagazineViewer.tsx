import { useState, useRef, forwardRef, useEffect, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Maximize, Minimize } from "lucide-react";

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PageCoverProps {
  children: React.ReactNode;
  coverImage?: string;
}

const PageCover = forwardRef<HTMLDivElement, PageCoverProps>((props, ref) => {
  return (
    <div className="page page-cover" ref={ref} data-density="hard">
      <div className="page-content flex items-center justify-center h-full bg-primary text-primary-foreground p-4">
        {props.coverImage ? (
          <img 
            src={props.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover rounded"
          />
        ) : (
          props.children
        )}
      </div>
    </div>
  );
});
PageCover.displayName = "PageCover";

interface FlipPageProps {
  pageNumber: number;
  width: number;
  height: number;
}

const FlipPage = forwardRef<HTMLDivElement, FlipPageProps>((props, ref) => {
  return (
    <div className="page bg-white shadow-lg" ref={ref}>
      <Page
        pageNumber={props.pageNumber}
        width={props.width}
        height={props.height}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        className="flex items-center justify-center"
      />
    </div>
  );
});
FlipPage.displayName = "FlipPage";

interface Magazine {
  id: string;
  title: string;
  issue: string | null;
  cover_image_url: string | null;
  pdf_url: string;
}

interface MagazineViewerProps {
  magazine: Magazine;
  isOpen: boolean;
  onClose: () => void;
}

export const MagazineViewer = ({ magazine, isOpen, onClose }: MagazineViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(true); // Start in fullscreen by default
  const [dimensions, setDimensions] = useState({ width: 300, height: 420 });
  const bookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-enter fullscreen when viewer opens
  useEffect(() => {
    if (isOpen && containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        // Fullscreen may not be available, that's ok
        setIsFullscreen(false);
      });
    }
  }, [isOpen]);

  // Calculate responsive page dimensions
  const updateDimensions = useCallback(() => {
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth < 1024;
    
    if (isMobile) {
      setDimensions({ 
        width: Math.min(280, window.innerWidth - 80), 
        height: Math.min(380, (window.innerWidth - 80) * 1.4) 
      });
    } else if (isTablet) {
      setDimensions({ width: 320, height: 440 });
    } else {
      setDimensions({ width: 400, height: 550 });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [updateDimensions]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = () => {
    setIsLoading(false);
  };

  const handlePrevPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const handleNextPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const handlePageFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowLeft") handlePrevPage();
      if (e.key === "ArrowRight") handleNextPage();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Touch gestures for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNextPage();
      else handlePrevPage();
    }
    setTouchStart(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        ref={containerRef}
        className="max-w-[98vw] w-full max-h-[98vh] h-full sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[1400px] p-0 overflow-hidden bg-background/95 backdrop-blur-lg"
      >
        <DialogHeader className="p-3 sm:p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-sm sm:text-lg truncate">{magazine.title}</DialogTitle>
              {magazine.issue && (
                <p className="text-xs text-muted-foreground truncate">{magazine.issue}</p>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Zoom Controls */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={scale <= 0.6}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs sm:text-sm font-medium min-w-[40px] text-center hidden sm:inline">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={scale >= 2}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div 
          className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-auto bg-gradient-to-b from-muted/30 to-muted/50"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Document
            file={magazine.pdf_url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading magazine...</p>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                <p className="text-destructive font-medium">Failed to load magazine</p>
                <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
              </div>
            }
          >
            {!isLoading && numPages > 0 && (
              <div 
                className="relative"
                style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
              >
                <HTMLFlipBook
                  ref={bookRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  size="stretch"
                  minWidth={200}
                  maxWidth={500}
                  minHeight={300}
                  maxHeight={650}
                  showCover={true}
                  mobileScrollSupport={true}
                  onFlip={handlePageFlip}
                  className="shadow-2xl rounded-lg overflow-hidden"
                  style={{}}
                  startPage={0}
                  drawShadow={true}
                  flippingTime={600}
                  usePortrait={window.innerWidth < 640}
                  startZIndex={0}
                  autoSize={true}
                  maxShadowOpacity={0.4}
                  showPageCorners={true}
                  disableFlipByClick={false}
                  swipeDistance={30}
                  clickEventForward={true}
                  useMouseEvents={true}
                >
                  {/* Cover Page */}
                  <PageCover coverImage={magazine.cover_image_url || undefined}>
                    <div className="text-center">
                      <h2 className="text-xl sm:text-2xl font-bold mb-2">{magazine.title}</h2>
                      {magazine.issue && (
                        <p className="text-sm opacity-80">{magazine.issue}</p>
                      )}
                    </div>
                  </PageCover>

                  {/* PDF Pages */}
                  {Array.from(new Array(numPages), (_, index) => (
                    <FlipPage
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      width={dimensions.width}
                      height={dimensions.height}
                    />
                  ))}

                  {/* Back Cover */}
                  <PageCover>
                    <div className="text-center">
                      <p className="text-lg font-semibold">Thank You</p>
                      <p className="text-sm opacity-80 mt-2">Defence Intelligence College Nigeria</p>
                    </div>
                  </PageCover>
                </HTMLFlipBook>
              </div>
            )}
          </Document>

          {/* Navigation Controls */}
          {!isLoading && numPages > 0 && (
            <div className="flex items-center justify-center gap-4 mt-4 p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-lg border">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="h-10 w-10 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm font-medium min-w-[100px] text-center">
                Page {currentPage + 1} of {numPages + 2}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage >= numPages + 1}
                className="h-10 w-10 rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Mobile swipe hint */}
          <p className="text-xs text-muted-foreground mt-2 sm:hidden">
            Swipe or tap to turn pages
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};