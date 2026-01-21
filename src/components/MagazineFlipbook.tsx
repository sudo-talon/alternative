import { useState, useRef, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PageCoverProps {
  children: React.ReactNode;
}

const PageCover = forwardRef<HTMLDivElement, PageCoverProps>((props, ref) => {
  return (
    <div className="page page-cover" ref={ref} data-density="hard">
      <div className="page-content flex items-center justify-center h-full bg-primary text-primary-foreground p-4">
        {props.children}
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

interface MagazineFlipbookProps {
  pdfUrl: string;
  title?: string;
  variant?: "desktop" | "mobile";
}

export const MagazineFlipbook = ({ pdfUrl, title = "College Magazine", variant = "desktop" }: MagazineFlipbookProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  type PageFlipController = { flipPrev: () => void; flipNext: () => void };
  type BookRefType = { pageFlip: () => PageFlipController };
  const bookRef = useRef<BookRefType | null>(null);
  const { t } = useLanguage();

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

  const handlePageFlip = (e: { data: number }) => {
    setCurrentPage(e.data);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  // Calculate responsive page dimensions
  const getPageDimensions = () => {
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth < 1024;
    
    if (isMobile) {
      return { width: Math.min(280, window.innerWidth - 80), height: 380 };
    } else if (isTablet) {
      return { width: 320, height: 440 };
    }
    return { width: 400, height: 550 };
  };

  const { width: pageWidth, height: pageHeight } = getPageDimensions();

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className={
          variant === "mobile"
            ? "w-full text-primary-foreground hover:bg-primary-foreground/10 justify-start h-12 text-base gap-2"
            : "text-primary-foreground hover:bg-primary-foreground/10 text-sm px-3 gap-1"
        }
      >
        <BookOpen className={variant === "mobile" ? "h-5 w-5" : "h-4 w-4"} />
        {t('collegeMagazine') || 'College Magazine'}
      </Button>

      {/* Flipbook Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[1200px] p-0 overflow-hidden">
          <DialogHeader className="p-3 sm:p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between gap-2">
              <DialogTitle className="text-sm sm:text-lg truncate">{title}</DialogTitle>
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
                <span className="text-xs sm:text-sm font-medium min-w-[40px] text-center">
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
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-auto bg-muted/30">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                    width={pageWidth}
                    height={pageHeight}
                    size="stretch"
                    minWidth={200}
                    maxWidth={500}
                    minHeight={300}
                    maxHeight={600}
                    showCover={true}
                    mobileScrollSupport={true}
                    onFlip={handlePageFlip}
                    className="shadow-2xl rounded-lg overflow-hidden"
                    style={{}}
                    startPage={0}
                    drawShadow={true}
                    flippingTime={800}
                    usePortrait={window.innerWidth < 640}
                    startZIndex={0}
                    autoSize={true}
                    maxShadowOpacity={0.5}
                    showPageCorners={true}
                    disableFlipByClick={false}
                    swipeDistance={30}
                    clickEventForward={true}
                    useMouseEvents={true}
                  >
                    {/* Cover Page */}
                    <PageCover>
                      <div className="text-center">
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">{title}</h2>
                        <p className="text-sm opacity-80">Defence Intelligence College</p>
                      </div>
                    </PageCover>

                    {/* PDF Pages */}
                    {Array.from(new Array(numPages), (_, index) => (
                      <FlipPage
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        width={pageWidth}
                        height={pageHeight}
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
              <div className="flex items-center justify-center gap-4 mt-4 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-md">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="h-10 w-10 rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm font-medium min-w-[80px] text-center">
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MagazineFlipbook;
