import { useEffect, useRef, type ReactNode } from 'react'

export interface ModalProps {
  open: boolean
  onClose: () => void
  labelledBy: string
  variant: 'sheet' | 'drawer'
  children: ReactNode
}

export function Modal({
  open,
  onClose,
  labelledBy,
  variant,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) {
        triggerRef.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null
        dialog.showModal()
      }

      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = prevOverflow
      }
    }

    if (dialog.open) {
      dialog.close()
    }
    const trigger = triggerRef.current
    if (trigger && document.contains(trigger)) {
      trigger.focus()
    }
    triggerRef.current = null
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (e: Event) => {
      e.preventDefault()
      onCloseRef.current()
    }

    const handleClose = () => {
      onCloseRef.current()
    }

    dialog.addEventListener('cancel', handleCancel)
    dialog.addEventListener('close', handleClose)
    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      dialog.removeEventListener('close', handleClose)
    }
  }, [])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  const variantClasses =
    variant === 'sheet'
      ? 'mt-auto mb-0 mx-auto w-full max-w-none max-h-[92dvh] rounded-t-2xl md:my-auto md:max-w-xl md:max-h-[88dvh] md:rounded-2xl transition-[transform,opacity] duration-200 ease-out starting:opacity-0 starting:translate-y-4 md:starting:translate-y-2'
      : 'm-0 ml-auto w-full max-w-none h-dvh max-h-dvh md:w-[440px] md:border-l md:border-line transition-[transform,opacity] duration-200 ease-out starting:opacity-0 starting:translate-x-4'

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      onClick={handleBackdropClick}
      className={`p-0 bg-paper text-ink shadow-xl overflow-hidden backdrop:bg-[rgba(35,28,24,0.5)] backdrop:transition-opacity backdrop:duration-200 starting:backdrop:opacity-0 ${variantClasses}`}
    >
      {open ? (
        <div className="flex flex-col w-full h-full max-h-[inherit] overflow-hidden">
          {children}
        </div>
      ) : null}
    </dialog>
  )
}
