import type { FC, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled, { css, keyframes } from 'styled-components';
import { SYNAPSE_OVERLAY } from '@/ui/theme/synapseTheme';
import { X } from "lucide-react";
import Button from "@/components/atoms/Button";
import { useKeyPress, useOnClickOutside } from "@/hooks/useCommon";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;

  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'palette';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventBodyScroll?: boolean;
  className?: string;

  variant?: 'default' | 'palette';
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const Overlay = styled.div<{ $isOpen: boolean; $variant: 'default' | 'palette' }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${SYNAPSE_OVERLAY.backdrop};
  backdrop-filter: ${SYNAPSE_OVERLAY.blur};
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => (props.$variant === 'palette' ? 'clamp(48px,6vw,64px)' : 'var(--spacing-md)')};

  animation: ${fadeIn} var(--duration-medium) var(--easing-ease-out);

  ${props =>
    !props.$isOpen &&
    css`
      display: none;
    `}
`;

const ModalContainer = styled.div<{ size: string; $variant: 'default' | 'palette' }>`
  background: ${props => (props.$variant === 'palette' ? '#0F141A' : SYNAPSE_OVERLAY.surface)};
  border: 1px solid
    ${props => (props.$variant === 'palette' ? 'rgba(255,255,255,0.08)' : SYNAPSE_OVERLAY.surfaceBorder)};
  border-radius: ${props => (props.$variant === 'palette' ? '6px' : 'var(--border-radius-lg)')};
  box-shadow: ${props =>
    props.$variant === 'palette'
      ? '0 14px 36px -8px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.03)'
      : SYNAPSE_OVERLAY.surfaceGlow};
  backdrop-filter: ${props => (props.$variant === 'palette' ? 'blur(10px) brightness(0.95)' : SYNAPSE_OVERLAY.blur)};
  max-height: ${props => (props.$variant === 'palette' ? '80vh' : '90vh')};
  overflow-y: auto;
  animation: ${slideUp} var(--duration-medium) var(--easing-ease-out);

  font-family: var(--font-mono, var(--font-code, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace));

  ${props => {
    switch (props.size) {
      case 'sm':
        return css`
          width: 100%;
          max-width: 400px;
        `;
      case 'md':
        return css`
          width: 100%;
          max-width: 600px;
        `;
      case 'lg':
        return css`
          width: 100%;
          max-width: 800px;
        `;
      case 'palette':
        return css`
          width: 100%;
          max-width: 960px;
          min-width: 640px;
        `;
      case 'xl':
        return css`
          width: 100%;
          max-width: 1200px;
        `;
      case 'full':
        return css`
          width: 100%;
          height: 100%;
          max-width: none;
          max-height: none;
          border-radius: 0;
        `;
      default:
        return css`
          width: 100%;
          max-width: 600px;
        `;
    }
  }}
`;

const ModalHeader = styled.div<{ $variant: 'default' | 'palette' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${p => (p.$variant === 'palette' ? '24px 24px 16px' : 'var(--spacing-lg)')};
  border-bottom: 1px solid
    ${p => (p.$variant === 'palette' ? 'rgba(255,255,255,0.06)' : 'var(--color-border)')};
  font-family: inherit;
`;

const ModalTitle = styled.h2<{ $variant: 'default' | 'palette' }>`
  margin: 0;
  font-size: ${p => (p.$variant === 'palette' ? '18px' : 'var(--font-size-lg)')};
  font-weight: ${p => (p.$variant === 'palette' ? 600 : 'var(--font-weight-semibold)')};
  color: var(--color-text);
  font-family: var(--font-mono, var(--font-code, 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace));
`;

const ModalContent = styled.div<{ $variant: 'default' | 'palette' }>`
  padding: ${p => (p.$variant === 'palette' ? '0 24px 24px' : 'var(--spacing-lg)')};
  font-family: inherit;
`;

export const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventBodyScroll = true,
  className,
  variant = 'default',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const escapePressed = useKeyPress('Escape');

  useOnClickOutside(modalRef as React.RefObject<HTMLElement>, () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  });


  useEffect(() => {
    if (escapePressed && closeOnEscape && isOpen) {
      onClose();
    }
  }, [escapePressed, closeOnEscape, isOpen, onClose]);


  useEffect(() => {
    if (preventBodyScroll && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
    return undefined;
  }, [preventBodyScroll, isOpen]);


  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const modalContent = (
  <Overlay $isOpen={isOpen} $variant={variant}>
      <ModalContainer
        ref={modalRef}
        size={size}
        $variant={variant}
        className={className}
        role="dialog"
        aria-modal={true}
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || showCloseButton) ? <ModalHeader $variant={variant}>
            {title ? <ModalTitle id="modal-title" $variant={variant}>{title}</ModalTitle> : null}
            {showCloseButton ? <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                icon={<X size={16} />}
                aria-label="Close modal"
              /> : null}
          </ModalHeader> : null}

        <ModalContent $variant={variant}>{children}</ModalContent>
      </ModalContainer>
    </Overlay>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
