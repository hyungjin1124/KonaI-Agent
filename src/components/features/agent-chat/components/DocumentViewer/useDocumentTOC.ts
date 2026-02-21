import { useState, useEffect, useCallback, useRef } from 'react';
import type { TOCItem } from './types';

interface UseDocumentTOCOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'csv' | 'pptx';
  enabled?: boolean;
}

interface UseDocumentTOCResult {
  tocItems: TOCItem[];
  activeTOCId: string | null;
  scrollToHeading: (id: string) => void;
  extractHeadings: () => void;
}

const HEADING_SELECTORS = 'h1, h2, h3, h4, h5, h6';

function getHeadingLevel(tagName: string): number {
  const match = tagName.match(/^H(\d)$/i);
  return match ? parseInt(match[1], 10) : 0;
}

export function useDocumentTOC({
  containerRef,
  fileType,
  enabled = true,
}: UseDocumentTOCOptions): UseDocumentTOCResult {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeTOCId, setActiveTOCId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const extractHeadings = useCallback(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    // XLSX, CSV, PPTX don't have headings
    if (fileType === 'xlsx' || fileType === 'csv' || fileType === 'pptx') {
      setTocItems([]);
      return;
    }

    const headingElements = container.querySelectorAll(HEADING_SELECTORS);
    const items: TOCItem[] = [];

    headingElements.forEach((el, index) => {
      const text = el.textContent?.trim();
      if (!text) return;

      const id = `doc-heading-${index}`;
      el.setAttribute('id', id);

      items.push({
        id,
        level: getHeadingLevel(el.tagName),
        text,
        element: el as HTMLElement,
      });
    });

    setTocItems(items);

    if (items.length > 0 && !activeTOCId) {
      setActiveTOCId(items[0].id);
    }
  }, [containerRef, fileType, enabled, activeTOCId]);

  // Scroll spy with IntersectionObserver
  useEffect(() => {
    if (!enabled || tocItems.length === 0) return;

    const container = containerRef.current;
    if (!container) return;

    // Find the scrollable parent
    const scrollRoot = container.closest('[data-scroll-container]') || container;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries[0];
          const id = topEntry.target.getAttribute('id');
          if (id) setActiveTOCId(id);
        }
      },
      {
        root: scrollRoot === container ? container : null,
        rootMargin: '-10% 0px -80% 0px',
        threshold: 0,
      }
    );

    tocItems.forEach((item) => {
      if (item.element) {
        observerRef.current?.observe(item.element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [tocItems, enabled, containerRef]);

  const scrollToHeading = useCallback(
    (id: string) => {
      const item = tocItems.find((t) => t.id === id);
      if (item?.element) {
        item.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveTOCId(id);
      }
    },
    [tocItems]
  );

  return { tocItems, activeTOCId, scrollToHeading, extractHeadings };
}
