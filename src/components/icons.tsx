import React from 'react'

type P = { className?: string }
const S = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    stroke="currentColor"
  >
    {children}
  </svg>
)

export const BoxIcon = ({ className }: P) => (
  <S className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-8.25 4.5m8.25-4.5-8.25-4.5m8.25 4.5v8.25L12 20.25m0-12.75L3.75 7.5m8.25 4.5 8.25-4.5M3.75 7.5v8.25L12 20.25" />
  </S>
)
export const HomeIcon = ({ className }: P) => (
  <S className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.5 1.5 0 0 1 2.121 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
  </S>
)
export const PlusIcon = ({ className }: P) => (
  <S className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </S>
)
export const ListIcon = ({ className }: P) => (
  <S className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </S>
)
export const TrashIcon = ({ className }: P) => (
  <S className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.347 9m-4.786 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </S>
)
export const PencilIcon = ({ className }: P) => (
  <S className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13l-2.568.567.567-2.568a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
  </S>
)
export const CheckIcon = ({ className }: P) => (
  <S className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </S>
)
export const SearchIcon = ({ className }: P) => (
  <S className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </S>
)
export const SettingsIcon = ({ className }: P) => (
  <S className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.682.832.373.148.798.056 1.075-.248l.9-.953a1.125 1.125 0 0 1 1.586 0l1.832 1.832a1.125 1.125 0 0 1 0 1.586l-.953.9c-.304.277-.396.7-.248 1.075.146.369.458.62.832.682l1.281.213c.542.09.94.56.94 1.11v2.593c0 .55-.398 1.02-.94 1.11l-1.281.213a1.13 1.13 0 0 0-.832.682c-.148.373-.056.798.248 1.075l.953.9a1.125 1.125 0 0 1 0 1.586l-1.832 1.832a1.125 1.125 0 0 1-1.586 0l-.9-.953a1.13 1.13 0 0 0-1.075-.248 1.13 1.13 0 0 0-.682.832l-.213 1.281c-.09.542-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281a1.13 1.13 0 0 0-.682-.832 1.13 1.13 0 0 0-1.075.248l-.9.953a1.125 1.125 0 0 1-1.586 0L3.94 16.61a1.125 1.125 0 0 1 0-1.586l.953-.9c.304-.277.396-.7.248-1.075a1.13 1.13 0 0 0-.832-.682L3.063 12.61c-.542-.09-.94-.56-.94-1.11V9.906c0-.55.398-1.02.94-1.11l1.281-.213c.374-.063.686-.313.832-.682.148-.373.056-.798-.248-1.075l-.953-.9a1.125 1.125 0 0 1 0-1.586L5.617 3.94a1.125 1.125 0 0 1 1.586 0l.9.953c.277.304.7.396 1.075.248a1.13 1.13 0 0 0 .682-.832L9.594 3.94ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </S>
)
export const DownloadIcon = ({ className }: P) => (
  <S className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </S>
)
export const UploadIcon = ({ className }: P) => (
  <S className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </S>
)
export const MenuIcon = ({ className }: P) => (
  <S className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
  </S>
)
export const GiftIcon = ({ className }: P) => ( // fragile / vetro
  <S className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25M3 11.25v8.25M3 11.25h18M3 11.25C3 8.5 5.5 6 8.25 6h7.5C18.5 6 21 8.5 21 11.25M12 6v13.5M12 6c-.6-1.2-1.8-2-3-2a2.25 2.25 0 1 0 0 4.5h3M12 6c.6-1.2 1.8-2 3-2a2.25 2.25 0 1 1 0 4.5h-3" />
  </S>
)