import React from 'react';

export interface ICommonComponent {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  id?: string;
}

export interface ICommonModalProps extends ICommonComponent {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}
