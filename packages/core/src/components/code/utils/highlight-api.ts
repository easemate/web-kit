interface HighlightAPI {
  Highlight: new (...ranges: Range[]) => unknown;
  highlights: Map<string, unknown>;
}

interface WindowWithHighlightAPI extends Window {
  CSS: {
    highlights: Map<string, unknown>;
  };
  Highlight: new (...ranges: Range[]) => unknown;
}

export const SUPPORTS_HIGHLIGHT_API =
  typeof window !== 'undefined' &&
  typeof (window as unknown as WindowWithHighlightAPI).CSS !== 'undefined' &&
  !!(window as unknown as WindowWithHighlightAPI).CSS?.highlights &&
  typeof (window as unknown as WindowWithHighlightAPI).Highlight === 'function';

export const getHighlightAPI = (): HighlightAPI | null => {
  if (!SUPPORTS_HIGHLIGHT_API) {
    return null;
  }

  const w = window as unknown as WindowWithHighlightAPI;
  return {
    Highlight: w.Highlight,
    highlights: w.CSS.highlights
  };
};
