const paths = {
  "fine-writing": (
    <>
      <path d="M12 2.5l5 7-5 12-5-12 5-7z" />
      <path d="M12 9.5v5" />
      <circle cx="12" cy="9.5" r="1" />
    </>
  ),
  organisers: (
    <>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V4M11 11V6M15 11l2-6" />
      <path d="M10 11v9M14 11v9" />
    </>
  ),
  paper: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  school: (
    <>
      <path d="M16.5 3.5l4 4L8 20H4v-4L16.5 3.5z" />
      <path d="M14 6l4 4" />
    </>
  ),
};

export default function CategoryIcon({ category, className = "cat-icon" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[category]}
    </svg>
  );
}
