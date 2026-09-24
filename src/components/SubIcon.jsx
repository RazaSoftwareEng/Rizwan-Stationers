// Line illustrations for each sub-category, used until real photos are added.
const paths = {
  "fountain-pens": (
    <>
      <path d="M12 2.5l5 7-5 12-5-12 5-7z" />
      <path d="M12 9.5v5" />
      <circle cx="12" cy="9.5" r="1" />
    </>
  ),
  "ballpoint-rollerball": (
    <>
      <path d="M5 19l1.5-4.5L16 5l3 3-9.5 9.5L5 19z" />
      <path d="M14 7l3 3" />
      <path d="M17.5 3.5l3 3" />
    </>
  ),
  "inks-refills": (
    <>
      <rect x="6" y="10" width="12" height="11" rx="2.5" />
      <path d="M9 10V6.5h6V10" />
      <path d="M8.5 4.5h7" />
      <path d="M9 15.5h6" />
    </>
  ),
  "journals-diaries": (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8.5 3v18" />
      <path d="M16 3v18" />
      <path d="M11 8h2.5" />
    </>
  ),
  "desk-organisers": (
    <>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V4M11 11V6M15 11l2-6" />
      <path d="M10 11v9M14 11v9" />
    </>
  ),
  "pen-holders": (
    <>
      <path d="M7 10h10l-1.2 10.5H8.2L7 10z" />
      <path d="M9.5 10V4M12 10V6M14.5 10l2-5.5" />
      <path d="M7.5 14h9" />
    </>
  ),
  "file-trays": (
    <>
      <path d="M3.5 9.5h17v4h-17zM3.5 16h17v4h-17z" />
      <path d="M6 9.5V5h12v4.5" />
      <path d="M10 18h4M10 11.5h4" />
    </>
  ),
  "storage-boxes": (
    <>
      <rect x="3.5" y="8" width="17" height="12" rx="1.5" />
      <path d="M3.5 12h17" />
      <path d="M10 15.5h4" />
      <path d="M5 8l1.5-3.5h11L19 8" />
    </>
  ),
  notebooks: (
    <>
      <rect x="6.5" y="3" width="13" height="18" rx="2" />
      <path d="M4 6.5h4.5M4 10.5h4.5M4 14.5h4.5M4 18.5h4.5" />
      <path d="M11 8h5.5M11 12h5.5" />
    </>
  ),
  registers: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M5 7.5h14" />
      <path d="M8 11.5h8M8 14.5h8M8 17.5h5" />
    </>
  ),
  "sticky-notes": (
    <>
      <path d="M4 4h16v11l-5 5H4V4z" />
      <path d="M15 20v-5h5" />
      <path d="M8 9h8M8 12.5h5" />
    </>
  ),
  "printing-paper": (
    <>
      <path d="M8 3h11v14H8z" />
      <path d="M5 6.5V21h11" />
      <path d="M11 7.5h5M11 10.5h5M11 13.5h3" />
    </>
  ),
  "pens-pencils": (
    <>
      <path d="M16.5 3.5l4 4L8 20H4v-4L16.5 3.5z" />
      <path d="M14 6l4 4" />
      <path d="M4 16l4 4" />
    </>
  ),
  "colours-markers": (
    <>
      <path d="M8.5 2.5h7v7l-2 3V21h-3v-8.5l-2-3v-7z" />
      <path d="M8.5 9.5h7" />
      <path d="M11 5.5h2" />
    </>
  ),
  geometry: (
    <>
      <path d="M4 20h16L4 4v16z" />
      <path d="M8 16h4l-4-4v4z" />
      <path d="M4 8h2M4 12h2M8 20v-2M12 20v-2" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6.5" cy="17.5" r="3" />
      <circle cx="17.5" cy="17.5" r="3" />
      <path d="M8.6 15.4L19 3.5M15.4 15.4L5 3.5" />
    </>
  ),
  "art-supplies": (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5S14 15 15 15h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="10" cy="7" r="1" />
      <circle cx="15" cy="7.5" r="1" />
    </>
  ),
};

export default function SubIcon({ sub, className = "sub-icon" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[sub]}
    </svg>
  );
}
