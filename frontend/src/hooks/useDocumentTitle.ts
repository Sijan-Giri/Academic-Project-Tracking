import { useEffect } from 'react';

export function useDocumentTitle(title: string, suffix = ' - APTS') {
  useEffect(() => {
    document.title = `${title}${suffix}`;
  }, [title, suffix]);
}

export default useDocumentTitle;
