export function WhatsappButton({ whatsapp }: { whatsapp: string }) {
  const href = `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Message on WhatsApp"
      className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border-2 border-cream bg-burgundy text-cream shadow-lg transition-transform hover:scale-105 sm:bottom-8 sm:right-8 sm:h-14 sm:w-14"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6 sm:h-7 sm:w-7"
        aria-hidden="true"
      >
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.43 1.26 4.87L2 22l5.29-1.39A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.13c-1.55 0-3.02-.42-4.29-1.15l-.31-.18-3.14.82.84-3.06-.2-.32a8.1 8.1 0 0 1-1.24-4.24c0-4.5 3.66-8.16 8.17-8.16s8.16 3.66 8.16 8.16-3.65 8.13-8.16 8.13Zm4.48-6.11c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.96-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.35-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
      </svg>
    </a>
  );
}
