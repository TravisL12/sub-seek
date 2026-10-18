import { useEffect, useRef } from 'react';

const BUTTON_ID = 'subseek-toggle-btn';
// Copied to the build root by webpack and listed in web_accessible_resources
const ICON_PATH = 'icon-192.png';
// Plex appends a build hash to its class names (e.g. PlayerControls-buttonGroupRight-Bs12vn),
// so match on the stable prefix instead
const RIGHT_GROUP_SELECTOR = '[class*="PlayerControls-buttonGroupRight"]';

// Returns the right-hand group's first control (the ⋮ menu), lifted to the level of its
// sibling controls so the SubSeek button can be inserted right after it
const findAnchor = () => {
  const firstButton = document
    .querySelector(RIGHT_GROUP_SELECTOR)
    ?.querySelector('button');
  let node: HTMLElement | null | undefined = firstButton;
  while (
    node?.parentElement &&
    node.parentElement.querySelectorAll('button').length < 2
  ) {
    node = node.parentElement;
  }
  return node;
};

export const usePlexButton = ({
  isClosed,
  openSubSeek,
  closeSubSeek,
}: {
  isClosed: boolean;
  openSubSeek: () => void;
  closeSubSeek: () => void;
}) => {
  const toggleRef = useRef({ isClosed, openSubSeek, closeSubSeek });

  useEffect(() => {
    toggleRef.current = { isClosed, openSubSeek, closeSubSeek };
  });

  useEffect(() => {
    const btn = document.getElementById(BUTTON_ID);
    if (btn) {
      btn.classList.toggle('subseek-active', !isClosed);
    }
  }, [isClosed]);

  useEffect(() => {
    const logoUrl = chrome.runtime.getURL(ICON_PATH);

    const inject = () => {
      if (document.getElementById(BUTTON_ID)) return;
      const anchor = findAnchor();
      if (!anchor) return;

      const btn = document.createElement('button');
      btn.id = BUTTON_ID;
      btn.title = 'SubSeek';

      const img = document.createElement('img');
      img.src = logoUrl;
      btn.appendChild(img);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const { isClosed, openSubSeek, closeSubSeek } = toggleRef.current;
        if (isClosed) {
          openSubSeek();
        } else {
          closeSubSeek();
        }
      });

      anchor.after(btn);
    };

    inject();
    const observer = new MutationObserver(inject);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.getElementById(BUTTON_ID)?.remove();
    };
  }, []);
};
